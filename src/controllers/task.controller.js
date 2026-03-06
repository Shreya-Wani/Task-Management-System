import { createTaskService } from "../services/task.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

export const createTask = asyncHandler(async (req, res) => {
    const task = await createTaskService(req.body, req.user);

    return res.status(201).json(new ApiResponse(201, task, "Task created successfully"));
})