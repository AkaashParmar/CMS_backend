import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    service: { type: String, required: true },
    description: String,
    qty: { type: Number, default: 1 },
    price: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const billingSchema = new mongoose.Schema(
  {
    billId: { type: String, required: true },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // patient: { type: String, required: true },
    service: { type: String, required: true },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    treatment: { type: String, required: true },
    amount: { type: Number, required: true },
    method: { type: String },
    date: { type: Date, default: Date.now },
    status: { type: String, enum: ["Paid", "Unpaid"], default: "Unpaid" },
    items: [itemSchema],
    dueBalance: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Billing", billingSchema);
