import express from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import restrictTo from "../middlewares/role.middleware.js";
import { createTask, getTasks, updateTaskStatus } from "../controllers/task.controller.js";

const router = express.Router();

router.post("/", verifyJWT, restrictTo("admin"), createTask);
router.get("/", verifyJWT, restrictTo("superAdmin", "admin", "user"), getTasks);
router.patch("/:id/status", verifyJWT, restrictTo("admin", "user", "superAdmin"), updateTaskStatus);
router.get("/debug", (req, res) => {
  res.send("Task routes working");
});

export default router;