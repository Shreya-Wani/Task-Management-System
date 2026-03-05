import { createPlanService, getAllPlansService, updatePlanService, deletePlanService } from "../services/plan.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

export const createPlan = asyncHandler(async (req, res) => {

    const plan = await createPlanService(req.body);

    return res
        .status(201)
        .json(new ApiResponse(201, plan, "Plan created successfully"));
});

export const getAllPlans = asyncHandler ( async (req, res) => {
    
    const plans = await getAllPlansService();

    return res
        .status(200)
        .json(new ApiResponse(200, plans, "Plans retrieved successfully"));
})

export const updatePlan = asyncHandler ( async (req, res) => {
    const plan = await updatePlanService(req.params.planId, req.body);

    return res
        .status(200)
        .json(new ApiResponse(200, plan, "Plan updated successfully"));
});

export const disablePlan = asyncHandler (async (req, res) => {
    const plan = await deletePlanService(req.params.planId);

    return res
        .status(200)
        .json(new ApiResponse(200, plan, "Plan disabled successfully"));
})