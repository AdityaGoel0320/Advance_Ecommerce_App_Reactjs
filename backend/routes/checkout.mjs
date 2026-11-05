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
          metadata: { productId: String(product._id) },
        },
      },
    }));
    for (const [name, amount] of [["Delivery estimate", charges.shipping], ["Tax estimate", charges.tax]]) {
      extractingItems.push({
        quantity: 1,
        price_data: { currency: "inr", unit_amount: amount * 100, product_data: { name, metadata: { checkoutCharge: "true" } } },
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

router.post("/checkout/confirm", async (req, res) => {
  const { sessionId, email } = req.body;
  if (typeof sessionId !== "string" || !/^cs_[a-zA-Z0-9_]+$/.test(sessionId) ||
      typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "A valid payment session and signed-in email are required." });
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error("Payment verification unavailable: STRIPE_SECRET_KEY is not configured");
    return res.status(503).json({ error: "Payment verification is not configured. Please contact the store." });
  }
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const customerEmail = session.customer_details?.email || session.customer_email;
    if (customerEmail?.toLowerCase() !== email.toLowerCase()) {
      return res.status(403).json({ error: "Sign in with the email used for this payment to save your order." });
    }
    if (session.status !== "complete" || session.payment_status !== "paid") {
      return res.status(409).json({ error: "Stripe has not confirmed this payment yet. Please retry shortly." });
    }
    if (session.currency !== "inr" || !Number.isSafeInteger(session.amount_total) || session.amount_total <= 0) {
      throw new Error("The payment has invalid currency or totals.");
    }
    const lines = await stripe.checkout.sessions.listLineItems(sessionId, {
      limit: 100, expand: ["data.price.product"],
    });
    if (lines.has_more) throw new Error("This payment contains too many items to recover automatically.");
    const orderItems = [];
    for (const line of lines.data) {
      const paidProduct = line.price?.product;
      const metadata = typeof paidProduct === "object" && paidProduct ? paidProduct.metadata : {};
      if (metadata?.checkoutCharge === "true" ||
          ["Delivery estimate", "Tax estimate"].includes(line.description)) continue;
      // Older sessions did not include IDs; recover their canonical product names.
      const product = metadata?.productId
        ? products.find((item) => String(item._id) === metadata.productId)
        : products.find((item) => item.name === line.description);
      if (!product || !Number.isSafeInteger(line.quantity) || line.quantity < 1 ||
          !Number.isSafeInteger(line.price?.unit_amount) || line.price.unit_amount < 0) {
        throw new Error("A purchased product could not be recovered. Please contact support with your payment ID.");
      }
      orderItems.push({
        ...product,
        name: line.description,
        description: typeof paidProduct === "object" && paidProduct?.description ? paidProduct.description : product.description,
        quantity: line.quantity,
        discountedPrice: line.price.unit_amount / 100,
      });
    }
    if (!orderItems.length) throw new Error("No purchased products were found in this payment.");
    res.json({ order: {
      paymentId: session.id,
      paymentMethod: "stripe",
      userEmail: email,
      orderItems,
      totalAmount: session.amount_total / 100,
      createdAt: session.created,
    } });
  } catch (error) {
    console.error("Unable to verify payment:", error.type || error.name, error.message);
    res.status(error.code === "resource_missing" ? 404 : 502).json({
      error: error.code === "resource_missing"
        ? "This payment session was not found. Please check your payment link."
        : "Unable to verify your payment and recover the order. Please retry or contact support with your payment ID.",
    });
  }
});

export default router;
