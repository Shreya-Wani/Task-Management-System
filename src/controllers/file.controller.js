import { uploadFileService } from "../services/file.service.js";
import asyncHandler from "../utils/asyncHandler.js";

export const uploadFile = asyncHandler(async (req, res) => {

    const file = req.file;
    const { taskId } = req.body;

    const uploadedFile = await uploadFileService(
        file,
        taskId,
        req.user._id
    );

    res.status(201).json({
        success: true,
        data: uploadedFile
    });
    
});
