import Project from "../models/project.model.js";
import Company from "../models/company.model.js";
import Plan from "../models/plan.model.js";
import ApiError from "../utils/ApiError.js";
import User from "../models/user.model.js";

export const createProjectService = async (data, adminUser) => {

    const { name, description } = data;

    const company = await Company.findById(adminUser.companyId);

    if (!company) {
        throw new ApiError(404, "Company not found");
    }

    const plan = await Plan.findById(company.planId);

    const projectCount = await Project.countDocuments({
        companyId: company._id,
        isDeleted: false,
    });

    if (plan.maxProjects !== -1 && projectCount >= plan.maxProjects) {
        throw new ApiError(
            403,
            "Project limit reached for your subscription plan"
        );
    }

    const project = await Project.create({
        name,
        description,
        companyId: company._id,
        createdBy: adminUser._id,
    });

    return project;
};

export const assignUserToProjectService = async (projectId, userId, adminUser) => {
    const project = await Project.findById(projectId);

    if (!project || project.isDeleted) {
        throw new ApiError(404, "Project not found");
    }

    // Ensure project belongs to same company
    if (project.companyId.toString() !== adminUser.companyId.toString()) {
        throw new ApiError(403, "Unauthorized access to this project");
    }

    const user = await User.findById(userId);

    if (!user || user.isDeleted) {
        throw new ApiError(404, "User not found");
    }

    if (user.companyId.toString() !== adminUser.companyId.toString()) {
        throw new ApiError(403, "User does not belong to your company");
    }

    // Prevent duplicate assignment
    if (project.assignedUsers.includes(userId)) {
        throw new ApiError(400, "User already assigned to this project");
    }

    project.assignedUsers.push(userId);

    await project.save();

    return project;
};

export const getMyProjectsService = async (user) => {
    const projects = await Project.find({
        assignedUsers: user._id,
        isDeleted: false
    })
        .populate("createdBy", "name email")
        .populate("assignedUsers", "name email");

    return projects;
};