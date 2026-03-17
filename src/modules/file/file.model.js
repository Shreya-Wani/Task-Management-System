import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
    taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task"
    },

    fileName: String,

    fileUrl: String,

    publicId: String,

    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true });

export default mongoose.model("File", fileSchema);