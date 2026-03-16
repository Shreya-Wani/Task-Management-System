import express from "express";
import upload from "../middlewares/upload.middleware.js";
import { uploadFile } from "../controllers/file.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/upload", verifyJWT, upload.single("file"), uploadFile);

export default router;