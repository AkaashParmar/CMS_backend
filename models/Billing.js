import mongoose from "mongoose";

// for invoice items
const itemSchema = new mongoose.Schema(
  {
    service: { type: String, required: true },
    description: String,
    qty: { type: Number, default: 1 },
    price: { type: Number, required: true },
  },
  { _id: false }
);

// for payments
const paymentSchema = new mongoose.Schema(
  {
    method: { type: String, enum: ["cash", "card", "upi", "netbanking"] },
    amount: Number,
    paidOn: Date,
    reference: String,
  },
  { _id: false }
);

const billingSchema = new mongoose.Schema(
  {
    invoiceId: { type: String, unique: true },
    patient: { type: String, required: true },
    service: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    status: { type: String, enum: ["Paid", "Unpaid"], default: "Unpaid" },
    items: [itemSchema],
    payments: [paymentSchema],
  },
  { timestamps: true }
);

// Generate auto-invoiceId
billingSchema.pre("save", async function (next) {
  if (!this.invoiceId) {
    const last = await mongoose
      .model("Billing")
      .findOne()
      .sort({ createdAt: -1 });
    let nextId = 1001;
    if (last && last.invoiceId) {
      const lastNum = parseInt(last.invoiceId.split("-")[1]);
      nextId = lastNum + 1;
    }
    this.invoiceId = `INV-${nextId}`;
  }
  next();
});

export default mongoose.model("Billing", billingSchema);
