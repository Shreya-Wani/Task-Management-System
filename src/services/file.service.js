import File from "../models/file.model.js";
import ApiError from "../utils/ApiError.js";
import cloudinary from "../utils/cloudinary.js";
import streamifier from "streamifier";

export const uploadFileService = async (file, taskId, user) => {

    const task = await Task.findById(taskId);

    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    if (task.companyId.toString() !== user.companyId.toString()) {
        throw new ApiError(403, "Unauthorized task access");
    }

    if (!file) {
        throw new ApiError(400, "File is Required");
    }

    const uploadFromBuffer = () => {
        return new Promise((resolve, reject) => {

            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: "task-files",
                    resource_type: "auto"
                },
                (error, result) => {

                    if (result) resolve(result);
                    else reject(error);

                }
            );

            streamifier.createReadStream(file.buffer).pipe(stream);
        });
    };

    const result = await uploadFromBuffer();

    const savedFile = await File.create({
        taskId,
        fileName: file.originalname,
        fileUrl: result.secure_url,
        publicId: result.public_id,
        uploadedBy: user._id
    });

    return savedFile;
};