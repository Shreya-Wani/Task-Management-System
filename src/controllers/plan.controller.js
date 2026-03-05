import { createPlanService } from "../services/plan.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

export const createPlan = asyncHandler(async (req, res) => {

    const plan = await createPlanService(req.body);

    return res
        .status(201)
        .json(new ApiResponse(201, plan, "Plan created successfully"));
});
