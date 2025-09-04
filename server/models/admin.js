import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  password: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model("Admin", adminSchema);