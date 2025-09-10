import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const prescriptionSchema = new mongoose.Schema(
  {
    prescriptionId: {
      type: String,
      unique: true,
      default: () => "PR-" + Date.now(),
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    gender: { type: String, required: true },
    age: { type: Number, required: true },
    date: { type: Date, required: true },
    // medicine: { type: String, required: true },
    // nextVisit: { type: Date, required: true },
    vitals: String,
    complaints: String,
    diagnosis: String,
    prescription: [
      {
        drugName: String,
        dose: String,
        M: Boolean,
        A: Boolean,
        E: Boolean,
        N: Boolean,
        asReqd: Boolean,
        duration: String,
      },
    ],
    vaccinationGiven: String,
    vaccinationDue: String,
    instructions: String,
    test: String,
    referral: {
      docName: String,
      dept: String,
      contact: String,
      address: String,
    },
    followUp: Date,
    doctorName: String,
    doctorId: String,
    signature: String,
  },
  { timestamps: true }
);

// Auto-generate patient UID if not provided
prescriptionSchema.pre("validate", function (next) {
  if (!this.uid) {
    this.uid = "PAT-" + uuidv4().slice(0, 8);
  }
  next();
});

export default mongoose.model("Prescription", prescriptionSchema);
