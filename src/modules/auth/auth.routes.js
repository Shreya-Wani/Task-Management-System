import express from "express";
import { register, login, refreshAccessToken, logout, verifyLoginOTP } from "../auth/auth.controller.js";
import verifyJWT from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify-login-otp", verifyLoginOTP);
router.post("/refresh-token", refreshAccessToken);
router.post("/logout", verifyJWT, logout);

export default router;