import mongoose from "mongoose";

const stockCategorySchema = new mongoose.Schema(
   {
    name: { type: String, required: true, trim: true },
    unit: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    type: { type: String, enum: ["Drug", "Consumable"], required: true }, // ✅ added
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("StockCategory", stockCategorySchema);
