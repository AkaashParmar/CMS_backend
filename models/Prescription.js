import mongoose from "mongoose";

// Schema definition
const PrescriptionTemplateSchema = new mongoose.Schema({
    clinic: [{ type: mongoose.Schema.Types.ObjectId, ref: "Clinic" }],
    template: { type: String, required: true },
    fontSize: { type: Number, required: true },
    pageSize: { type: String, required: true },
    prescriptionFormat: { type: String, required: true },
    fontFamily: { type: String, required: true },
    language: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now },
});

// Named export
export const PrescriptionTemplate = mongoose.model(
    "PrescriptionTemplate",
    PrescriptionTemplateSchema
);
