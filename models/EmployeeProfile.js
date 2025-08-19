import mongoose from "mongoose";
const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref:"User", required:true }, // doctor, labTech, accountant, companyAdmin
  clinic: { type: mongoose.Schema.Types.ObjectId, ref:"Clinic" },
  designation: String,
  joinDate: Date,
  isActive: { type:Boolean, default:true }
},{timestamps:true});
export default mongoose.model("EmployeeProfile", schema);
