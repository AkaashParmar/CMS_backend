import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    reporter: { type: String },
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "Resolved"],
      default: "Pending",
    },
    solution: { type: String, default: "" },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reporterType: {
      type: String,
      enum: ["patient", "Employee"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Issue", feedbackSchema);
