import mongoose from "mongoose";

const vaccinationDoseSchema = new mongoose.Schema({
  doseId: { type: String, unique: true, required: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, 
  patientName: { type: String, required: true },
  vaccine: { type: String, required: true },
  dose: { type: String, required: true },
  date: { type: Date, required: true },
  clinic: { type: String, required: true },
  administeredBy: { type: String, required: true },
  status: {
    type: String,
    enum: ["Completed", "Pending"],
    default: "Completed",
  },
}, { timestamps: true });

export default mongoose.model("VaccinationDose", vaccinationDoseSchema);
