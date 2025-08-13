import mongoose from "mongoose";

const consultationSchema = new mongoose.Schema(
  {
    patient: { type: String, required: true },
    services: { type: [String], required: true },
    details: { type: String, required: true },
    temperature: { type: String, required: true },
    weight: { type: String, required: true },
    consultationDate: { type: Date, required: true },
    consultationTime: { type: String, required: true },
    health: { type: String },
    bmi: { type: String },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // companyAdmin ID
    },
  },
  { timestamps: true }
);

const Consultation = mongoose.model("Consultation", consultationSchema);
export default Consultation;
