import File from "../models/file.model.js";
import ApiError from "../utils/ApiError.js";

export const uploadFileService = async (file, taskId, userId) => {

    if(!file) {
        throw new ApiError(400, "File is Required");
    }

    const savedFile = await File.create({
        taskId,
        fileName: file.originalname,
        filePath: file.path,
        uploadedBy: userId
    });

    return savedFile;

};