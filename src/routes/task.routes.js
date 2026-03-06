import express from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import restrictTo from "../middlewares/role.middleware.js";
import { createTask, updateTaskStatus, addTaskComment } from "../controllers/task.controller.js";

const router = express.Router();

router.post("/", verifyJWT, restrictTo("admin"), createTask);
router.patch("/:taskId/status", verifyJWT, updateTaskStatus);
router.post("/:taskId/comments", verifyJWT, addTaskComment);

export default router;