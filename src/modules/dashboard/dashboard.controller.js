import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import { getAdminDashboardService, getSuperadminDashboardService } from "../dashboard/dashboard.service.js";

export const getAdminDashboard = asyncHandler(async (req, res) => {

    const dashboardData = await getAdminDashboardService(req.user);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                dashboardData,
                "Admin dashboard fetched successfully"
            )
        );
});

export const getSuperAdminDashboard = asyncHandler(async (req, res) => {

    const dashboardData = await getSuperadminDashboardService();

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                dashboardData,
                "SuperAdmin dashboard fetched successfully"
            )
        );
})