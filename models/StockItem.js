import mongoose from "mongoose";
const schema = new mongoose.Schema({
  name:String, // can be Drug or consumable
  sku:String,
  clinic:{ type: mongoose.Schema.Types.ObjectId, ref:"Clinic" },
  quantity:Number,
  reorderLevel:Number,
  lastUpdated:Date
},{timestamps:true});
export default mongoose.model("StockItem", schema);
