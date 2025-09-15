import mongoose from "mongoose";

const pendingTaskSchema = new mongoose.Schema(
    {
        description: { type: String, required: true },
        isCompleted: { type: Boolean, default: false },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    },
    { timestamps: true }
);

const PendingTask = mongoose.model("PendingTask", pendingTaskSchema);

export default PendingTask;
