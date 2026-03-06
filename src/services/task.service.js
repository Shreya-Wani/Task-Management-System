import Task from "../models/task.model.js";
import ApiError from "../utils/ApiError.js";
import Project from "../models/project.model.js";

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

    return task;
}
