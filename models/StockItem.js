import mongoose from "mongoose";

const stockItemSchema = new mongoose.Schema(
  {
    stockId: { type: String, unique: true },
    category: { type: String, required: true },
    itemName: { type: String, required: true },
    stockType: { type: String, enum: ["product", "service"], required: true },
    originalQuantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    totalPurchasePrice: { type: Number, required: true },
    expiryDate: { type: Date },
    manufactureDate: { type: Date },
    supplier: { type: String, required: true },
    supplierContact: { type: String },
    supplierAddress: { type: String },
    supplierEmail: { type: String },
    supplierPhone: { type: String },
    description: { type: String },
    clinic: { type: mongoose.Schema.Types.ObjectId, ref: "Clinic" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// Pre-save hook to generate stockId
stockItemSchema.pre("save", async function (next) {
  if (this.isNew) {
    const lastItem = await this.constructor.findOne().sort({ createdAt: -1 });
    let nextNumber = 1001;
    if (lastItem && lastItem.stockId) {
      const lastNumber = parseInt(lastItem.stockId.split("-")[1]);
      nextNumber = lastNumber + 1;
    }
    this.stockId = `STK-${nextNumber}`;
  }
  next();
});

export default mongoose.model("StockItem", stockItemSchema);
