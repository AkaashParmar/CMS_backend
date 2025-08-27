import mongoose from "mongoose";

const labTestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    unit: { type: String, required: true },
    min: { type: Number, required: true },
    max: { type: Number, required: true },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

export default mongoose.model("LabTest", labTestSchema);
