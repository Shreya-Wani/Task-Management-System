import User from "../models/user.model.js";
import Company from "../models/company.model.js";
import bcrypt from "bcryptjs";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

//admin creation by superAdmin
export const createAdmin = asyncHandler(async (req, res) => {
    const { name, email, password, companyId } = req.body;

    if (!name || !email || !password || !companyId) {
        throw new ApiError(400, "All fields are required");
    }

    const company = await Company.findById(companyId);
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
        companyId,
    });

    admin.password = undefined;

    return res
        .status(201)
        .json(new ApiResponse(201, admin, "Admin created successfully"));
});

//craete user from admin (in same company)
export const createUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        throw new ApiError(400, "All fields are required");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ApiError(400, "User already exists");
    }

    const companyId = req.user.companyId;

    if (!companyId) {
        throw new ApiError(400, "Admin must belong to a company");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: "user",
        companyId,
    });

    user.password = undefined;

    return res
        .status(201)
        .json(new ApiResponse(201, user, "User created successfully"));
});

//get users ( Admin can only see users of their company + SuperAdmin can see all users )
export const getUsers = asyncHandler(async (req, res) => {
    let users;

    if (req.user.role === "superAdmin") {
        users = await User.find({ isDeleted: false }).select("-password -refreshToken");
    } else {
        users = await User.find({
            companyId: req.user.companyId,
            isDeleted: false,
        }).select("-password -refreshToken");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, users, "Users fetched successfully"));
});

// get user by id
export const getUserById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const user = await User.findOne({
        _id: id,
        isDeleted: false,
    }).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    //user can only see their profile
    if (req.user.role === "user") {
        if (req.user._id.toString() !== id) {
            throw new ApiError(403, "You can only view your own profile");
        }
    }

    //admin can only see users of their company
    if (req.user.role === "admin") {
        if (user.companyId?.toString() !== req.user.companyId?.toString()) {
            throw new ApiError(403, "Cannot access user from another company");
        }
    }

    return res
        .status(200)
        .json(new ApiResponse(200, user, "User fetched successfully"));

});

//update user ( Admin can only update users of their company + SuperAdmin can update all users )
export const updateUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, email, role } = req.body;

    const user = await User.findById(id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // user can only update users of their company
    if (req.user.role === "user") {
        if (req.user._id.toString() !== id.toString()) {
            throw new ApiError(403, "You can only update your own profile");
        }
    }

    // admin can only update users of their company
    if (req.user.role === "admin") {
        if (user.companyId?.toString() !== req.user.companyId?.toString()) {
            throw new ApiError(403, "Cannot update user from another company");
        }

        if (user.role === "superAdmin") {
            throw new ApiError(403, "Cannot update super admin");
        }

        if (role === "superAdmin") {
            throw new ApiError(403, "Cannot assign superAdmin role");
        }
    }

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;

    // Only superAdmin can update role
    if (role && req.user.role === "superAdmin") {
        user.role = role;
    }

    await user.save();

    user.password = undefined;
    user.refreshToken = undefined;

    return res
        .status(200)
        .json(new ApiResponse(200, user, "User updated successfully"));
});

// Delete user ( Admin can only delete users of their company + SuperAdmin can delete all users )
export const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user || user.isDeleted) {
        throw new ApiError(404, "User not found");
    }

    // user can delete only their profile
    if (req.user.role === "user") {
        if (req.user._id.toString() !== id.toString()) {
            throw new ApiError(403, "You can only delete your own profile");
        }
    }

    // admin can delete only users of their company
    if (req.user.role === "admin") {
        if (user.companyId?.toString() !== req.user.companyId?.toString()) {
            throw new ApiError(403, "Cannot delete user from another company");
        }

        if (user.role === "superAdmin") {
            throw new ApiError(403, "Cannot delete super admin");
        }
    }

    user.isDeleted = true;
    await user.save();

    return res
        .status(200)
        .json(new ApiResponse(200, null, "User deleted successfully"));
});
