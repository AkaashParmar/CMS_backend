import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // The user who recorded the progress
  status: { type: String, enum: ['Stable', 'Improving', 'Under Observation', 'Critical', 'Recovering'], required: true },
  progressPercentage: { type: Number, required: true },  // Example: 80
  notes: String,
  recordedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Progress', progressSchema);
