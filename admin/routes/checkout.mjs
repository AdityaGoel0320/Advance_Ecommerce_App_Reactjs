import { Router } from "express";
import Stripe from "stripe";

const router = Router();

router.post("/checkout", async (req, res) => {
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  const stripe = new Stripe(stripeSecret, {
    apiVersion: "2022-11-15",
  });

  try {
    const { items, email } = req.body;

    console.log("hi checkout function started", items, email);

    if (!items || !Array.isArray(items)) {
      throw new Error("Invalid items array.");
    }

    if (!email) {
      throw new Error("Email is required.");
    }

    const extractingItems = items.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency: "inr",
        unit_amount: item.discountedPrice * 100,
        product_data: {
          name: item.name,
          description: item.description,
          images: item.images,
        },
      },
    }));

    console.log("Extracted Items:", extractingItems);

    const session = await stripe.checkout.sessions.create({
  payment_method_types: ["card"],
  line_items: extractingItems,
  mode: "payment",
  success_url: `http://localhost:5173/success/{CHECKOUT_SESSION_ID}`,
  cancel_url: "http://localhost:5173/cancel",
  metadata: {
    email,
  },
});


    // success_url: `http://localhost:5173/success/${CHECKOUT_SESSION_ID}`,

    console.log("Session Created:", session);

    res.json({
      message: "Server is connected",
      success: true,
      id: session.id,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: error.message });
  }
});


export default router;
