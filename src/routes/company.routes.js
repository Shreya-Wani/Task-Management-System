import express from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import restrictTo from "../middlewares/role.middleware.js";
import { createCompany } from "../controllers/company.controller.js";

const router = express.Router();

router.post("/", verifyJWT, restrictTo("superAdmin"), createCompany);

export default router;