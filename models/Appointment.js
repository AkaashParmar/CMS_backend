// models/Appointment.js
import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    uid: { type: String, unique: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    patient: { type: String, required: true },
    contact: { type: String, required: true },
    services: [{ type: String }],
    temperature: { type: String },
    weight: { type: String },
    status: {
      type: String,
      enum: ["Pending", "Scheduled", "Completed"],
      default: "Pending",
    },
    appointmentType: {
      type: String,
      enum: ["In Person", "Over Call", "Video"],
      default: "In Person",
    },
    doctorId: { type: String },
  },
  { timestamps: true }
);

// Auto-generate UID before saving
appointmentSchema.pre("save", async function (next) {
  if (!this.uid) {
    const count = await mongoose.model("Appointment").countDocuments();
    this.uid = `APT-${1001 + count}`; 
  }
  next();
});

export default mongoose.model("Appointment", appointmentSchema);
