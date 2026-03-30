import express from "express";
import verifyJWT from "../../middlewares/auth.middleware.js";
import restrictTo from "../../middlewares/role.middleware.js";
import { getAdminDashboard, getSuperAdminDashboard, getUserDashboard } from "../dashboard/dashboard.controller.js";
import checkSubscriptionPlan from "../../middlewares/checkSubscription.middleware.js";

const router = express.Router();

console.log("Dashboard route loaded");  

router.get(
  "/admin",
  verifyJWT,
  restrictTo("admin"),
  checkSubscriptionPlan,
  getAdminDashboard
);

router.get(
  "/superadmin",
  verifyJWT,
  restrictTo("superAdmin"),
  getSuperAdminDashboard
);

router.get(
  "/user",
  verifyJWT,
  restrictTo("user"),
  checkSubscriptionPlan,
  getUserDashboard
)

export default router;