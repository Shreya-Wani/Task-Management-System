import Plan from '../models/plan.model.js';
import ApiError from '../utils/ApiError.js';

export const createPlanService = async (data) => {

    const existingPlan = await Plan.findOne({ name: data.name });

    if (existingPlan) {
        throw new ApiError(400, 'Plan with this name already exists');
    }

    const plan = await Plan.create(data);

    return plan;
}

export const getAllPlansService = async () => {

    const plans = await Plan.find({ isActive: true });

    return plans;
}

export const updatePlanService = async (planId, data) => {
    const plan = await Plan.findById(planId);

    if (!plan) {
        throw new ApiError(404, 'Plan not found');
    }

    Object.assign(plan, data);

    await plan.save();

    return plan;
}