import mongoose from "mongoose";
const schema = new mongoose.Schema({
  name:{ type:String, required:true },
  code:String,
  clinic:{ type: mongoose.Schema.Types.ObjectId, ref:"Clinic" },
  basePrice:Number,
  description:String,
  isActive:{ type:Boolean, default:true }
},{timestamps:true});
export default mongoose.model("MedicalService", schema);
