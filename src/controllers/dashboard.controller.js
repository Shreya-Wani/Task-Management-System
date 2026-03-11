import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { getAdminDashboardService } from "../services/dashboard.service.js";

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