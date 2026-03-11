import express from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import restrictTo from "../middlewares/role.middleware.js";
import { getAdminDashboard } from "../controllers/dashboard.controller.js";

const router = express.Router();

console.log("Dashboard route loaded");  

router.get(
  "/admin",
  verifyJWT,
  restrictTo("admin"),
  getAdminDashboard
);

export default router;