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
import {
    registerAdminService,
    loginService,
    refreshAccessTokenService,
    logoutService,
    verifyLoginOTPService
} from "../services/auth.service.js";

//register User
export const register = asyncHandler(async (req, res) => {
    const result = await registerAdminService(req.body);

    return res
        .status(201)
        .json(new ApiResponse(201, result, "Registration successful. Complete payment to activate account."));
});

//login User
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const result = await loginService(email, password);

    return res
        .status(200)
        .json(new ApiResponse(200, result, "OTP sent successfully"));
});

//refreshToken
export const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken;

    const newAccessToken = await refreshAccessTokenService(incomingRefreshToken);

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

    await logoutService(userId);

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

//verifyLoginOTP
export const verifyLoginOTP = asyncHandler(async (req, res) => {

    const { email, otp } = req.body;

    const { user, accessToken, refreshToken } =
        await verifyLoginOTPService(email, otp);

    const options = {
        httpOnly: true,
        secure: false
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, {
            ...options,
            maxAge: 15 * 60 * 1000
        })
        .cookie("refreshToken", refreshToken, {
            ...options,
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
        .json(new ApiResponse(200, user, "Login successful"));

});