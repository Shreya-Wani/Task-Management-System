import express from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import restrictTo from "../middlewares/role.middleware.js";
import { createAdmin, createUser, getUsers, getUserById, updateUser, deleteUser } from "../controllers/user.controller.js";
import validate from "../middlewares/validate.middleware.js";
import {
    createUserSchema,
    updateUserSchema,
} from "../validations/user.validation.js";

const router = express.Router();

router.post("/admin", verifyJWT, restrictTo("superAdmin"), createAdmin);
router.post("/", verifyJWT, restrictTo("admin"), validate(createUserSchema), createUser);
router.get("/", verifyJWT, restrictTo("superAdmin", "admin"), getUsers);
router.get("/:id", verifyJWT, restrictTo("superAdmin", "admin", "user"), getUserById);
router.patch("/:id", verifyJWT, restrictTo("superAdmin", "admin", "user"), validate(updateUserSchema), updateUser);
router.delete("/:id", verifyJWT, restrictTo("superAdmin", "admin", "user"), deleteUser);

export default router;