import mongoose from "mongoose";

const vaccinationStockSchema = new mongoose.Schema(
  {
    brand: { type: String, required: true },
    batchNo: { type: String, required: true },
    expiryDate: { type: Date, required: true },
    available: { type: Number, required: true },
    consumed: { type: Number, required: true, default: 0 },
    business: { type: String },
    profit: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("VaccinationStock", vaccinationStockSchema);
