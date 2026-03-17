import express from "express";
import verifyJWT from "../../middlewares/auth.middleware.js";
import restrictTo from "../../middlewares/role.middleware.js";
import { createTask, updateTaskStatus, addTaskComment, getTaskComments, getMyTasks, updateTask, deleteTask, getTasksByProject } from "../task/task.controller.js";
import checkSubscriptionPlan from "../../middlewares/checkSubscription.middleware.js";

const router = express.Router();

router.post("/", verifyJWT, restrictTo("admin"),checkSubscriptionPlan, createTask);
router.get("/project/:projectId", verifyJWT, restrictTo("admin"), getTasksByProject);
router.patch("/:taskId/status",verifyJWT, restrictTo("admin", "user"), updateTaskStatus);
router.post("/:taskId/comments", verifyJWT, restrictTo("admin", "user"),checkSubscriptionPlan, addTaskComment);
router.get("/:taskId/comments", verifyJWT, restrictTo("admin", "user"), getTaskComments);
router.get("/", verifyJWT, restrictTo("user", "admin"), getMyTasks);
router.patch("/:taskId", verifyJWT,restrictTo("admin"), updateTask);
router.delete("/:taskId", restrictTo("admin"), verifyJWT, deleteTask);


export default router;