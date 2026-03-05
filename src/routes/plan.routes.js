import express from "express";
import { createPlan, getAllPlans, updatePlan, disablePlan } from "../controllers/plan.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";
import restrictTo from "../middlewares/role.middleware.js";

const router = express.Router();

router.post("/", verifyJWT, restrictTo("superAdmin"), createPlan);
router.get("/", getAllPlans);
router.patch("/:planId", verifyJWT, restrictTo("superAdmin"), updatePlan);
router.patch("/:planId/disable", verifyJWT, restrictTo("superAdmin"), disablePlan);

export default router;