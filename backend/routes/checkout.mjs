import { Router } from "express";
import Stripe from "stripe";

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

    if (items.some((item) => !item || typeof item.name !== "string" || !item.name.trim() ||
        !Number.isSafeInteger(item.quantity) || item.quantity < 1 ||
        !Number.isFinite(item.discountedPrice) || item.discountedPrice <= 0 ||
        !Number.isSafeInteger(Math.round(item.discountedPrice * 100)))) {
      return res.status(400).json({ error: "Your cart contains invalid prices or quantities. Please update your cart." });
    }

    const stripe = new Stripe(stripeSecret);
    const extractingItems = items.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency: "inr",
        unit_amount: Math.round(item.discountedPrice * 100),
        product_data: {
          name: item.name,
          ...(typeof item.description === "string" && item.description.trim()
            ? { description: item.description } : {}),
        },
      },
    }));

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
