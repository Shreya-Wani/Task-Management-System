import Project from "../models/project.model.js";
import Company from "../models/company.model.js";
import Plan from "../models/plan.model.js";
import ApiError from "../utils/ApiError.js";

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