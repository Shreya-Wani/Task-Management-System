import Company from "../modules/company/company.model.js";
import ApiError from "../utils/ApiError.js";

const checkSubscriptionPlan = async (req, res, next) => {

    if(req.user.role === "superAdmin"){
        return next();
    };

    const company = await Company.findById(req.user.companyId);

    if(!company){
        throw new ApiError(404,"Company not found");
    };

    if(!company.isActive){
        throw new ApiError(403, "Your Subscription plan has expired. Activate your plan.")
    };

    next();
};

export default checkSubscriptionPlan;