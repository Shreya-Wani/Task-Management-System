import User from "../models/user.model.js";
import Project from "../models/project.model.js";
import Task from "../models/task.model.js";
import Company from "../models/company.model.js"

export const getAdminDashboardService = async (user) => {

    const companyId = user.companyId;

    const taskStats = await Task.aggregate([
        {
            $match: {
                companyId: companyId,
                isDeleted: false
            }
        },
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 }
            }
        }
    ]);

    const summary = {
        "to-do": 0,
        "in-progress": 0,
        "done": 0,
        "testing": 0,
        "qa-verified": 0,
        "re-open": 0,
        "deployment": 0
    };

    taskStats.forEach(stat => {
        summary[stat._id] = stat.count;
    });

    const totalUsers = await User.countDocuments({
        companyId,
        role: "user",
        isDeleted: false
    });

    const totalProjects = await Project.countDocuments({
        companyId,
        isDeleted: false
    });

    const totalTasks = await Task.countDocuments({
        companyId,
        isDeleted: false
    });

    return {
        totalUsers,
        totalProjects,
        totalTasks,
        tasksStatusSummary: summary
    };
}

export const getSuperadminDashboardService = async () => {

    const totalCompanies = await Company.countDocuments({
        isDeleted: false
    });

    const activeCompanies = await Company.countDocuments({
        isDeleted: false,
        isActive: true
    });

    const expiredCompanies = await Company.countDocuments({
        isDeleted: false,
        inActive: false
    });

    const totalUsers = await User.countDocuments({
        role: "user",
        isDeleted: false
    });

    return {
        totalCompanies,
        activeCompanies,
        expiredCompanies,
        totalUsers
    }
}