import mongoose from 'mongoose';

const medicalServiceSchema = new mongoose.Schema(
  {
    consultation: String,
    patient: String,
    doctor: String,
    id: Number,
    service: String,
    instruction: String,
    outcome: String,
    created: String,
    status: String,
    reportUrl: String,
  },
  { timestamps: true }
);

export default mongoose.model('MedicalService', medicalServiceSchema);
