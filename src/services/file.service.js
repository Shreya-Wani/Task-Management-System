import File from "../models/file.model.js";
import ApiError from "../utils/ApiError.js";
import cloudinary from "../utils/cloudinary.js";
import streamifier from "streamifier";
import { checkProjectFileAccess } from "../utils/checkProjectFileAccess.js";
import Task from "../models/task.model.js";

export const uploadFileService = async (file, taskId, user) => {
    const task = await Task.findById(taskId);

    if (!task || task.isDeleted) {
        throw new ApiError(404, "Task not found");
    }

    await checkProjectFileAccess(task, user);

    if (!file) {
        throw new ApiError(400, "File is Required");
    }

    const uploadFromBuffer = () => {
        return new Promise((resolve, reject) => {

            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: "task-files",
                    resource_type: "raw"
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

export const getTaskFilesService = async (taskId, user) => {

    const task = await Task.findById(taskId);

    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    await checkProjectFileAccess(task, user);

    const files = await File.find({ taskId })
        .populate("uploadedBy", "name email");

    return files;
};

export const deleteFileService = async (fileId, user) => {

    const file = await File.findById(fileId);

    if(!file) {
        throw new ApiError(404, "File not found");
    }

    const task = await Task.findById(file.taskId);

    if(!task){
        throw new ApiError(404, "Task not found");
    }

    await checkProjectFileAccess(task, user);

    await cloudinary.uploader.destroy(file.publicId, {
        resource_type: "raw"
    });

    await File.findByIdAndDelete(fileId);

    return true;
};

export const getFileService = async (fileId, user) => {

    const file = await File.findById(fileId);

    if (!file) {
        throw new ApiError(404, "File not found");
    }

    const task = await Task.findById(file.taskId);

    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    await checkProjectFileAccess(task, user);

    return {
        fileName: file.fileName,
        fileUrl: file.fileUrl
    };
};

export const downloadFileService = async (fileId, user) => {

    const file = await File.findById(fileId);

    if (!file) {
        throw new ApiError(404, "File not found");
    }

    const task = await Task.findById(file.taskId);

    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    await checkProjectFileAccess(task, user);

    return file.fileUrl;
};
