import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    price: {
      type: Number,
      required: true
    },

    duration: {
      type: Number, // days
      required: true
    },

    maxUsers: {
      type: Number,
      required: true
    },

    maxProjects: {
      type: Number,
      required: true
    },

    maxTasks: {
      type: Number,
      required: true
    },

    isUnlimited: {
      type: Boolean,
      default: false
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Plan", planSchema);