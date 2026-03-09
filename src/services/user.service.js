import User from "../models/user.model.js";
import Company from "../models/company.model.js";
import bcrypt from "bcryptjs";
import Plan from "../models/plan.model.js";
import ApiError from "../utils/ApiError.js";
import { sendEmail } from "../utils/sendEmail.js";

export const registerSuperAdminService = async (data) => {
    const { name, email, password } = data;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new ApiError(400, "User already exists");
    }

    // check if superAdmin already exists
    const superAdminExists = await User.findOne({ role: "superAdmin" });

    if (superAdminExists) {
        throw new ApiError(403, "Super admin already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const superAdmin = await User.create({
        name,
        email,
        password: hashedPassword,
        role: "superAdmin",
        status: "active"
    });

    return superAdmin;
};

//create admin
export const createAdminService = async (data) => {
    const { name, email, password, companyId } = data;

    const company = await Company.findOne({
        _id: companyId,
        isDeleted: false,
    });

    if (!company) {
        throw new ApiError(404, "Company not found");
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new ApiError(400, "User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await User.create({
        name,
        email,
        password: hashedPassword,
        role: "admin",
        companyId: company._id,
        status: "inactive"
    });

    return admin;
};

//create user by admin (in same company)
export const createUserService = async (data, adminUser) => {
    const { name, email, password } = data;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new ApiError(400, "User already exists");
    }

    //get company
    const company = await Company.findById(adminUser.companyId);

    if (!company) {
        throw new ApiError(404, "Company not found");
    }

    //get company plan
    const plan = await Plan.findById(company.planId);

    const userCount = await User.countDocuments({
        companyId: company._id,
        role: "user",
        isDeleted: false,
    });

    if (plan.maxUsers !== -1 && userCount >= plan.maxUsers) {
        throw new ApiError(
            403,
            "User limit reached for your subscription plan"
        );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: "user",
        companyId: adminUser.companyId,
        status: "active"
    });

    try {
        await sendEmail({
            to: email,
            subject: "Welcome to Task Management System",
            text: `Hello ${name}, your account has been created successfully.`
        });
    } catch (error) {
        console.log("Email sending failed:", error.message);
    }

    return user;
};

//get users
export const getUsersService = async (query, currentUser) => {
    const { page, limit, sortBy = "createdAt", order } = query;

    const skip = (page - 1) * limit;
    const sortOrder = order === "asc" ? 1 : -1;

    let filter = { isDeleted: false };

    if (currentUser.role === "admin") {
        filter.companyId = currentUser.companyId;
    }

    const users = await User.find(filter)
        .select("-password -refreshToken")
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit);

    const total = await User.countDocuments(filter);

    return {
        total,
        page,
        totalPages: Math.ceil(total / limit),
        users,
    };
};

//get users by id 
export const getUserByIdService = async (id, currentUser) => {
    const user = await User.findOne({
        _id: id,
        isDeleted: false,
    }).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (currentUser.role === "user") {
        if (currentUser._id.toString() !== id) {
            throw new ApiError(403, "You can only view your own profile");
        }
    }

    if (currentUser.role === "admin") {
        if (user.companyId?.toString() !== currentUser.companyId?.toString()) {
            throw new ApiError(403, "Cannot access user from another company");
        }
    }

    return user;
};

//update user
export const updateUserService = async (id, data, currentUser) => {
    const user = await User.findById(id);

    if (!user || user.isDeleted) {
        throw new ApiError(404, "User not found");
    }

    const { name, email, role } = data;

    // user can only update their own profile
    if (currentUser.role === "user") {
        if (currentUser._id.toString() !== id) {
            throw new ApiError(403, "You can only update your own profile");
        }
    }

    //Admin can only update users of their company and cannot update superAdmin
    if (currentUser.role === "admin") {
        if (user.companyId?.toString() !== currentUser.companyId?.toString()) {
            throw new ApiError(403, "Cannot update user from another company");
        }

        if (user.role === "superAdmin") {
            throw new ApiError(403, "Cannot update super admin");
        }

        if (role === "superAdmin") {
            throw new ApiError(403, "Cannot assign superAdmin role");
        }
    }

    if (role && currentUser.role === "superAdmin") {
        user.role = role;
    }

    await user.save();

    return user;
};

//delete user
export const deleteUserService = async (id, currentUser) => {
    const user = await User.findById(id);

    if (!user || user.isDeleted) {
        throw new ApiError(404, "User not found");
    }

    if (currentUser.role === "user") {
        if (currentUser._id.toString() !== id) {
            throw new ApiError(403, "You can only delete your own account");
        }
    }

    if (currentUser.role === "admin") {
        if (user.companyId?.toString() !== currentUser.companyId?.toString()) {
            throw new ApiError(403, "Cannot delete user from another company");
        }

        if (user.role === "superAdmin") {
            throw new ApiError(403, "Cannot delete super admin");
        }
    }

    user.isDeleted = true;
    await user.save();

    return true;
}