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

All 42 original catalogue image URLs returned HTTP 404 during verification.
ImgBB sends a decodable error PNG with that response, so browser image-loading
checks alone can incorrectly report success. The affected URLs now map to a local
"Image unavailable" placeholder, not replacement product photography.

To restore the actual photos, recover the original files or provide valid image
URLs. Local photos belong in `client/public/catalog/`; map each original URL to
its local `/catalog/filename` path in `client/src/lib/catalogImages.json`.
After updating the catalogue source URLs, `npm --prefix client run images:sync`
downloads available originals and regenerates that mapping. The command reports
missing sources and exits unsuccessfully when any download fails; unavailable
images receive a local placeholder. Commit downloaded assets with the mapping.

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
- Verify the Storage bucket is active and billing requirements are satisfied if
   profile photo uploads are enabled.

Real account sign-in, profile writes, and payment completion require access to
the configured Firebase and Stripe services. The regression suite uses simulated
profile failures and does not create production accounts or charge cards.

## **Technologies Used**

- **Frontend**: React, TypeScript, Bootstrap
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: Firebase Authentication
- **Storage**: Firebase Storage
- **Payment Gateway**: Stripe


## Live Deployed Link
https://shopp-my-frontend.vercel.app/
