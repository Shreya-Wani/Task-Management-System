import express from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import restrictTo from "../middlewares/role.middleware.js";
import { registerSuperAdmin, createAdmin, createUser, getUsers, getUserById, updateUser, deleteUser } from "../controllers/user.controller.js";
import validate from "../middlewares/validate.middleware.js";
import {
    createUserSchema,
    updateUserSchema,
} from "../validations/user.validation.js";
import { paginationSchema } from "../validations/common.validation.js";
import checkSubscriptionPlan from "../middlewares/checkSubscription.middleware.js";

const router = express.Router();

router.post("/super-admin", registerSuperAdmin);
router.post("/", verifyJWT, restrictTo("admin"), validate(createUserSchema),checkSubscriptionPlan, createUser);
router.get("/", verifyJWT, restrictTo("superAdmin", "admin"), validate(paginationSchema, "query"), getUsers);
router.get("/:id", verifyJWT, restrictTo("superAdmin", "admin", "user"), getUserById);
router.patch("/:id", verifyJWT, restrictTo("admin", "user"), validate(updateUserSchema), updateUser);
router.delete("/:id", verifyJWT, restrictTo("admin", "user"), deleteUser);

export default router;