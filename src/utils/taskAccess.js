import ApiError from "../utils/ApiError.js";

export const checkTaskAccess = (task, user) => {

    if (user.role === "admin") {
        if (task.companyId.toString() !== user.companyId.toString()) {
            throw new ApiError(403, "Unauthorized access to this task");
        }
    }

    if (user.role === "user") {
        if (task.assignedTo.toString() !== user._id.toString()) {
            throw new ApiError(403, "You can only access your assigned tasks");
        }
    }

}