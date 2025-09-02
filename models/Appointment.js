import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference User model
      required: true,
    },
    patientId: { type: String, required: true }, // Store patientId like PID-0001
    date: { type: String, required: true },
    time: { type: String, required: true },
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

// Before saving, automatically fetch patient's patientId
appointmentSchema.pre("save", async function (next) {
  if (this.isModified("patient") || this.isNew) {
    const User = mongoose.model("User");
    const patientData = await User.findById(this.patient).select("patientId");

    if (patientData) {
      this.patientId = patientData.patientId; // Assign the patientId from User model
    }
  }
  next();
});

export default mongoose.model("Appointment", appointmentSchema);
