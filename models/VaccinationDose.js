import mongoose from "mongoose";

const vaccinationDoseSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  patientName: { type: String, required: true },   // for quick frontend display
  vaccine: { type: String, required: true },       // e.g. "Pfizer"
  dose: { type: String, required: true },          // "1st Dose", "2nd Dose"
  date: { type: Date, required: true },
  clinic: { type: String, required: true },
  administeredBy: { type: String, required: true },
  status: { type: String, enum: ["Completed", "Pending"], default: "Completed" },
}, { timestamps: true });

export default mongoose.model("VaccinationDose", vaccinationDoseSchema);
