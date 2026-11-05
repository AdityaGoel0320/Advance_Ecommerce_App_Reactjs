const { test } = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

function load(file, requireModule = require) {
  const source = readFileSync(path.join(__dirname, file), "utf8");
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const module = { exports: {} };
  new vm.Script(compiled).runInNewContext({ exports: module.exports, require: requireModule, console, Error });
  return module.exports;
}

test("INR formatting uses Indian grouping for every monetary amount", () => {
  const { formatINR } = load("../src/lib/currency.ts");
  assert.equal(formatINR(1234567.5), "\u20b912,34,567.50");
  assert.equal(formatINR(40), "\u20b940.00");
  assert.equal(formatINR(), "\u20b90.00");
});

test("all product, category and legacy image references have bundled matching assets", async () => {
  const catalog = await import("../../backend/constants/index.mjs");
  const manifest = require("../src/lib/catalogImages.json");
  const sources = Object.values(manifest);
  const collect = (value) => {
    if (typeof value === "string" && value.startsWith("/catalog/")) sources.push(value);
    else if (Array.isArray(value)) value.forEach(collect);
    else if (value && typeof value === "object") Object.values(value).forEach(collect);
  };
  collect(catalog);
  assert.equal(Object.keys(manifest).length, 42);
  for (const local of sources) {
    assert.ok(local?.startsWith("/catalog/"));
    const bytes = readFileSync(path.join(__dirname, "../public", local));
    if (local.endsWith(".svg")) {
      assert.match(bytes.toString(), /viewBox="0 0 600 600"/);
    } else {
      assert.ok(bytes.length > 5000, `${local} is unexpectedly small`);
      assert.equal(bytes[0], 0xff);
      assert.equal(bytes[1], 0xd8);
    }
  }
  assert.ok(catalog.highlightsProducts.every((item) => !item.title.includes("$")));
});

test("every product has unique realistic copy, sensible INR pricing and a matching image", async () => {
  const { products, categories, highlightsProducts } = await import("../../backend/constants/index.mjs");
  assert.equal(products.length, 25);
  assert.equal(new Set(products.map((item) => item._id)).size, 25);
  assert.equal(new Set(products.map((item) => item.description)).size, 25);
  for (const item of products) {
    assert.doesNotMatch(JSON.stringify(item), /lorem|ipsum|Samsung|Redmi|Xiaomi/i);
    assert.ok(item.description.length > 100);
    assert.ok(item.discountedPrice >= 699);
    assert.ok(item.regularPrice > item.discountedPrice);
    assert.equal(item.images.length, 1);
    if (item._base === "cellPhones") assert.ok(item.discountedPrice >= 10000);
    if (item._base === "computersAndLaptop") assert.ok(item.discountedPrice >= 30000);
    if (item._base === "robotClean") assert.ok(item.discountedPrice >= 20000);
    if (item._base === "tvBox") assert.match(item.images[0], /tv-(box|stick)\.svg/);
  }
  assert.match(categories.find((item) => item._base === "tvBox").image, /tv-box\.svg/);
  for (const highlight of highlightsProducts) {
    const base = highlight._base.split("/").pop();
    const minimum = Math.min(...products.filter((item) => item._base === base).map((item) => item.discountedPrice));
    assert.equal(highlight.startingPrice, minimum);
  }
});

test("shared catalog refresh replaces obsolete data and retains cart quantities", () => {
  const api = load("../src/lib/catalog.ts", (name) =>
    name === "../../../shared/products.json" ? { default: require("../../shared/products.json") } : require(name));
  const result = api.refreshCatalogItems([
    { _id: 2010, quantity: 4, discountedPrice: 40, description: "Lorem ipsum" },
    { _id: 2013, quantity: 2, images: ["/catalog/speaker.jpg"] },
  ]);
  assert.equal(result[0].discountedPrice, 14999);
  assert.equal(result[0].quantity, 4);
  assert.doesNotMatch(result[0].description, /lorem/i);
  assert.equal(result[1].images[0], "/catalog/tv-box.svg");
});

test("loader is an accessible in-flow status, not a page-covering overlay", () => {
  const source = readFileSync(path.join(__dirname, "../src/ui/Loading.tsx"), "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const module = { exports: {} };
  new vm.Script(compiled).runInNewContext({
    exports: module.exports,
    require: () => ({ jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) }),
  });
  for (const compact of [false, true]) {
    const loader = module.exports.default({ compact, label: "Getting your products..." });
    assert.equal(loader.props.role, "status");
    assert.equal(loader.props["aria-live"], "polite");
    assert.doesNotMatch(loader.props.className, /absolute|fixed|bg-black|h-full/);
  }
  assert.match(source, /motion-safe:animate-spin/);
});

test("legacy cart and order placeholders recover category images without changing real photos", () => {
  const { resolveCatalogImage } = load("../src/lib/catalogImage.ts", (name) =>
    name === "./catalogImages.json" ? { default: require("../src/lib/catalogImages.json") } : require(name));
  assert.equal(resolveCatalogImage("/image-unavailable.svg", "cellPhones"), "/catalog/phone.jpg");
  assert.equal(resolveCatalogImage("/image-unavailable.svg", "TV & Audio"), "/catalog/speaker.jpg");
  assert.equal(resolveCatalogImage(undefined, "headphones", "/shop/"), "/shop/catalog/headphones.jpg");
  assert.equal(resolveCatalogImage("https://seller.example/photo.jpg", "headphones"), "https://seller.example/photo.jpg");
});

function loadProfile(options = {}) {
  const user = { uid: "test-user", photoURL: "", ...options.user };
  const auth = { currentUser: user };
  const writes = [];
  const updates = [];
  const state = [];
  const api = load("../src/lib/profile.ts", (name) => {
    if (name === "./firebase") return { auth, db: {} };
    if (name === "firebase/auth") return { updateProfile: async (_user, data) => {
      if (options.authError) throw new Error("Auth update failed");
      updates.push(data);
    } };
    if (name === "firebase/firestore") return {
      doc: () => ({}),
      setDoc: async (_ref, data) => {
        if (options.firestoreError) throw new Error("Firestore unavailable");
        writes.push(data);
      },
    };
    if (name === "./store") return { store: { setState: (data) => state.push(data) } };
    if (name === "./upload") return { default: async () => {
      if (options.uploadError) throw new Error("Upload failed");
      return "https://storage.example/avatar.jpg";
    } };
    throw new Error(`Unexpected import: ${name}`);
  });
  return { ...api, auth, writes, updates, state };
}

const profile = { id: "test-user", firstName: "Test", lastName: "User", email: "test@example.com", avatar: "" };

test("profile photo validation accepts supported images and rejects unsafe or oversized files", () => {
  const { validateProfileImage } = loadProfile();
  validateProfileImage({ type: "image/jpeg", size: 1000 });
  validateProfileImage({ type: "image/webp", size: 5 * 1024 * 1024 });
  assert.throws(() => validateProfileImage({ type: "image/svg+xml", size: 1000 }), /JPG, PNG, or WebP/);
  assert.throws(() => validateProfileImage({ type: "image/png", size: 5 * 1024 * 1024 + 1 }), /5 MB/);
});

test("name and photo updates persist to Auth, Firestore and the active account", async () => {
  const api = loadProfile();
  assert.equal(await api.saveAccountProfile(profile, " Ada ", " Lovelace ", { type: "image/png", size: 1000 }), null);
  assert.equal(api.updates[0].displayName, "Ada Lovelace");
  assert.equal(api.updates[0].photoURL, "https://storage.example/avatar.jpg");
  assert.equal(api.writes[0].firstName, "Ada");
  assert.equal(api.state[0].currentUser.avatar, "https://storage.example/avatar.jpg");
});

test("partial Firestore failures report a warning, while upload failures preserve the old account", async () => {
  const partial = loadProfile({ firestoreError: true });
  const warning = await partial.saveAccountProfile(profile, "Ada", "Lovelace", null);
  assert.match(warning, /additional profile details could not be saved/);
  assert.equal(partial.state[0].currentUser.firstName, "Ada");
  const failed = loadProfile({ uploadError: true });
  await assert.rejects(failed.saveAccountProfile(profile, "Ada", "", { type: "image/png", size: 1000 }), /Upload failed/);
  assert.equal(failed.updates.length, 0);
  assert.equal(failed.state.length, 0);
});

test("profile changes reject missing names and stale sessions", async () => {
  const api = loadProfile();
  await assert.rejects(api.saveAccountProfile(profile, " ", "", null), /first name/);
  api.auth.currentUser = null;
  await assert.rejects(api.saveAccountProfile(profile, "Ada", "", null), /sign in again/);
  assert.equal(api.updates.length, 0);
});
