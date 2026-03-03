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
import jwt from "jsonwebtoken";

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

//login User

export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    const user = await User.findOne({ email, isDeleted: false });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (user.companyId) {
        const company = await Company.findById(user.companyId);

        if (!company || company.isDeleted) {
            throw new ApiError(403, "Company is deactivated");
        }
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid credentials");
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    user.password = undefined;

    const options = {
        httpOnly: true,
        secure: false,
    };

    return res.status(200)
        .cookie("accessToken", accessToken, {
            ...options,
            maxAge: 15 * 60 * 1000, //15 min
        })
        .cookie("refreshToken", refreshToken, {
            ...options,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        })
        .json(new ApiResponse(200, user, "Login successful"));
});

//refreshToken
export const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Refresh token missing");
    }

    const decoded = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decoded._id);

    if (!user) {
        throw new ApiError(401, "Invalid refresh token");
    }

    if (user.refreshToken !== incomingRefreshToken) {
        throw new ApiError(401, "Refresh token expired or reused");
    }

    const newAccessToken = generateAccessToken(user);

    const options = {
        httpOnly: true,
        secure: false,
    };

    return res
        .status(200)
        .cookie("accessToken", newAccessToken, {
            ...options,
            maxAge: 15 * 60 * 1000,
        })
        .json(new ApiResponse(200, {}, "Access token refreshed"));
});

//logout
export const logout = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    await User.findByIdAndUpdate(userId, {
        $unset: { refreshToken: 1 },
    });

    const options = {
        httpOnly: true,
        secure: false,
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "Logged out successfully"));
});

