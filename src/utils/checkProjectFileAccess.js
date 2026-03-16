import ApiError from "../utils/ApiError.js";
import Project from "../models/project.model.js";

export const checkProjectFileAccess = async (task, user) => {

    const role = user.role.toLowerCase();

    // Admin → must belong to same company
    if (role === "admin") {

        if (task.companyId.toString() !== user.companyId.toString()) {
            throw new ApiError(403, "Unauthorized access");
        }

        return true;
    }

    // User → must be assigned to project
    if (role === "user") {

        const project = await Project.findById(task.projectId);

        if (!project) {
            throw new ApiError(404, "Project not found");
        }

        const isMember = project.assignedUsers.some(
            member => member.toString() === user._id.toString()
        );

        if (!isMember) {
            throw new ApiError(403, "You are not part of this project");
        }

        return true;
    }

    throw new ApiError(403, "Unauthorized role");
};