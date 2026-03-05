import express from "express";
import { createPlan, getAllPlans } from "../controllers/plan.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";
import restrictTo from "../middlewares/role.middleware.js";

const router = express.Router();

router.post("/", verifyJWT, restrictTo("superAdmin"), createPlan);
router.get("/", getAllPlans);

export default router;