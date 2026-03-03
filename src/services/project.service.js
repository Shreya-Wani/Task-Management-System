import Project from "../models/project.model.js";
import ApiError from "../utils/ApiError.js";

export const createProjectService = async (data, currentUser) => {
    const { name, description } = data;

    const existingProject = await Project.findOne({
        name,
        companyId: currentUser.companyId,
        isDeleted: false,
    });

    if (existingProject) {
        throw new ApiError(400, "Project already exists");
    }

    const project = await Project.create({
        name,
        description,
        companyId: currentUser.companyId,
        createdBy: currentUser._id,
    });

    return project;
}