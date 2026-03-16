import express from "express";
import upload from "../middlewares/upload.middleware.js";
import { uploadFile, getTaskFiles, deleteFile, getFile } from "../controllers/file.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";
import restrictTo from "../middlewares/role.middleware.js";

const router = express.Router();

router.post(
    "/upload", 
    verifyJWT, 
    restrictTo("admin", "user"), 
    upload.single("file"), 
    uploadFile
);

router.get(
    "/task/:taskId",
    verifyJWT,
    restrictTo("admin", "user"),
    getTaskFiles
);

router.delete(
  "/:fileId",
  verifyJWT,
  restrictTo("admin", "user"),
  deleteFile
);

router.get(
  "/:fileId",
  verifyJWT,
  restrictTo("admin", "user"),
  getFile
);

export default router;