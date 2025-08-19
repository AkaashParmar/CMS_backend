import mongoose from "mongoose";
const itemSchema = new mongoose.Schema({
  service:{ type: mongoose.Schema.Types.ObjectId, ref:"MedicalService" },
  description:String,
  qty:Number,
  price:Number
},{_id:false});

const paymentSchema = new mongoose.Schema({
  method:{ type:String, enum:["cash","card","upi","netbanking"] },
  amount:Number,
  paidOn:Date,
  reference:String
},{_id:false});

const billingSchema = new mongoose.Schema({
  clinic:{ type: mongoose.Schema.Types.ObjectId, ref:"Clinic" },
  patient:{ type: mongoose.Schema.Types.ObjectId, ref:"Patient" },
  appointment:{ type: mongoose.Schema.Types.ObjectId, ref:"Appointment" },
  items:[itemSchema],
  total:Number,
  status:{ type:String, enum:["unpaid","partiallyPaid","paid","refunded"], default:"unpaid" },
  payments:[paymentSchema] 
},{timestamps:true});

export default mongoose.model("Billing", billingSchema);
