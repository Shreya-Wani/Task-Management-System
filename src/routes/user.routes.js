import express from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import restrictTo from "../middlewares/role.middleware.js";
import { createAdmin, createUser, getUsers, updateUser } from "../controllers/user.controller.js";

const router = express.Router();

router.post("/admin", verifyJWT, restrictTo("superAdmin"), createAdmin);
router.post("/", verifyJWT, restrictTo("admin"), createUser);
router.get("/", verifyJWT, restrictTo("superAdmin", "admin"), getUsers);
router.patch("/:id", verifyJWT, restrictTo("superAdmin", "admin", "user"), updateUser);

export default router;