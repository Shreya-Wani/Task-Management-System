import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { createProjectService, assignUserToProjectService } from "../services/project.service.js";

export const createProject = asyncHandler(async (req, res) => {

  const project = await createProjectService(req.body, req.user);

  res
    .status(201)
    .json(new ApiResponse(201, project, "Project created successfully"));
});

export const assignUserToProject = asyncHandler(async (req, res) => {

  const { projectId } = req.params;
  const { userId } = req.body;

  const project = await assignUserToProjectService(projectId, userId, req.user);

  res
    .status(200)
    .json(new ApiResponse(200, project, "User assigned to project successfully"));
});