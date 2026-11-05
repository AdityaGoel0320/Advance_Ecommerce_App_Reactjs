const { test } = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

function loadStore(getDoc, persistedState) {
  const auth = { currentUser: { uid: "test-user", email: "customer@example.com", displayName: "Test Customer" } };
  const storage = new Map();
  if (persistedState) storage.set("store-storage", JSON.stringify({ state: persistedState }));
  const source = readFileSync(path.join(__dirname, "../src/lib/store.ts"), "utf8");
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const module = { exports: {} };
  const context = vm.createContext({
    exports: module.exports,
    require: (name) => {
      if (name === "./firebase") return { auth, db: {} };
      if (name === "firebase/firestore") return { doc: () => ({}), getDoc };
      return require(name);
    },
    console: { log() {} },
    localStorage: {
      getItem: (name) => storage.get(name) || null,
      setItem: (name, value) => storage.set(name, value),
      removeItem: (name) => storage.delete(name),
    },
  });
  new vm.Script(compiled).runInContext(context);
  return { store: module.exports.store, auth, storage };
}

test("a rejected profile request preserves sign-in and clears loading", async () => {
  const { store } = loadStore(async () => { throw new Error("permission-denied"); });
  await store.getState().getUserInfo("test-user");
  assert.equal(store.getState().currentUser.id, "test-user");
  assert.equal(store.getState().isLoading, false);
});

test("a missing profile uses Firebase account details", async () => {
  const { store } = loadStore(async () => ({ exists: () => false }));
  await store.getState().getUserInfo("test-user");
  assert.equal(store.getState().currentUser.firstName, "Test Customer");
  assert.equal(store.getState().currentUser.email, "customer@example.com");
});

test("a late profile response cannot restore a signed-out user", async () => {
  let finish;
  const { store, auth } = loadStore(() => new Promise((resolve) => { finish = resolve; }));
  const pending = store.getState().getUserInfo("test-user");
  assert.equal(store.getState().isLoading, false);
  auth.currentUser = null;
  await store.getState().getUserInfo(undefined);
  finish({ exists: () => true, data: () => ({ firstName: "Old profile" }) });
  await pending;
  assert.equal(store.getState().currentUser, null);
});

test("legacy persisted users are ignored while cart items are retained", () => {
  const { store } = loadStore(async () => ({}), {
    currentUser: { id: "stale-user" },
    isLoading: false,
    cartProduct: [{ _id: 1, quantity: 2 }],
    favoriteProduct: [],
  });

  assert.equal(store.getState().currentUser, null);
  assert.equal(store.getState().isLoading, true);
  assert.equal(store.getState().cartProduct[0].quantity, 2);
});

test("a missing Firestore avatar does not override the Firebase profile photo", async () => {
  const { store, auth } = loadStore(async () => ({
    exists: () => true,
    data: () => ({ firstName: "Test", avatar: null, email: "stale@example.com" }),
  }));
  auth.currentUser.photoURL = "https://storage.example/avatar.jpg";
  await store.getState().getUserInfo("test-user");
  assert.equal(store.getState().currentUser.avatar, "https://storage.example/avatar.jpg");
  assert.equal(store.getState().currentUser.email, "customer@example.com");
});