import mongoose from "mongoose";

const patientReportSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    fileUrl: { type: String },
    date: { type: String, required: true },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    comments: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Pending Review", "Reviewed"],
      default: "Pending Review",
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model("PatientReport", patientReportSchema);
