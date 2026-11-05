const { test } = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

function loadTheme(saved, systemDark = false, blocked = false) {
  const root = { dataset: {}, classList: { toggle: (name, value) => { root[name] = value; } } };
  const errors = [];
  const storage = new Map(saved === undefined ? [] : [["commerce-theme", saved]]);
  const module = { exports: {} };
  const source = readFileSync(path.join(__dirname, "../src/lib/theme.ts"), "utf8");
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const context = vm.createContext({
    exports: module.exports,
    window: { matchMedia: () => ({ matches: systemDark }) },
    document: { documentElement: root },
    console: { error: (...args) => errors.push(args) },
    localStorage: {
      getItem: (key) => {
        if (blocked) throw new Error("Storage blocked");
        return storage.get(key) ?? null;
      },
      setItem: (key, value) => {
        if (blocked) throw new Error("Storage blocked");
        storage.set(key, value);
      },
    },
  });
  new vm.Script(compiled).runInContext(context);
  return { ...module.exports, root, storage, errors };
}

test("first visit follows the system theme", () => {
  assert.equal(loadTheme(undefined, true).readTheme(), "dark");
  assert.equal(loadTheme(undefined, false).readTheme(), "light");
});

test("saved theme overrides the system and invalid values do not", () => {
  assert.equal(loadTheme("light", true).readTheme(), "light");
  assert.equal(loadTheme("dark", false).readTheme(), "dark");
  assert.equal(loadTheme("invalid", true).readTheme(), "dark");
});

test("switching themes updates the document and persists the choice", () => {
  const theme = loadTheme();
  assert.equal(theme.saveTheme("dark"), true);
  assert.equal(theme.root.dark, true);
  assert.equal(theme.root.dataset.theme, "dark");
  assert.equal(theme.storage.get("commerce-theme"), "dark");
  theme.saveTheme("light");
  assert.equal(theme.root.dark, false);
  assert.equal(theme.root.dataset.theme, "light");
});

test("blocked storage still applies the theme and reports persistence failure", () => {
  const theme = loadTheme(undefined, true, true);
  assert.equal(theme.readTheme(), "dark");
  assert.equal(theme.saveTheme("light"), false);
  assert.equal(theme.root.dataset.theme, "light");
  assert.equal(theme.errors.length, 2);
});
