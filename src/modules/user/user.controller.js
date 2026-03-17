import User from "./user.model.js";
import Company from "../company/company.model.js";
import bcrypt from "bcryptjs";
import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import { registerSuperAdminService, createUserService, getUsersService, getUserByIdService, updateUserService, deleteUserService } from "../user/user.service.js";

//create super admin ( only one super admin allowed )
export const registerSuperAdmin = asyncHandler(async (req, res) => {

    const user = await registerSuperAdminService(req.body);

    return res
        .status(201)
        .json(new ApiResponse(201, user, "Super admin registered successfully"));

});

//craete user by admin 
export const createUser = asyncHandler(async (req, res) => {
    const user = await createUserService(req.body, req.user);

    user.password = undefined;

    return res
        .status(201)
        .json(new ApiResponse(201, user, "User created successfully"));
});

//get users 
export const getUsers = asyncHandler(async (req, res) => {
    const data = await getUsersService(req.query, req.user);

    return res
        .status(200)
        .json(new ApiResponse(200, data, "Users fetched successfully"));
});

// get user by id
export const getUserById = asyncHandler(async (req, res) => {
    const user = await getUserByIdService(req.params.id, req.user);

    return res
        .status(200)
        .json(new ApiResponse(200, user, "User fetched successfully"));

});

//update user ( Admin can only update users of their company + SuperAdmin can update all users )
export const updateUser = asyncHandler(async (req, res) => {
    const updatedUser = await updateUserService(
        req.params.id,
        req.body,
        req.user
    );

    updatedUser.password = undefined;
    updatedUser.refreshToken = undefined;

    return res
        .status(200)
        .json(new ApiResponse(200, updatedUser, "User updated successfully"));
});

// Delete user ( Admin can only delete users of their company + SuperAdmin can delete all users )
export const deleteUser = asyncHandler(async (req, res) => {
    await deleteUserService(req.params.id, req.user);

    return res
        .status(200)
        .json(new ApiResponse(200, null, "User deleted successfully"));
});
