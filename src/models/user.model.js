import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true,
        },
        loginOTP: {
            type: String
        },

        loginOTPExpires: {
            type: Date
        },
        role: {
            type: String,
            enum: ["superAdmin", "admin", "user"],
            default: "user",
        },
        status: {
            type: String,
            enum: ["inactive", "active"],
            default: "inactive"
        },
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            default: null,
        },
        refreshToken: {
            type: String,
        },
        isDeleted: {
            type: Boolean,
            default: false
        },
    },
    { timestamps: true }
);

export default mongoose.model("User", userSchema);
