import mongoose from 'mongoose';

const PrescriptionSettingSchema = new mongoose.Schema({
  companyId: { type: String, required: true }, // ✅ this must exist
  companyName: { type: String, required: true },
  template: { type: String, required: true },
  fontSize: { type: Number, default: 12 },
  fontFamily: { type: String, default: "sans-serif" },
  pageSize: { type: String, default: "A4" },
  prescriptionFormat: { type: String, default: "PDF" },
  language: { type: String, default: "en" },
}, { timestamps: true });

// Default export
const PrescriptionSetting = mongoose.model("PrescriptionSetting", PrescriptionSettingSchema);
export default PrescriptionSetting;
