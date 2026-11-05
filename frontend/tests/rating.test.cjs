const { test } = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");

const source = readFileSync(path.join(__dirname, "../src/ui/ProductRating.tsx"), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
}).outputText;
const exportsObject = {};
new vm.Script(compiled).runInNewContext({ exports: exportsObject, require });
const Rating = exportsObject.default;

function render(rating, reviews = 50) {
  return renderToStaticMarkup(React.createElement(Rating, { rating, reviews }));
}

function widths(markup) {
  return [...markup.matchAll(/style="width:([^%]+)%"/g)].map((match) => Number(match[1]));
}

test("stars show full, fractional and empty fills matching the exact score", () => {
  for (const [rating, expected] of [
    [0, [0, 0, 0, 0, 0]],
    [2.5, [100, 100, 50, 0, 0]],
    [4.2, [100, 100, 100, 100, 20]],
    [4.8, [100, 100, 100, 100, 80]],
    [5, [100, 100, 100, 100, 100]],
  ]) {
    const markup = render(rating);
    widths(markup).forEach((width, index) => assert.ok(Math.abs(width - expected[index]) < 0.00001));
    assert.equal(widths(markup).length, 5);
    assert.match(markup, new RegExp(`Demo rating: ${rating.toFixed(1)} out of 5 stars, 50 sample reviews`));
  }
});

test("every catalog product has a stable, varied demo rating with matching fill", () => {
  const catalog = require("../../shared/products.json");
  assert.ok(new Set(catalog.map((product) => product.rating)).size > 3);
  for (const product of catalog) {
    assert.ok(product.rating > 0 && product.rating <= 5);
    assert.ok(Number.isInteger(product.reviews) && product.reviews > 0);
    const markup = render(product.rating, product.reviews);
    assert.equal(markup, render(product.rating, product.reviews));
    assert.match(markup, /not verified customer reviews/);
    const sum = widths(markup).reduce((total, width) => total + width, 0);
    assert.ok(Math.abs(sum - product.rating * 100) < 0.00001);
  }
});

test("cards and product details both use the same rating renderer", () => {
  for (const file of ["../src/ui/ProductCard.tsx", "../src/pages/Product.tsx"]) {
    const content = readFileSync(path.join(__dirname, file), "utf8");
    assert.match(content, /<ProductRating rating=\{/);
    assert.doesNotMatch(content, /MdOutlineStarOutline/);
  }
});
