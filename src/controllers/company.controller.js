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