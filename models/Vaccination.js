
import mongoose from "mongoose";
const schema = new mongoose.Schema({
  patient:{ type: mongoose.Schema.Types.ObjectId, ref:"Patient", required:true },
  vaccineName:String,
  doseNumber:Number,
  givenOn:Date,
  nextDueOn:Date,        // ← reminder
  notes:String,
  reminded:Boolean
},{timestamps:true});
export default mongoose.model("Vaccination", schema);
