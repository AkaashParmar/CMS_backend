import mongoose from "mongoose";

const ServiceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    description: { type: String, default: '' }
  },
  { timestamps: true }
);

const Service = mongoose.model('Service', ServiceSchema);
export default Service;
