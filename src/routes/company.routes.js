import express from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import restrictTo from "../middlewares/role.middleware.js";
import { createCompany, getAllCompanies, getCompanyById, updateCompany, deleteCompany } from "../controllers/company.controller.js";
import validate from "../middlewares/validate.middleware.js";
import {
  createCompanySchema,
  updateCompanySchema,
} from "../validations/company.validation.js";
import { paginationSchema } from "../validations/common.validation.js";

const router = express.Router();

router.get("/", verifyJWT, restrictTo("superAdmin"), validate(paginationSchema, "query"), getAllCompanies);
router.get("/:id", verifyJWT, restrictTo("superAdmin"), getCompanyById);

export default router;