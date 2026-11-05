const { test } = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

function compile(file, context) {
  const source = readFileSync(path.join(__dirname, file), "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, allowJs: true, jsx: ts.JsxEmit.ReactJSX },
    fileName: file,
  }).outputText;
  const module = { exports: {} };
  new vm.Script(compiled).runInNewContext({ exports: module.exports, ...context });
  return module.exports;
}

function loadRoute(createSession, env = { STRIPE_SECRET_KEY: "test-fixture" }) {
  let handler;
  const errors = [];
  compile("../../backend/routes/checkout.mjs", {
    process: { env },
    URL,
    console: { error: (...args) => errors.push(args) },
    require: (name) => {
      if (name === "express") return { Router: () => ({ post: (_path, callback) => { handler = callback; } }) };
      if (name === "stripe") return { default: class { checkout = { sessions: { create: createSession } }; } };
      throw new Error(`Unexpected import: ${name}`);
    },
  });
  return async (body) => {
    const response = {
      statusCode: 200,
      status(code) { this.statusCode = code; return this; },
      json(data) { this.data = data; return this; },
    };
    await handler({ body }, response);
    return { ...response, errors };
  };
}

const item = { name: "Headphones", description: "Wireless audio", quantity: 2, discountedPrice: 12.34, images: ["/image-unavailable.svg"] };

test("backend returns Stripe URL, uses current storefront and omits local image URLs", async () => {
  let payload;
  const route = loadRoute(async (data) => {
    payload = data;
    return { id: "cs_test", url: "https://checkout.stripe.com/c/pay/test" };
  });
  const result = await route({ items: [item], email: "test@example.com", origin: "http://127.0.0.1:5173" });
  assert.equal(result.statusCode, 200);
  assert.equal(result.data.url, "https://checkout.stripe.com/c/pay/test");
  assert.equal(payload.success_url, "http://127.0.0.1:5173/success/{CHECKOUT_SESSION_ID}");
  assert.equal(payload.cancel_url, "http://127.0.0.1:5173/cancel");
  assert.equal(payload.line_items[0].price_data.unit_amount, 1234);
  assert.equal(payload.line_items[0].quantity, 2);
  assert.equal("images" in payload.line_items[0].price_data.product_data, false);
});

test("configured storefront takes precedence over request origin", async () => {
  let payload;
  const route = loadRoute(async (data) => {
    payload = data;
    return { id: "cs_test", url: "https://checkout.stripe.com/c/pay/test" };
  }, { STRIPE_SECRET_KEY: "test-fixture", FRONTEND_URL: "https://store.example" });
  await route({ items: [item], email: "test@example.com", origin: "http://localhost:5173" });
  assert.equal(payload.cancel_url, "https://store.example/cancel");
});

test("invalid cart, email and origin are rejected without calling Stripe", async () => {
  let calls = 0;
  const route = loadRoute(async () => { calls++; });
  const base = { items: [item], email: "test@example.com", origin: "http://localhost:5173" };
  for (const body of [
    { ...base, items: [] },
    { ...base, items: [{ ...item, quantity: 0 }] },
    { ...base, items: [{ ...item, discountedPrice: -1 }] },
    { ...base, email: "" },
    { ...base, origin: "javascript:alert(1)" },
  ]) {
    assert.equal((await route(body)).statusCode, 400);
  }
  assert.equal(calls, 0);
});

test("missing and invalid Stripe keys return explicit configuration errors", async () => {
  const missing = await loadRoute(async () => assert.fail("Stripe must not be called"), {})({});
  assert.equal(missing.statusCode, 503);
  assert.match(missing.data.error, /not configured/);
  const invalid = await loadRoute(async () => {
    throw Object.assign(new Error("Invalid API Key"), { type: "StripeAuthenticationError" });
  })({ items: [item], email: "test@example.com" });
  assert.equal(invalid.statusCode, 503);
  assert.match(invalid.data.error, /key is invalid/);
  assert.equal(invalid.errors.length, 1);
});

test("Stripe failures and missing checkout URLs are never success-shaped", async () => {
  for (const create of [async () => { throw new Error("Provider unavailable"); }, async () => ({ id: "cs_test" })]) {
    const response = await loadRoute(create)({ items: [item], email: "test@example.com" });
    assert.equal(response.statusCode, 502);
    assert.match(response.data.error, /could not start checkout/);
  }
});

function loadClient(fetch) {
  return compile("../src/lib/checkout.ts", { fetch, URL, window: { location: { origin: "http://localhost:5173" } } });
}

test("frontend receives a valid hosted checkout URL and passes current origin", async () => {
  let request;
  const client = loadClient(async (_endpoint, options) => {
    request = JSON.parse(options.body);
    return { ok: true, json: async () => ({ url: "https://checkout.stripe.com/c/pay/test" }) };
  });
  assert.equal(await client.getCheckoutUrl("/checkout", [item], "test@example.com"), "https://checkout.stripe.com/c/pay/test");
  assert.equal(request.origin, "http://localhost:5173");
});

test("frontend surfaces API errors and rejects missing or unsafe redirects", async () => {
  const failed = loadClient(async () => ({ ok: false, json: async () => ({ error: "Stripe key is invalid" }) }));
  await assert.rejects(failed.getCheckoutUrl("/checkout", [item], "test@example.com"), /key is invalid/);
  for (const data of [{ id: "cs_test" }, { url: "http://checkout.stripe.com/test" }, { url: "https://example.com/test" }]) {
    const client = loadClient(async () => ({ ok: true, json: async () => data }));
    await assert.rejects(client.getCheckoutUrl("/checkout", [item], "test@example.com"), /checkout link/);
  }
});

function loadButton(getCheckoutUrl) {
  const state = [];
  const refs = [];
  let stateIndex = 0;
  let refIndex = 0;
  const redirects = [];
  const notifications = [];
  const component = compile("../src/ui/cart/CheckoutBtn.tsx", {
    Error,
    TypeError,
    window: { location: { assign: (url) => redirects.push(url) } },
    console: { error() {} },
    require: (name) => {
      if (name === "react/jsx-runtime") return {
        jsx: (type, props) => ({ type, props }),
        jsxs: (type, props) => ({ type, props }),
      };
      if (name === "react") return {
        useState: (initial) => {
          const index = stateIndex++;
          if (!(index in state)) state[index] = initial;
          return [state[index], (value) => { state[index] = value; }];
        },
        useRef: (initial) => {
          const index = refIndex++;
          return refs[index] ||= { current: initial };
        },
      };
      if (name === "../../lib/store") return { store: () => ({ currentUser: { email: "test@example.com" } }) };
      if (name === "../../assets/FrontendUtils") return { backendUrl: "http://localhost:8000" };
      if (name === "../../lib/checkout") return { getCheckoutUrl };
      if (name === "react-router-dom") return { Link: "a" };
      if (name === "react-hot-toast") return { default: { error: (message) => notifications.push(message) } };
      throw new Error(`Unexpected import: ${name}`);
    },
  }).default;
  return {
    redirects,
    notifications,
    render() {
      stateIndex = 0;
      refIndex = 0;
      return component({ products: [item], totalAmt: 24.68 });
    },
  };
}

test("checkout button prevents duplicate requests and navigates to the returned Stripe URL", async () => {
  let finish;
  let calls = 0;
  const button = loadButton(() => {
    calls++;
    return new Promise((resolve) => { finish = resolve; });
  });
  const click = button.render().props.children[0].props.onClick;
  const pending = click();
  assert.equal(button.render().props.children[0].props.disabled, true);
  await click();
  assert.equal(calls, 1);
  finish("https://checkout.stripe.com/c/pay/test");
  await pending;
  assert.deepEqual(button.redirects, ["https://checkout.stripe.com/c/pay/test"]);
});

test("failed checkout displays an error, does not navigate, and allows retry", async () => {
  const button = loadButton(async () => { throw new Error("Payments are not configured."); });
  await button.render().props.children[0].props.onClick();
  const rendered = button.render();
  assert.equal(rendered.props.children[0].props.disabled, false);
  assert.equal(rendered.props.children[1].props.role, "alert");
  assert.equal(rendered.props.children[1].props.children, "Payments are not configured.");
  assert.equal(button.redirects.length, 0);
  assert.deepEqual(button.notifications, ["Payments are not configured."]);
});
