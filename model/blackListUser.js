import mongoose from "mongoose";

const blackListUserSchema = new mongoose.Schema({
  email: { type: String, unique: true },
});

export default mongoose.model("blackListUser", blackListUserSchema);
