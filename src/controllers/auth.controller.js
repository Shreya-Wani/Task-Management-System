import User from "../models/user.model.js";
import Company from "../models/company.model.js";
import bcrypt from "bcryptjs";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateTokens.js";

//register User
export const register = asyncHandler(async (req, res) => {
    const { name, email, password, role, companyId } = req.body;

    if (!name || !email || !password) {
        throw new ApiError(400, "All fields are required");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ApiError(400, "User already exists");
    }

    if (role !== "superAdmin") {
        if (!companyId) {
            throw new ApiError(400, "Company ID is required");
        }

        const companyExists = await Company.findById(companyId);
        if (!companyExists) {
            throw new ApiError(404, "Invalid Company ID");
        }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role,
        companyId: role === "superAdmin" ? null : companyId,
    });

    user.password = undefined;

    return res
        .status(201)
        .json(new ApiResponse(201, user, "User registered successfully"));
});
