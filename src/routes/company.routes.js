import express from "express";

import verifyJWT from "../middlewares/auth.middleware.js";
import restrictTo from "../middlewares/role.middleware.js";
import validate from "../middlewares/validate.middleware.js";

import {
  createCompany,
  getAllCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
  getMyCompany
} from "../controllers/company.controller.js";

import {
  createCompanySchema,
  updateCompanySchema
} from "../validations/company.validation.js";

import { paginationSchema } from "../validations/common.validation.js";

const router = express.Router();


// Admin creates company
router.post(
  "/",
  verifyJWT,
  restrictTo("admin"),
  validate(createCompanySchema),
  createCompany
);

//get my company (for admin)
router.get(
  "/me",
  verifyJWT,
  restrictTo("admin"),
  getMyCompany
);

// SuperAdmin views all companies
router.get(
  "/",
  verifyJWT,
  restrictTo("superAdmin"),
  validate(paginationSchema, "query"),
  getAllCompanies
);

// SuperAdmin get company
router.get(
  "/:id",
  verifyJWT,
  restrictTo("superAdmin"),
  getCompanyById
);

// Admin update their company
router.patch(
  "/:id",
  verifyJWT,
  restrictTo("admin"),
  validate(updateCompanySchema),
  updateCompany
);

// SuperAdmin delete company
router.delete(
  "/:id",
  verifyJWT,
  restrictTo("superAdmin", "admin"),
  deleteCompany
);

export default router;