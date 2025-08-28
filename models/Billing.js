import mongoose from "mongoose";

// for invoice items
const itemSchema = new mongoose.Schema(
  {
    service: { type: String, required: true },
    description: String,
    qty: { type: Number, default: 1 },
    price: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const billingSchema = new mongoose.Schema(
  {
    billId: { type: String, required: true, unique: true },
    patientId: { type: String, required: true },
    patient: { type: String, required: true },
    service: { type: String, required: true },
    doctor: { type: String, required: true },
    treatment: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    status: { type: String, enum: ["Paid", "Unpaid"], default: "Unpaid" },
    items: [itemSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Billing", billingSchema);
