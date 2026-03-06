import User from "../models/user.model.js";
import Company from "../models/company.model.js";
import bcrypt from "bcryptjs";
import ApiError from "../utils/ApiError.js";
import {
    generateAccessToken,
    generateRefreshToken
} from "../utils/generateTokens.js";
import jwt from "jsonwebtoken";
import { generateOTP } from "../utils/generateOTP.js";
import { sendEmail } from "../utils/sendEmail.js";
import company from "../models/company.model.js";
import Plan from "../models/plan.model.js";

export const registerAdminService = async (data) => {

    const { name, email, password, companyName, planId } = data;

    if (!name || !email || !password || !companyName || !planId) {
        throw new ApiError(400, "All fields are required");
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new ApiError(400, "User already exists");
    }

    const plan = await Plan.findById(planId);

    if (!plan) {
        throw new ApiError(404, "Invalid plan selected");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    //create admin
    const admin = await User.create({
        name,
        email,
        password: hashedPassword,
        role: "admin",
        status: "inactive"
    });

    //create company with adminId
    const company = await Company.create({
        name: companyName,
        adminId: admin._id,
        planId: planId,
        paymentStatus: "pending",
        isActive: false
    });

    admin.companyId = company._id;
    await admin.save();

    admin.password = undefined;

    return {
        company,
        admin
    };
};

export const loginService = async (email, password) => {

    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    const user = await User.findOne({ email, isDeleted: false });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (user.status !== "active") {
        throw new ApiError(403, "Account not activated. Complete payment first.");
    }

    const company = await Company.findById(user.companyId);

    if (!company || !company.isActive) {
        throw new ApiError(403, "Company is not active");
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid credentials");
    }

    const otp = generateOTP();
    console.log("LOGIN OTP:", otp);

    user.loginOTP = otp;
    user.loginOTPExpires = Date.now() + 5 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    await sendEmail(
        user.email,
        "Login OTP",
        `Your OTP for login is: ${otp}`
    );

    return {
        message: "OTP sent to your email"
    };
};

export const refreshAccessTokenService = async (incomingRefreshToken) => {

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

    return newAccessToken;
};

export const logoutService = async (userId) => {

    await User.findByIdAndUpdate(userId, {
        $unset: { refreshToken: 1 }
    });

    return true;
};

export const verifyLoginOTPService = async (email, otp) => {

    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (user.loginOTP !== otp) {
        throw new ApiError(400, "Invalid OTP");
    }

    if (user.loginOTPExpires < Date.now()) {
        throw new ApiError(400, "OTP expired");
    }

    user.loginOTP = undefined;
    user.loginOTPExpires = undefined;

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });

    user.password = undefined;

    return {
        user,
        accessToken,
        refreshToken
    };
};