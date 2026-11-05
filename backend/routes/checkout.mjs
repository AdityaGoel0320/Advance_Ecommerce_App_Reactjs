import { Router } from "express";
import Stripe from "stripe";
import { products, checkoutCharges as charges } from "../constants/index.mjs";

const router = Router();

router.post("/checkout", async (req, res) => {
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecret) {
    console.error("Checkout unavailable: STRIPE_SECRET_KEY is not configured");
    return res.status(503).json({ error: "Payments are not configured. Please contact the store." });
  }
  try {
    const { items, email, origin } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Add products to your cart before checking out." });
    }

    if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Sign in with a valid email address to checkout." });
    }

    const frontendUrl = process.env.FRONTEND_URL || origin || "https://shopp-my-frontend.vercel.app";
    let returnUrl;
    try {
      returnUrl = new URL(frontendUrl);
    } catch {
      return res.status(400).json({ error: "Invalid storefront URL." });
    }
    if (returnUrl.protocol !== "https:" &&
        !(returnUrl.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(returnUrl.hostname))) {
      return res.status(400).json({ error: "Checkout requires an HTTPS storefront or localhost." });
    }

    if (items.some((item) => !item || !Number.isSafeInteger(item._id) ||
        !Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > 99)) {
      return res.status(400).json({ error: "Your cart contains invalid products or quantities. Please update your cart." });
    }
    const cart = items.map((item) => ({ product: products.find((product) => product._id === item._id), quantity: item.quantity }));
    if (cart.some(({ product }) => !product || !product.isStock)) {
      return res.status(400).json({ error: "A product in your cart is unavailable. Please remove it before checking out." });
    }

    const stripe = new Stripe(stripeSecret);
    const extractingItems = cart.map(({ product, quantity }) => ({
      quantity,
      price_data: {
        currency: "inr",
        unit_amount: Math.round(product.discountedPrice * 100),
        product_data: {
          name: product.name,
          description: product.description,
        },
      },
    }));
    for (const [name, amount] of [["Delivery estimate", charges.shipping], ["Tax estimate", charges.tax]]) {
      extractingItems.push({
        quantity: 1,
        price_data: { currency: "inr", unit_amount: amount * 100, product_data: { name } },
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: extractingItems,
      mode: "payment",
      customer_email: email,
      success_url: `${returnUrl.origin}/success/{CHECKOUT_SESSION_ID}`,
      cancel_url: `${returnUrl.origin}/cancel`,
      metadata: { email },
    });

    if (!session.url) throw new Error("Stripe did not return a checkout URL.");
    res.json({
      success: true,
      id: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error.type || error.name, error.code || "", error.message);
    const configurationError = error.type === "StripeAuthenticationError";
    res.status(configurationError ? 503 : 502).json({
      error: configurationError
        ? "Payments are unavailable because the Stripe key is invalid. Please contact the store."
        : "The payment service could not start checkout. Please try again or contact the store.",
    });
  }
});


export default router;
