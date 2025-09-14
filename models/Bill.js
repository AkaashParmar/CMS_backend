import mongoose from "mongoose";

const billSchema = new mongoose.Schema(
  {
    item: { type: String, required: true },
    type: { type: String, enum: ["Pharmacy", "Vaccine", "Lab Test"], default: "Pharmacy" },
    isCart: { type: Boolean, default: false },
    batchNo: { type: String },
    expiry: { type: Date },
    quantity: { type: Number, required: true },
    mrp: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    cgst: { type: Number, default: 0 },
    sgst: { type: Number, default: 0 },
    amount: { type: Number },
    netPrice: { type: Number },
    profitPerItem: { type: Number, default: 0 },
    totalProfit: { type: Number, default: 0 },
    transactionId: { type: String, unique: true },
    paymentMode: { type: String, enum: ["Cash", "Online", "Card"], default: "Cash" },
    status: { type: String, enum: ["Pending", "Paid"], default: "Pending" },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Bill", billSchema);
