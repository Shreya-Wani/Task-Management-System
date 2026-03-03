import Project from "../models/project.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

export const createProject = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    if (!name) {
        throw new ApiError(400, "Project name is required");
    }

    const existingProject = await Project.findOne({
        name,
        companyId: req.user.companyId,
        isDeleted: false,
    });

    if (existingProject) {
        throw new ApiError(400, "Project with the same name already exists");
    }

    const project = await Project.create({
        name,
        description,
        companyId: req.user.companyId,
        createdBy: req.user._id,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, project, "Project created successfully"));
});