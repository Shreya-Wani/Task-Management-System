import express from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import restrictTo from "../middlewares/role.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import {
    createProjectSchema,
} from "../validations/project.validation.js";
import { createProject } from "../controllers/project.controller.js";

const router = express.Router();

router.post("/", verifyJWT, restrictTo("admin"), validate(createProjectSchema), createProject);

export default router;