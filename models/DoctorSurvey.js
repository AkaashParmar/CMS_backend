import mongoose from "mongoose";

const DoctorSurveySchema = new mongoose.Schema(
  {
    doctorName: { type: String, required: true },
    responses: { type: [Number], required: true },
    score: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("DoctorSurvey", DoctorSurveySchema);
