import mongoose from "mongoose";

const patientReportSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    fileUrl: { type: String },
    date: { type: String, required: true },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Doctor's User model
      required: true,
    },
    comments: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Pending Review", "Reviewed"],
      default: "Pending Review",
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Patient's User model
    },
  },
  { timestamps: true }
);

export default mongoose.model("PatientReport", patientReportSchema);
