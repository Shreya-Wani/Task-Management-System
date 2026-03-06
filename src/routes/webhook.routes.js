import express from "express";
import { stripeWebHook } from "../controllers/webhook.controller.js";

const router = express.Router();

router.post("/stripe", express.raw({ type: "application/json" }), stripeWebHook);

export default router;