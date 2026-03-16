import { uploadFileService, getTaskFilesService, deleteFileService, getFileService } from "../services/file.service.js";
import asyncHandler from "../utils/asyncHandler.js";

export const uploadFile = asyncHandler(async (req, res) => {

    const file = req.file;
    const { taskId } = req.body;

    const uploadedFile = await uploadFileService(
        file,
        taskId,
        req.user
    );

    res.status(201).json({
        success: true,
        data: uploadedFile
    });

});

export const getTaskFiles = asyncHandler(async (req, res) => {

    const { taskId } = req.params;

    const files = await getTaskFilesService(
        taskId,
        req.user
    );

    res.status(200).json({
        success: true,
        data: files
    });

});

export const deleteFile = asyncHandler(async (req, res) => {

    const { fileId } = req.params;

    await deleteFileService(fileId, req.user);

    res.status(200).json({
        success: true,
        message: "File deleted successfully"
    });
});

export const getFile = asyncHandler(async (req, res) => {

    const { fileId } = req.params;

    const file = await getFileService(fileId, req.user);

    res.status(200).json({
        success: true,
        data: file
    });

});