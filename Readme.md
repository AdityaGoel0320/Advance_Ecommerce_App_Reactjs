# Shopp.my - One Stop place for your ecommerce needs

Shopp.my is a **full-featured e-commerce web application** built using **Firebase**, **Firebase Storage**, and the **MERN stack** with **TypeScript**. It includes the following features:

- **User Authentication**: Login and logout functionality using **Firebase Authentication**.
- **Large Product Database**: Efficiently handle and display a large number of products.
- **Responsive Design**: Fully responsive layout for seamless use on all devices.
- **Dynamic Cart**: Add, remove, and update products in the cart dynamically.
- **Pagination**: Efficiently paginate through large sets of products.
- **Real-Time Filtering System**: Manage and filter products in real-time.
- **Dynamic Routing**: Implemented dynamic routing for a seamless user experience.
- **Payment Integration**: Complete payment processing using **Stripe**.
- **Order Management**: Manage user orders and order history.

## Live Deployed Link
https://shopp-my-frontend.vercel.app/

## Payment Gateway Testing

The payment gateway is currently in testing mode. To test the payment functionality, use the following sample card details:

- **Card Number**: 4000 0035 6000 0008
- **Expiry Date**: Any valid future date
- **CVC**: Any three-digit number (other than 000)

Feel free to try it out and ensure everything works smoothly!

## Shopp.my UI
![qqqqqqq](https://github.com/AdityaGoel0320/Advance_Ecommerce_App_Reactjs/assets/112582770/ab97bab1-d0d0-4adc-9290-761ada17d146)


## Product Page ScreenShot
![Screenshot 2024-07-07 181904](https://github.com/AdityaGoel0320/Advance_Ecommerce_App_Reactjs/assets/112582770/680d7759-6dd9-4153-8a75-6ad9b000a2d9)


## Cart Page ScreenShot
![Screenshot 2024-07-07 182015](https://github.com/AdityaGoel0320/Advance_Ecommerce_App_Reactjs/assets/112582770/a5a52a42-bf3d-482c-966f-99594fcf7933)


## Checkout Page ScreenShot
![Screenshot 2024-07-07 182148](https://github.com/AdityaGoel0320/Advance_Ecommerce_App_Reactjs/assets/112582770/366c7c5c-7964-45f0-bb86-041648583492)


## Succesfull payment Page
![Screenshot 2024-07-07 182228](https://github.com/AdityaGoel0320/Advance_Ecommerce_App_Reactjs/assets/112582770/61b6d4f8-56ba-4f56-8f39-f33609a1cec5)


## **Installation**

To run Shopp.my locally, follow these steps:

1. Clone the repository:

   ```bash
   git clone https://github.com/AdityaGoel0320/Advance_Ecommerce_App_Reactjs.git
   ```

2. Install dependencies for both frontend and backend:

   ```bash
   cd shopp-my/client
   npm install
   cd ../admin
   npm install
   ```

3. Create a `.env` file in the backend directory and add the following configurations:

   ```plaintext
   PORT=your_port_number
   STRIPE_SECRET_KEY=your_stripe_secret_key
   ```

4. Start the development server:

   ```bash
   cd ../client
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## Repair, Verification, and Deployment

From the repository root:

```bash
npm --prefix client ci
npm --prefix client test
npm --prefix client run build
npm --prefix client run dev
```

Authentication is observed across all pages. A missing or inaccessible Firestore
profile no longer prevents a Firebase-authenticated user from signing in, and a
product API outage no longer blocks the account page. Cart and favorites remain
saved locally, but authentication state comes from Firebase instead of a stale
local user record.

### Missing Images

The original ImgBB catalogue links are unavailable. All 42 image references now
map to bundled, category-appropriate photos in `frontend/public/catalog/`,
including products, categories, promotional banners, and blog cards.
Licensed [Unsplash photos](https://unsplash.com/license) and locally authored
device illustrations provide representative demo imagery, not verified
photographs of every exact SKU. Replace the mappings
in `frontend/src/lib/catalogImages.json` with seller-provided SKU photos before
production use.

Run `npm --prefix frontend run images:sync` to refresh the bundled photos.
Source photo IDs are recorded in `frontend/scripts/sync-images.mjs`. Failed
downloads leave the existing manifest intact and report an error. Commit the
downloaded assets with the manifest. Old cart/order placeholders recover their
category image automatically.

All monetary amounts use INR and Indian digit grouping. The shared 25-product
demo catalog has realistic illustrative prices and unique descriptions. Cart
and wishlist records refresh by ID; Stripe uses authoritative catalog prices
and descriptions plus the same delivery/tax estimates shown in the cart.
Historical paid order amounts stay unchanged.
After Stripe returns, the app verifies the paid session with the backend and
recovers purchased items independently of the current cart (including older
sessions whose product names match the catalog). It saves orders in Firestore
at `orders/{checkoutEmail}` using a transaction keyed by payment session ID,
so refreshing or retrying cannot duplicate an order. The cart clears only
after a successful save if it still matches the purchased items; recovering an
older payment preserves a newer cart. Verification and Firestore failures show
a retry action.
Orders wait for Firebase sign-in and reload when the account changes. To recover
a previously missing purchase, reopen its `/success/{CHECKOUT_SESSION_ID}` link
while signed in with the checkout email. Firestore rules must permit that
authenticated account to read and write its own order document. For production,
use authenticated server-side fulfillment with Stripe webhooks so fulfillment
does not depend on a customer returning to the confirmation page.
The account dashboard supports editable names and profile photos,
with initials when no photo exists. Uploads accept JPG, PNG, and WebP up to 5 MB
and require the configured Firebase Storage permissions.

### Vercel and Firebase

Redeploy the changed frontend to update the live site. In Vercel, use `client`
as the root directory, `npm run build` as the build command, and `dist` as the
output directory. These local changes do not update an existing deployment.

In the Firebase project used by `client/src/lib/firebase.ts`:

- Enable the Email/Password sign-in provider.
- Add `shopp-my-frontend.vercel.app` and your other deployment domains to
   Authentication's authorized domains. Add `localhost` for local testing if needed.
- Verify Firestore and Storage rules allow each authenticated user to access only
   their own permitted data. Do not make either service publicly writable.
- Deploy the versioned Firestore rules from the repository root with
   `npx firebase-tools deploy --only firestore:rules --project ecommerceyt-2646a`.
   The rules allow individual profile access by Firebase UID and order access by
   the signed-in email. Orders are append-only; listing collections, deleting
   orders, changing historical orders, and accessing another account are denied.
   These demo rules do not cryptographically prove payment: production orders
   must instead be written by a trusted server after Stripe verification.
   Storage rules are separate and are not changed by this deployment.
- Verify the Storage bucket is active and billing requirements are satisfied if
   profile photo uploads are enabled.

Real account sign-in, profile writes, and payment completion require access to
the configured Firebase and Stripe services. The regression suite uses simulated
profile failures and does not create production accounts or charge cards.

## **Technologies Used**

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: Firebase Authentication
- **Storage**: Firebase Storage
- **Payment Gateway**: Stripe


## Live Deployed Link
https://shopp-my-frontend.vercel.app/
