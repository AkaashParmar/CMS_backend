import mongoose from "mongoose";

const clinicSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },   
  phone: { type: String },
  primaryDoctor: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, 
  associatedDoctors: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  panelDoctors: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });

export default mongoose.model("Clinic", clinicSchema);
