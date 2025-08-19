import mongoose from "mongoose";
const schema = new mongoose.Schema({
  name:String,
  contactEmail:String,
  phone:String,
  billing:[{ amount:Number, note:String, date:Date }],
  referrals:[{ code:String, referredCompany:String, date:Date }]
},{timestamps:true});
export default mongoose.model("Vendor", schema);
