import Company from "../models/company.model.js";
import ApiError from "../utils/ApiError.js";

export const createCompanyService = async (data, userId) => {
    const { name, description } = data;

    const existingCompany = await Company.findOne({
        name,
        isDeleted: false,
    });

    if (existingCompany) {
        throw new ApiError(400, "Company already exists");
    }

    const company = await Company.create({
        name,
        description,
        createdBy: userId,
    });

    return company;
}; 