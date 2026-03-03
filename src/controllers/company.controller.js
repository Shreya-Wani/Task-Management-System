import Company from "../models/company.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

export const createCompany = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    if (!name) {
        throw new ApiError(400, "Company name is required");
    }

    const existingCompany = await Company.findOne({ name });

    if (existingCompany) {
        throw new ApiError(400, "Company already exists");
    }

    const company = await Company.create({
        name,
        description,
        createdBy: req.user._id,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, company, "Company created successfully"));
})

//get all companies
export const getAllCompanies = asyncHandler(async (req, res) => {
    const { page, limit, sortBy = "createdAt", order } = req.query;

    const skip = (page - 1) * limit;

    const sortOrder = order === "asc" ? 1 : -1;

    const filter = { isDeleted: false };

    const companies = await Company.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit);

    const total = await Company.countDocuments(filter);

    return res.status(200).json(
        new ApiResponse(200, {
            total,
            page,
            totalPages: Math.ceil(total / limit),
            companies,
        }, "Companies fetched successfully")
    );
});

//get company by id
export const getCompanyById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const company = await Company.findOne({
        _id: id,
        isDeleted: false,
    });

    if (!company) {
        throw new ApiError(404, "Company not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, company, "Company fetched successfully"));
});

export const updateCompany = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;

    const company = await Company.findOne({
        _id: id,
        isDeleted: false,
    });

    if (!company) {
        throw new ApiError(404, "Company not found");
    }

    // Prevent duplicate company name
    if (name) {
        const existingCompany = await Company.findOne({ name });

        if (existingCompany && existingCompany._id.toString() !== id) {
            throw new ApiError(400, "Company name already exists");
        }

        company.name = name;
    }

    if (description !== undefined) {
        company.description = description;
    }

    await company.save();

    return res
        .status(200)
        .json(new ApiResponse(200, company, "Company updated successfully"));
});

//soft delete company
export const deleteCompany = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const company = await Company.findById(id);

    if (!company) {
        throw new ApiError(404, "Company not found");
    }

    if (company.isDeleted) {
        throw new ApiError(400, "Company already deleted");
    }

    company.isDeleted = true;
    await company.save();

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Company deleted successfully"));
});