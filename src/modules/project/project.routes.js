import express from "express";
import verifyJWT from "../../middlewares/auth.middleware.js";
import restrictTo from "../../middlewares/role.middleware.js";
import { createProject, assignUserToProject, getMyProjects, updateProject, deleteProject } from "../project/project.controller.js";
import checkSubscriptionPlan from "../../middlewares/checkSubscription.middleware.js";

const router = express.Router();

router.post("/", verifyJWT, restrictTo("admin"),checkSubscriptionPlan, createProject);
router.post("/:projectId/assign-user", verifyJWT, restrictTo("admin"), assignUserToProject);
router.get("/my-projects", verifyJWT, restrictTo("user", "admin"), getMyProjects);
router.patch("/:id", verifyJWT, restrictTo("admin"), updateProject);
router.delete("/:id", verifyJWT, restrictTo("admin"), deleteProject);

export default router;