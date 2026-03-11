import { createTaskService, updateTaskStatusService, addTaskCommentService, getMyTasksService, getTaskCommentsService, updateTaskService, deleteTaskService, getTasksByProjectService } from "../services/task.service.js";
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

export const getTaskComments = asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    const comments = await getTaskCommentsService(taskId, req.query, req.user);

    res.status(200).json(new ApiResponse(200, comments, "Comments fetched successfully"));

});

export const getMyTasks = asyncHandler(async (req, res) => {

    const tasks = await getMyTasksService(req.query, req.user);

    return res
        .status(200)
        .json(new ApiResponse(200, tasks, "Tasks fetched successfully"));
});

export const updateTask = asyncHandler(async (req, res) => {
    const { taskId } = req.params;

    const task = await updateTaskService(taskId, req.body, req.user);

    return res
        .status(200)
        .json(new ApiResponse(200, task, "Task updated successfully"));
});

export const deleteTask = asyncHandler(async (req, res) => {
    const { taskId } = req.params;

    await deleteTaskService(taskId, req.user);

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Task deleted successfully"));
});

export const getTasksByProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    const tasks = await getTasksByProjectService(projectId, req.query, req.user);

    return res
        .status(200)
        .json(new ApiResponse(200, tasks, "Project Tasks fetched successfully"));
})