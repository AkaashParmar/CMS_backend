import mongoose from "mongoose";

const patientReportSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    fileUrl: { type: String },
    date: { type: String, required: true },

    // Reference to the Doctor selected from dropdown
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Make sure the User model has role 'doctor'
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
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model("PatientReport", patientReportSchema);
