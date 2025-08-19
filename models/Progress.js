import mongoose from "mongoose";
const schema = new mongoose.Schema({
  patient:{ type: mongoose.Schema.Types.ObjectId, ref:"Patient", required:true },
  doctor:{ type: mongoose.Schema.Types.ObjectId, ref:"User" },
  metrics:{ weight:Number, bpSys:Number, bpDia:Number, sugar:Number },
  notes:String,
  nextFollowUp:Date
},{timestamps:true});
export default mongoose.model("Progress", schema);
