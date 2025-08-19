import mongoose from "mongoose";
const schema = new mongoose.Schema({
  title:String,
  type:{ type:String, enum:["finance","patient","lab","inventory","custom"] },
  filters:Object, // saved filter config
  generatedAt:Date,
  data:Object      // store snapshot or summary
},{timestamps:true});
export default mongoose.model("Report", schema);
