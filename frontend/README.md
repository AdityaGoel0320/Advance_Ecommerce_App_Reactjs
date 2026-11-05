# React + TypeScript + Vite

## Storefront UI

The storefront uses Tailwind CSS with shared semantic color tokens, responsive
navigation, product grids, and accessible motion. Use the sun/moon button in the
header to switch themes. The initial theme follows your system preference;
an explicit choice is saved locally and synchronized between tabs.
Animations respect `prefers-reduced-motion`. Search, account, cart, checkout,
and orders retain their existing API and store integrations.

Checkout redirects to the Stripe-hosted URL returned by the backend; no
frontend Stripe publishable key is required. Configure `STRIPE_SECRET_KEY` in
the backend environment. Optionally set `FRONTEND_URL` to your deployed
storefront origin; otherwise checkout returns to the requesting storefront
(including localhost). Errors appear below Checkout, and duplicate clicks are
blocked while a session is being created.

Run `npm run build` for type checking and a production build, and `npm test`
for regression tests. No formatting task is required.

## Catalog images, currency, and accounts

All prices use Indian Rupees with `en-IN` grouping. The 25-product demo catalog
in `../shared/products.json` provides unique descriptions, sensible illustrative
INR prices, and category-matched images. It is shared by frontend and backend.
Persisted cart and wishlist items refresh by product ID while preserving
quantities. Historical paid order totals are not rewritten.

Stripe uses catalog names, descriptions and prices, never client-supplied
copies. Delivery and tax estimates come from `../shared/checkoutCharges.json`
and are included in the Stripe total. Promotional starting prices are computed
from the corresponding catalog category. Product cards show unit prices even
when more than one item is in the cart.

Catalog photos are bundled under `public/catalog`, so the storefront no longer
depends on the retired image links. Run `npm run images:sync` to refresh them.
The script keeps legacy image mappings current with licensed, category-appropriate
[Unsplash photos](https://unsplash.com/license), with source photo IDs recorded
in the script. TV boxes, streaming sticks, controllers, writing pads, glue guns
and other distinct devices use locally authored square SVG illustrations
instead of unrelated photos. These are demo images, not verified manufacturer
photos. Products use equal-height image frames; category thumbnails are circular.
Legacy cart and order placeholders also resolve to their category photos.

Loading indicators render within their content area rather than obscuring the
whole page. Sign-in uses a compact status indicator and disabled submit button.
All spinner motion respects reduced-motion preferences.

The account page includes editable names, profile photo upload, initials when
no photo is available, cart/wishlist summaries, order links, and account status.
Photos support JPG, PNG, and WebP up to 5 MB. Saving uses Firebase Auth and
Firestore; uploads require Firebase Storage permissions for the signed-in user.
Failures are shown explicitly, including partial extended-profile saves.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default {
  // other rules...
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
}
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list
