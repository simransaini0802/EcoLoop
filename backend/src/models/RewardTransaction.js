import mongoose from "mongoose";
const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  request: { type: mongoose.Schema.Types.ObjectId, ref: "CollectionRequest", required: true },
  points: { type: Number, required: true },
  description: { type: String, default: "Verified recycling collection" }
}, { timestamps: true });
export default mongoose.model("RewardTransaction", schema);
