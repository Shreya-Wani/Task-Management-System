import Task from "../models/task.model.js";
import User from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

//create task
export const createTask = asyncHandler(async (req, res) => {
    const { title, description, assignedTo, dueDate } = req.body;

    if (!title || !assignedTo) {
        throw new ApiError(400, "Title and assigned user are required");
    }

    const user = await User.findById(assignedTo);

    if (!user) {
        throw new ApiError(404, "Assigned user not found");
    }

    if (user.companyId.toString() !== req.user.companyId.toString()) {
        throw new ApiError(403, "Cannot assign task outside your company");
    }

    const task = await Task.create({
        title,
        description,
        assignedTo,
        dueDate,
        companyId: req.user.companyId,
        createdBy: req.user._id,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, task, "Task created successfully"));
});

//get task
export const getTasks = asyncHandler(async (req, res) => {
    let tasks;

    if (req.user.role === "superAdmin") {
        tasks = await Task.find()
            .populate("assignedTo", "name email")
            .populate("createdBy", "name email");
    } else if (req.user.role === "admin") {
        tasks = await Task.find({
            companyId: req.user.companyId,
        })
            .populate("assignedTo", "name email")
            .populate("createdBy", "name email");
    } else {
        tasks = await Task.find({
            assignedTo: req.user._id,
        })
            .populate("assignedTo", "name email")
            .populate("createdBy", "name email");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, tasks, "Tasks fetched successfully"));
});

//update task status
export const updateTaskStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const { id } = req.params;

    if (!status) {
        throw new ApiError(400, "Status is required");
    }

    const task = await Task.findById(id);

    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    // USER logic
    if (req.user.role === "user") {
        if (task.assignedTo.toString() !== req.user._id.toString()) {
            throw new ApiError(403, "You can only update your own tasks");
        }
    }

    // ADMIN logic
    if (req.user.role === "admin") {
        if (task.companyId.toString() !== req.user.companyId.toString()) {
            throw new ApiError(403, "Cannot update task outside your company");
        }
    }

    task.status = status;
    await task.save();

    return res
        .status(200)
        .json(new ApiResponse(200, task, "Task status updated"));
});
