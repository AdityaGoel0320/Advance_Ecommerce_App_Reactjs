# YourKart - E-commerce Demo

YourKart is a responsive storefront built with React, TypeScript, Vite, Tailwind CSS,
Express, Firebase, and Stripe test checkout.

[Live deployment](https://shopp-my-frontend.vercel.app/) may lag behind this repository.

## Features

- Responsive product grids, search, categories, pagination, cart, and favorites.
- Persistent light/dark themes, accessible loading states, and reduced-motion support.
- Matching YourKart branding and a custom shopping-bag SVG favicon.
- Firebase Authentication, editable profiles, and optional profile photo uploads.
- A shared 25-product catalog with descriptive copy and illustrative INR pricing.
- Filled and fractional stars based on each product's rating, with a numeric
  score and review count. Ratings vary by product and remain stable across
  renders, refreshes, search, and detail pages rather than randomizing each visit.
  Ratings and counts are explicitly labeled demo data, not verified reviews.
- Stripe-hosted test checkout, payment verification, retryable order saving,
  and account-specific order history.

## Project structure

- `frontend/`: React storefront, public catalog images, and regression tests.
- `backend/`: Express API for products, categories, promotions, blogs, and checkout.
- `shared/products.json`: Canonical product data used by both applications.
- `shared/checkoutCharges.json`: Shared delivery and tax estimates.
- `firestore.rules` and `firebase.json`: Versioned Firestore access rules and deployment config.

The database is Cloud Firestore, not MongoDB.

## Local setup

Use Node.js 20.19+ or 22.12+ and npm (current Firebase CLI requirements).
From the repository root:

```powershell
npm --prefix frontend ci
npm --prefix backend ci
```

Create `backend/.env` (never commit secrets):

```dotenv
PORT=8000
STRIPE_SECRET_KEY=your_stripe_test_secret_key
# Optional: force checkout returns to a deployed storefront.
# FRONTEND_URL=https://your-storefront.example
```

Start the services in separate terminals:

```powershell
npm --prefix backend start
```

```powershell
npm --prefix frontend run dev
```

Open the Vite URL printed in the terminal, normally `http://localhost:5173`.
The frontend API location is configured in `frontend/src/assets/FrontendUtils.tsx`.
Firebase client configuration is in `frontend/src/lib/firebase.ts`; use your own
project for an independent deployment. Firebase client configuration is public;
Stripe secret keys and service credentials must remain server-side.

## Catalog, images, and ratings

All monetary amounts use INR with Indian digit grouping. Prices are illustrative
demo amounts, not live retailer quotations. Cards show unit prices; cart totals
multiply by quantity. Persisted carts and favorites refresh catalog fields by ID
without losing quantities. Historical orders retain their paid prices.

Bundled images in `frontend/public/catalog/` include licensed
[Unsplash photos](https://unsplash.com/license) and locally authored SVG device
illustrations. They are representative, not verified exact-SKU photography.
Product image frames have consistent heights; category thumbnails are circular.
Legacy image links resolve through `frontend/src/lib/catalogImages.json`.

```powershell
npm --prefix frontend run images:sync
```

The sync script records source photo IDs, preserves the manifest on download
failure, and reports errors. Commit refreshed assets alongside the manifest.
Edit `shared/products.json` to change demo ratings or review counts. The same
rating component displays exact fractional fill on cards and product details.

## Checkout and orders

Stripe uses server catalog names, descriptions, and prices, not client copies.
Delivery and tax estimates are included in both cart and Stripe totals; these
are demo estimates, not a production tax calculation. No frontend Stripe
publishable key is required. Unless `FRONTEND_URL` is set, Stripe returns to
the requesting storefront origin.

### Sample card details for testing

Use **Stripe test mode only**, never real card details:

| Field | Test value |
| --- | --- |
| Card number | `4000 0035 6000 0008` |
| Expiry date | Any valid future month and year |
| CVV / CVC | Any three digits other than `000` (for example, `123`) |
| Cardholder name | Any name |

If Stripe displays a test authentication prompt, complete it to finish checkout.
Alternatively, use `4242 4242 4242 4242` for a standard successful test payment.
See [Stripe testing documentation](https://docs.stripe.com/testing) for other scenarios.

On `/success/{CHECKOUT_SESSION_ID}`, the backend verifies the session is paid
and belongs to the checkout email, then recovers purchased products from Stripe.
The frontend saves the order at `orders/{checkoutEmail}` using a transaction
deduplicated by payment session ID. This works even if the cart is empty.
Only a newly saved purchase matching the current cart clears that cart.

Orders wait for authentication and reload when the signed-in email changes.
Verification, permissions, and save failures show explicit errors and retry
actions instead of claiming success. To recover a missing order, sign in with
the checkout email and reopen the original confirmation URL, then retry saving.
Older sessions are recoverable when their purchased names match the catalog.

## Firebase permissions

In your Firebase project:

1. Enable Email/Password authentication.
2. Add localhost and deployment domains to Authentication's authorized domains.
3. Sign in to Firebase CLI with an account authorized to deploy project rules.
4. Deploy Firestore rules from the repository root:

```powershell
npx firebase-tools login
npx firebase-tools deploy --only firestore:rules --project ecommerceyt-2646a
```

Rules permit individual profile access by Firebase UID and order document access
by the authenticated email. New orders are append-only; modifying historical
orders, deleting orders, collection listing, and other-account access are denied.
The former time-limited test rules expired in July 2024; do not restore them or
make the database publicly writable.

Profile photos accept JPG, PNG, and WebP up to 5 MB. Configure the project's
Firebase Storage bucket and account-only Storage permissions separately;
deploying Firestore rules does not change Storage rules.

## Verification

```powershell
npm --prefix frontend test
npm --prefix frontend run build
```

Tests cover catalog assets, INR formatting, rating rendering, theme persistence,
authentication, profile updates, checkout errors, payment verification, order
deduplication, and recovery. Payment and Firestore unit tests use mocks: they do
not charge cards, create real accounts, or prove production payment completion.
Build performs TypeScript checking followed by a Vite production build.
No formatting task is required.

## Deployment and production limitations

For Vercel, use `frontend` as the root directory, `npm run build` as the build
command, and `dist` as the output directory. Deploy the Express backend separately,
set its environment variables, and configure the frontend API location.
Local changes do not automatically update deployed applications.

This is a portfolio demo, not production fulfillment. Ratings, images, shipping
messages, prices, and charges are illustrative. Firestore rules protect account
access but do not cryptographically verify client-submitted payment data.
Production orders must be written by a trusted server using authenticated
requests and verified Stripe webhooks, independent of browser return navigation.
Confirm real inventory, taxes, delivery, returns, and warranty policies before
commercial use.
