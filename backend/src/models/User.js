import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["user", "collector", "admin"], default: "user" },
  address: { type: String, default: "" },
  points: { type: Number, default: 0, min: 0 }
}, { timestamps: true });

export default mongoose.model("User", userSchema);
