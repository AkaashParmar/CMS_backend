import mongoose from "mongoose";
const schema = new mongoose.Schema({
  name:String,
  email:String,
  phone:String,
  dob:Date,
  gender:String,
  clinic:{ type: mongoose.Schema.Types.ObjectId, ref:"Clinic" },
  assignedDoctor:{ type: mongoose.Schema.Types.ObjectId, ref:"User" },
  conditions:[String],
  isActive:{ type:Boolean, default:true }
},{timestamps:true});
export default mongoose.model("Patient", schema);
