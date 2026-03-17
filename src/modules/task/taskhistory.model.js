import mongoose from "mongoose";

const taskHistorySchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true
    },

    action: {
      type: String,
      required: true
    },

    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    oldValue: {
      type: String
    },

    newValue: {
      type: String
    }
  },
  { timestamps: true }
);

export default mongoose.model("TaskHistory", taskHistorySchema);