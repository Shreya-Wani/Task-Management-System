import express from "express";
import { createPlan } from "../controllers/plan.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";
import restrictTo from "../middlewares/role.middleware.js";

const router = express.Router();

router.post("/", verifyJWT, restrictTo("superAdmin"), createPlan);

export default router;