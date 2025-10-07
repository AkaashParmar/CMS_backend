import mongoose from "mongoose";

const appointmentRequestSchema = new mongoose.Schema(
  {
    patient: {
      type: Object,
      required: true, // { name, patientId, ... }
    },
    doctor: {
      type: Object,
      required: true, // { _id, name }
    },
    appointmentType: { type: String, default: "In Person" },
    date: { type: String, required: true },
    time: { type: String, required: true },
    Services: { type: String },
    contact: { type: String, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: ["Requested", "Approved", "Cancelled", "Rescheduled"],
      default: "Requested",
    },
    comments: { type: String, default: "" },
  },
  { timestamps: true }
);

const AppointmentRequest = mongoose.model(
  "AppointmentRequest",
  appointmentRequestSchema
);

export default AppointmentRequest;
