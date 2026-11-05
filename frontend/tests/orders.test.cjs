const { test } = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

function compile(file, require, globals = {}) {
  const exports = {};
  const source = ts.transpileModule(readFileSync(path.join(__dirname, file), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
    fileName: file,
  }).outputText;
  new vm.Script(source.replaceAll("import.meta.env.BASE_URL", '"/"')).runInNewContext({ exports, require, Error, console: { error() {} }, ...globals });
  return exports;
}

const order = {
  paymentId: "cs_paid", paymentMethod: "stripe", userEmail: "customer@example.com",
  totalAmount: 1839,
  orderItems: [{ ...require("../../shared/products.json")[6], quantity: 1 }],
};

function loadHelper({ stored, failSave = false, response = { order }, ok = true } = {}) {
  let document = stored;
  let writes = 0;
  const snapshot = () => ({ exists: () => !!document, data: () => document });
  const api = compile("../src/lib/orders.ts", (name) => {
    if (name === "./firebase") return { db: {} };
    if (name === "firebase/firestore") return {
      doc: (_db, collection, email) => {
        assert.equal(collection, "orders");
        assert.equal(email, order.userEmail);
        return {};
      },
      getDoc: async () => snapshot(),
      runTransaction: async (_db, callback) => {
        if (failSave) throw new Error("Permission denied");
        return callback({
          get: async () => snapshot(),
          set: (_ref, data) => { document = data; writes++; },
        });
      },
    };
    throw new Error(`Unexpected import ${name}`);
  }, { fetch: async () => ({ ok, json: async () => response }) });
  return { api, writes: () => writes };
}

test("paid order persists and is visible; retries do not duplicate it", async () => {
  const helper = loadHelper();
  assert.equal((await helper.api.confirmAndSaveOrder("/confirm", order.paymentId, order.userEmail)).newlySaved, true);
  assert.equal((await helper.api.confirmAndSaveOrder("/confirm", order.paymentId, order.userEmail)).newlySaved, false);
  const orders = await helper.api.loadOrders(order.userEmail);
  assert.equal(orders.length, 1);
  assert.equal(orders[0].paymentId, order.paymentId);
  assert.equal(orders[0].totalAmount, 1839);
  assert.equal(helper.writes(), 1);
});

test("existing orders are retained and missing documents read as empty", async () => {
  const helper = loadHelper({ stored: { orders: [{ ...order, paymentId: "cs_old" }] } });
  await helper.api.confirmAndSaveOrder("/confirm", order.paymentId, order.userEmail);
  assert.equal((await helper.api.loadOrders(order.userEmail)).length, 2);
  assert.equal((await loadHelper().api.loadOrders(order.userEmail)).length, 0);
});

test("verification, malformed responses and Firestore failures never claim a saved order", async () => {
  for (const [options, message] of [
    [{ failSave: true }, /Permission denied/],
    [{ ok: false, response: { error: "Payment pending" } }, /Payment pending/],
    [{ response: { order: { ...order, paymentId: "cs_other" } } }, /invalid order/],
    [{ stored: { orders: "corrupt" } }, /could not be read/],
  ]) {
    await assert.rejects(loadHelper(options).api.confirmAndSaveOrder("/confirm", order.paymentId, order.userEmail), message);
  }
});

function page(file, state, mocks) {
  let cursor = 0;
  const values = [];
  let effect;
  let dependencies;
  const component = compile(file, (name) => {
    if (name === "react") return {
      useState: (initial) => {
        const index = cursor++;
        if (!(index in values)) values[index] = initial;
        return [values[index], (value) => { values[index] = typeof value === "function" ? value(values[index]) : value; }];
      },
      useEffect: (callback, deps) => { effect = callback; dependencies = deps; },
    };
    if (name === "react/jsx-runtime") return { jsx: (type, props) => ({ type, ...props }), jsxs: (type, props) => ({ type, ...props }) };
    if (name === "../lib/store") return { store: Object.assign(() => state, { getState: () => state }) };
    if (name === "../lib/orders") return mocks;
    if (name === "react-router-dom") return { Link: "Link", useParams: () => ({ sessionId: "cs_paid" }) };
    if (name === "../assets/FrontendUtils") return { backendUrl: "/api" };
    if (name === "react-hot-toast") return { default: { success() {}, error() {} } };
    if (name === "@headlessui/react") return { Disclosure: "Disclosure", DisclosureButton: "button", DisclosurePanel: "panel" };
    if (name === "react-icons/fa6") return { FaMinus: "minus", FaPlus: "plus" };
    if (name === "../lib/catalogImage") return { resolveCatalogImage: (image) => image };
    if (name.startsWith("../ui/")) return { default: "ui" };
    throw new Error(`Unexpected import ${name}`);
  }).default;
  return {
    render: () => { cursor = 0; return component(); },
    effect: () => effect(),
    dependencies: () => dependencies,
    values,
  };
}

test("Orders waits for authentication and fetches when the email becomes available", async () => {
  const state = { currentUser: null, isLoading: true };
  let reads = 0;
  const fixture = page("../src/pages/Orders.tsx", state, { loadOrders: async () => { reads++; return [order]; } });
  fixture.render();
  fixture.effect();
  assert.equal(reads, 0);
  state.currentUser = { email: order.userEmail };
  state.isLoading = false;
  fixture.render();
  assert.ok(fixture.dependencies().includes(order.userEmail));
  fixture.effect();
  await new Promise(setImmediate);
  assert.equal(reads, 1);
  assert.equal(fixture.values[0].length, 1);
});

test("confirmation preserves cart on save failure and clears matching purchased items after retry", async () => {
  let clears = 0;
  let fail = true;
  const state = { currentUser: null, isLoading: true, cartProduct: order.orderItems, resetCart: () => clears++ };
  const fixture = page("../src/pages/Success.tsx", state, {
    confirmAndSaveOrder: async () => { if (fail) throw new Error("Permission denied"); return { order, newlySaved: true }; },
  });
  fixture.render();
  fixture.effect();
  state.currentUser = { email: order.userEmail };
  state.isLoading = false;
  fixture.render();
  fixture.effect();
  await new Promise(setImmediate);
  assert.equal(fixture.values[0], "error");
  assert.equal(clears, 0);
  fail = false;
  fixture.render();
  fixture.effect();
  await new Promise(setImmediate);
  assert.equal(fixture.values[0], "saved");
  assert.equal(clears, 1);
});

test("recovering old payments without a cart works and never clears a later cart", async () => {
  for (const [cartProduct, newlySaved] of [
    [[], true],
    [[{ ...order.orderItems[0], quantity: 5 }], true],
    [order.orderItems, false],
  ]) {
    const state = { currentUser: { email: order.userEmail }, isLoading: false, cartProduct, resetCart: () => assert.fail("Must preserve later cart") };
    const fixture = page("../src/pages/Success.tsx", state, {
      confirmAndSaveOrder: async () => ({ order, newlySaved }),
    });
    fixture.render();
    fixture.effect();
    await new Promise(setImmediate);
    assert.equal(fixture.values[0], "saved");
  }
});
