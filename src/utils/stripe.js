import dotenv from "dotenv";
dotenv.config();

import Stripe from "stripe";

const stripeKey = process.env.STRIPE_SECRET_KEY;

if (!stripeKey) {
  throw new Error("STRIPE_SECRET_KEY is missing in .env file");
}

const stripe = new Stripe(stripeKey, {
  apiVersion: "2024-06-20",
});

export default stripe;