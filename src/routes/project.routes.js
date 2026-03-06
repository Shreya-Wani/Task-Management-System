import express from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import restrictTo from "../middlewares/role.middleware.js";
import { createProject, assignUserToProject } from "../controllers/project.controller.js";

const router = express.Router();

router.post("/", verifyJWT, restrictTo("admin"), createProject);

router.post(
  "/:projectId/assign-user",
  verifyJWT,
  restrictTo("admin"),
  assignUserToProject
);

export default router;