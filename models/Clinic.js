import mongoose from "mongoose";

const onlineSlotSchema = new mongoose.Schema(
  {
    lastOnlineDisabled: { type: Boolean, default: false },
    hour: { type: String },
    minute: { type: String },
    period: { type: String, enum: ["AM", "PM"] },
    status: { type: String, default: "On Schedule" },
    blockOnline: { type: Boolean, default: false },
  },
  { _id: false }
);

const clinicSchema = new mongoose.Schema(
  {
    clinicName: { type: String, required: true, unique: true },
    contact1: { type: String },
    contact2: { type: String },
    email: { type: String, unique: true },
    prescriptionRequired: { type: Boolean, default: false },
    minPayment: { type: Number, default: 0 },
    paymentOption: {
      type: String,
      enum: ["pay now", "pay at clinic"],
      default: "pay now",
    },
    firstVisitCharge: { type: Number, default: 0 },
    followUpCharge: { type: Number, default: 0 },
    followUpValidity: { type: Number, default: 0 }, // days
    subsequentCharge: { type: Number, default: 0 },
    address: { type: String },
    area: { type: String },
    pincode: { type: String },
    geoLocation: { type: String }, 
    slotDuration: { type: Number, default: 15 },
    blockConfirmed: { type: Boolean, default: false },
    blockAfterMinutes: { type: Number, default: 0 },
    doctorOnLeave: { type: Boolean, default: false },
    onlineSettings: {
      morning: onlineSlotSchema,
      evening: onlineSlotSchema,
    },
    blockTele: { type: Boolean, default: false },
    teleFee: { type: Number, default: 0 },
    blockVideo: { type: Boolean, default: false },
    videoFee: { type: Number, default: 0 },
    primaryDoctor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    associatedDoctors: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    panelDoctors: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export default mongoose.model("Clinic", clinicSchema);
