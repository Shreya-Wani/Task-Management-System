import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import Company from "../company/company.model.js";
import { createCompanyService, getCompaniesService, getCompanyByIdService, updateCompanyService, deleteCompanyService, getMyCompanyService } from "../company/company.service.js";

//create company
export const createCompany = asyncHandler(async (req, res) => {
    const company = await createCompanyService(req.body, req.user._id);

    return res
        .status(201)
        .json(new ApiResponse(201, company, "Company created successfully"));
})

//get all companies
export const getAllCompanies = asyncHandler(async (req, res) => {
    const data = await getCompaniesService(req.query);

    return res
        .status(200)
        .json(new ApiResponse(200, data, "Companies fetched successfully"));
});

//get company by id
export const getCompanyById = asyncHandler(async (req, res) => {
    const company = await getCompanyByIdService(req.params.id, req.user);

    return res
        .status(200)
        .json(new ApiResponse(200, company, "Company fetched successfully"));
});

//update company
export const updateCompany = asyncHandler(async (req, res) => {
    const company = await updateCompanyService(
        req.params.id,
        req.body,
        req.user
    );

    return res
        .status(200)
        .json(new ApiResponse(200, company, "Company updated successfully"));
});

//soft delete company
export const deleteCompany = asyncHandler(async (req, res) => {
    await deleteCompanyService(req.params.id, req.user);

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Company deleted successfully"));
});

//get my company (for admin)
export const getMyCompany = asyncHandler(async (req, res) => {

    const company = await getMyCompanyService(req.user);

    return res
        .status(200)
        .json(new ApiResponse(200, company, "Company fetched successfully"));
});