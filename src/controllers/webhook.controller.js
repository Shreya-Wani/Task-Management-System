import stripe from "../utils/stripe.js";
import Company from "../models/company.model.js";
import User from "../models/user.model.js";
import Plan from "../models/plan.model.js";

export const stripeWebHook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.log("Webhook verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {

    const session = event.data.object;

    const { companyId, adminId, planId } = session.metadata;

    const plan = await Plan.findById(planId);

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + plan.duration);

    await Company.findByIdAndUpdate(companyId, {
      isActive: true,
      paymentStatus: "paid",
      planExpiry: expiryDate,
    });

    await User.findByIdAndUpdate(adminId, {
      status: "active",
    });

    console.log("Company and Admin activated successfully");
  }

  res.json({ received: true });
};