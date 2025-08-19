import mongoose from "mongoose";

const drugSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  manufacturer: { type: String, required: true },
  quantity: { type: Number, required: true, default: 0 },
  price: { type: Number, required: true }, //per unit
  expiry: { type: Date, required: true },
}, { timestamps: true });

export default mongoose.model("Drug", drugSchema);
