import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { createProjectService } from "../services/project.service.js";

export const createProject = asyncHandler(async (req, res) => {
    const project = await createProjectService(req.body, req.user);

    return res
        .status(201)
        .json(new ApiResponse(201, project, "Project created successfully"));
});