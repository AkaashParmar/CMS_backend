import mongoose from "mongoose";

const stockOutSchema = new mongoose.Schema(
  {
    stockOutId: { type: String, unique: true },

    stockItem: {
      type: String,
      required: true,
    },

    createdDate: { type: Date, required: true },
    unitPrice: { type: Number, required: true },
    quantity: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    quantityAfter: { type: Number, required: true },
    description: { type: String },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Auto-generate stockOutId
stockOutSchema.pre("save", async function (next) {
  if (this.isNew) {
    const lastRecord = await this.constructor.findOne().sort({ createdAt: -1 });
    let nextNumber = 1001;
    if (lastRecord && lastRecord.stockOutId) {
      const lastNumber = parseInt(lastRecord.stockOutId.split("-")[1]);
      nextNumber = lastNumber + 1;
    }
    this.stockOutId = `STO-${nextNumber}`;
  }
  next();
});

export default mongoose.model("StockOut", stockOutSchema);
