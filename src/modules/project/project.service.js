import Project from "../project/project.model.js";
import Company from "../company/company.model.js";
import Plan from "../plan/plan.model.js";
import ApiError from "../../utils/ApiError.js";
import User from "../user/user.model.js";
import { sendEmail } from "../../utils/sendEmail.js";
import { getIO } from "../../utils/socket.js";
import { getPagination } from "../../utils/pagination.js";

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

    if (project.assignedUsers.some(u => u.toString() === userId)) {
        throw new ApiError(400, "User already assigned to this project");
    }

    project.assignedUsers.push(userId);

    await project.save();

    await sendEmail({
        to: user.email,
        subject: "Project Assignment",
        text: `You have been assigned to project: ${project.name}`
    });

    const io = getIO();

    io.emit("project_assigned", {
        projectId: project._id,
        userId: user._id,
        projectName: project.name
    });

    return project;
};

export const getMyProjectsService = async (query, user) => {

    const { page, limit, skip, sort} = getPagination(query)

    let filter = {
        companyId: user.companyId,
        isDeleted: false
    };

    if (user.role === "user") {
        filter.assignedUsers = user._id;
    };

    const projects = await Project.find(filter)
        .populate("createdBy", "name email")
        .populate("assignedUsers", "name email")
        .sort(sort)
        .skip(skip)
        .limit(limit);

    const total = await Project.countDocuments(filter);

    return {
        total,
        page,
        totalPages: Math.ceil (total / limit),
        projects 
    };
};

export const updateProjectService = async (projectId, data, user) => {
    const project = await Project.findById(projectId);

    if (!project || project.isDeleted) {
        throw new ApiError(404, "Project not found");
    }

    if (project.companyId.toString() !== user.companyId.toString()) {
        throw new ApiError(403, "Unauthorized access to this project");
    }

    Object.assign(project, data);

    await project.save();

    return project;
};

export const deleteProjectService = async (projectId, user) => {

    const project = await Project.findById(projectId);

    if (!project || project.isDeleted) {
        throw new ApiError(404, "Project not found");
    }

    if (project.companyId.toString() !== user.companyId.toString()) {
        throw new ApiError(403, "Unauthorized access");
    }

    project.isDeleted = true;

    await project.save();

    return project;
};