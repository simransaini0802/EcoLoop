import mongoose from "mongoose";

const collectionRequestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  category: { type: String, enum: ["Plastic", "Paper", "Glass", "Metal", "E-waste", "Organic"], required: true },
  quantityKg: { type: Number, required: true, min: 0.1, max: 10000 },
  address: { type: String, required: true, trim: true, maxlength: 300 },
  scheduledDate: { type: Date, required: true },
  notes: { type: String, default: "", maxlength: 500 },
  status: { type: String, enum: ["pending", "assigned", "in_progress", "completed", "cancelled"], default: "pending" },
  collector: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  pointsAwarded: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("CollectionRequest", collectionRequestSchema);
