import Task from "../models/task.model.js";
import ApiError from "../utils/ApiError.js";
import Project from "../models/project.model.js";
import TaskHistory from "../models/taskhistory.model.js";
import TaskComment from "../models/taskComment.model.js";
import { sendEmail } from "../utils/sendEmail.js";
import { getIO } from "../utils/socket.js";
import User from "../models/user.model.js";
import { getPagination } from "../utils/pagination.js";
import { checkTaskAccess } from "../utils/taskAccess.js";

export const createTaskService = async (data, adminUser) => {
    const { title, description, assignedTo, reportTo, priority, projectId } = data;

    const project = await Project.findById(projectId);

    if (!project || project.isDeleted) {
        throw new ApiError(404, "Project not found");
    }

    // Ensure project belongs to admin company
    if (project.companyId.toString() !== adminUser.companyId.toString()) {
        throw new ApiError(403, "Unauthorized project access");
    }

    const taskCount = await Task.countDocuments({
        projectId: projectId,
        isDeleted: false
    });

    const taskId = `TMS-${taskCount + 1}`;

    const task = await Task.create({
        taskId,
        title,
        description,
        assignedTo,
        reportTo,
        priority,
        projectId,
        companyId: adminUser.companyId,
    });

    const assignedUser = await User.findById(assignedTo);

    if (!assignedUser) {
        throw new ApiError(404, "Assigned user not found");
    };

    const io = getIO();

    io.to(task.assignedTo.toString()).emit("task_assigned", {
        taskId: task.taskId,
        title: task.title
    });

    await sendEmail({
        to: assignedUser.email,
        subject: "New Task Assigned",
        text: `You have been assigned a new task: ${title}`
    });

    await TaskHistory.create({
        taskId: task._id,
        action: "task_created",
        performedBy: adminUser._id
    });

    return task;
}

export const updateTaskStatusService = async (taskId, status, user) => {

    const task = await Task.findById(taskId);

    if (!task || task.isDeleted) {
        throw new ApiError(404, "Task not found");
    }

    if (task.companyId.toString() !== user.companyId.toString()) {
        throw new ApiError(403, "Unauthorized access to task");
    }

    if (
        user.role === "user" &&
        task.assignedTo.toString() !== user._id.toString()
    ) {
        throw new ApiError(403, "You can only update your assigned tasks");
    }

    const oldStatus = task.status;

    task.status = status;

    await task.save();

    await TaskHistory.create({
        taskId: task._id,
        action: "status_changed",
        oldValue: oldStatus,
        newValue: status,
        performedBy: user._id,
        companyId: user.companyId
    });

    const assignedUser = await User.findById(task.assignedTo);

    await sendEmail({
        to: assignedUser.email,
        subject: "Task Status Updated",
        text: `
Task Status Updated

Task: ${task.title}
New Status: ${status}
Updated By: ${user.name}
`
    });

    const io = getIO();

    io.to(task.assignedTo.toString()).emit("task_status_updated", {
        taskId: task.taskId,
        status
    });

    return task;
};

export const addTaskCommentService = async (taskId, comment, user) => {
    const task = await Task.findById(taskId);

    if (!task || task.isDeleted) {
        throw new ApiError(404, "Task not found");
    }

    checkTaskAccess(task, user);

    const newComment = await TaskComment.create({
        taskId,
        comment,
        createdBy: user._id
    });

    return newComment;
};

export const getTaskCommentsService = async (taskId, query, user) => {

    const { page, limit, skip, sort } = getPagination(query);

    const task = await Task.findById(taskId);

    if (!task || task.isDeleted) {
        throw new ApiError(404, "Task not found");
    };

    checkTaskAccess(task, user);

    const comments = await TaskComment.find({ taskId })
        .populate("createdBy", "name email")
        .sort(sort)
        .skip(skip)
        .limit(limit);

    const total = await TaskComment.countDocuments({ taskId });

    return {
        total,
        page,
        totalPages: Math.ceil(total / limit),
        comments
    }
};

export const getMyTasksService = async (query, user) => {

    const { page, limit, skip, sort} = getPagination(query);
    const {status, priority} = query;

    const filter = {
        companyId: user.companyId,
        isDeleted: false
    };

    if (user.role === "user") {
        filter.assignedTo = user._id;
    }

    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const tasks = await Task.find(filter)
        .populate("assignedTo", "name email")
        .populate("reportTo", "name email")
        .sort(sort)
        .skip(skip)
        .limit(limit);

    const total = await Task.countDocuments(filter);

    return {
        total,
        page,
        totalPages: Math.ceil(total / limit),
        tasks
    }
};

export const updateTaskService = async (taskId, data, user) => {
    const task = await Task.findById(taskId);

    if (!task || task.isDeleted) {
        throw new ApiError(404, "Task not found");
    };

    checkTaskAccess(task, user);

    Object.assign(task, data);

    await task.save();

    return task;
}

export const deleteTaskService = async (taskId, user) => {
    const task = await Task.findById(taskId);

    if (!task || task.isDeleted) {
        throw new ApiError(404, "Task not found");
    }

    checkTaskAccess(task, user);

    task.isDeleted = true;
    await task.save();

    return true;
};

export const getTasksByProjectService = async (projectId, query, user) => {
    const project = await Project.findById(projectId);

    if (!project || project.isDeleted) {
        throw new ApiError(404, "Project not found");
    };

    if (project.companyId.toString() !== user.companyId.toString()) {
        throw new ApiError(403, "Unauthorized access to this project");
    };

    const { page, limit, skip, sort } = query;
    const { status, priority, assignedTo } = query;

    const filter = {
        projectId,
        isDeleted: false
    }

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;

    const tasks = await Task.find(filter)
        .populate("assignedTo", "name email")
        .populate("reportTo", "name email")
        .sort(sort)
        .skip(skip)
        .limit(limit);

    const total = await Task.countDocuments(filter);

    return {
        total,
        page,
        totalPages: Math.ceil(total / limit),
        tasks
    }
}