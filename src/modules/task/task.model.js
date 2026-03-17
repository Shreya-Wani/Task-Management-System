import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    taskId: {
      type: String,
      required: true,
      unique: true
    },

    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String
    },

    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true
    },

    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    reportTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Medium"
    },

    status: {
      type: String,
      enum: [
        "to-do",
        "in-progress",
        "done",
        "testing",
        "qa-verified",
        "re-open",
        "deployment"
      ],
      default: "to-do"
    },

    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export default mongoose.model("Task", taskSchema);