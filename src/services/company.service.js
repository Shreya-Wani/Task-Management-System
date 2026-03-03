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

//get company
export const getCompaniesService = async (query) => {
    const { page, limit, sortBy = "createdAt", order } = query;

    const skip = (page - 1) * limit;
    const sortOrder = order === "asc" ? 1 : -1;

    const filter = { isDeleted: false };

    const companies = await Company.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit);

    const total = await Company.countDocuments(filter);

    return {
        total,
        page,
        totalPages: Math.ceil(total / limit),
        companies,
    };
};

//get company by id
export const getCompanyByIdService = async (id) => {
    const company = await Company.findOne({
        _id: id,
        isDeleted: false,
    });

    if (!company) {
        throw new ApiError(404, "Company not found");
    }

    return company;
};

//update company
export const updateCompanyService = async (id, data) => {
    const company = await Company.findById(id);

    if (!company || company.isDeleted) {
        throw new ApiError(404, "Company not found");
    }

    const { name, description } = data;

    if (name) {
        const existingCompany = await Company.findOne({
            name,
            isDeleted: false,
        });

        if (existingCompany && existingCompany._id.toString() !== id) {
            throw new ApiError(400, "Company name already exists");
        }

        company.name = name;
    }

    if (description !== undefined) {
        company.description = description;
    }

    await company.save();

    return company;
};

//soft delete company
export const deleteCompanyService = async (id) => {
    const company = await Company.findById(id);

    if (!company || company.isDeleted) {
        throw new ApiError(404, "Company not found");
    }

    company.isDeleted = true;
    await company.save();

    return true;
};