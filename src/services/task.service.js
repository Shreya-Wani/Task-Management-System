import Task from "../models/task.model.js";
import ApiError from "../utils/ApiError.js";
import Project from "../models/project.model.js";
import TaskHistory from "../models/taskhistory.model.js";
import TaskComment from "../models/taskComment.model.js";
import { sendEmail } from "../utils/sendEmail.js";

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

    const oldStatus = task.status;

    task.status = status;

    await task.save();

    await TaskHistory.create({
        taskId: task._id,
        action: "status_updated",
        performedBy: user._id,
        oldValue: oldStatus,
        newValue: status
    });

    return task;
};

export const addTaskCommentService = async (taskId, comment, user) => {
    const task = await Task.findById(taskId);

    if (!task || task.isDeleted) {
        throw new ApiError(404, "Task not found");
    }

    if (task.companyId.toString() !== user.companyId.toString()) {
        throw new ApiError(403, "Unauthorized access to task");
    }

    const newComment = await TaskComment.create({
        taskId,
        comment,
        createdBy: user._id
    });

    return newComment;
};