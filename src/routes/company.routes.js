import express from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import restrictTo from "../middlewares/role.middleware.js";
import { createCompany, getAllCompanies, getCompanyById, updateCompany, deleteCompany } from "../controllers/company.controller.js";
import validate from "../middlewares/validate.middleware.js";
import {
  createCompanySchema,
  updateCompanySchema,
} from "../validations/company.validation.js";

const router = express.Router();

router.post("/", verifyJWT, restrictTo("superAdmin"), validate(createCompanySchema), createCompany);
router.get("/", verifyJWT, restrictTo("superAdmin"), getAllCompanies);
router.get("/:id", verifyJWT, restrictTo("superAdmin"), getCompanyById);
router.patch("/:id", verifyJWT, restrictTo("superAdmin"), validate(updateCompanySchema), updateCompany);
router.delete("/:id", verifyJWT, restrictTo("superAdmin"), deleteCompany);

export default router;