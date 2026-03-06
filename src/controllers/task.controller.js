import { createTaskService, updateTaskStatusService, addTaskCommentService } from "../services/task.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

export const createTask = asyncHandler(async (req, res) => {
    const task = await createTaskService(req.body, req.user);

    res.status(201).json(new ApiResponse(201, task, "Task created successfully"));
});

export const updateTaskStatus = asyncHandler(async (req, res) => {

    const { taskId } = req.params;
    const { status } = req.body;

    const task = await updateTaskStatusService(taskId, status, req.user);

    res.status(200).json(new ApiResponse(200, task, "Task status updated successfully"));
});

export const addTaskComment = asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    const { comment } = req.body;

    const newComment = await addTaskCommentService(taskId, comment, req.user);

    res.status(201).json(new ApiResponse(201, newComment, "Comment added successfully"));
});

