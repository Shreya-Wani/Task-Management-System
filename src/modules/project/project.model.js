import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
        },

        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            required: true,
        },

        assignedUsers: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "User",
            default: []
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Project", projectSchema);