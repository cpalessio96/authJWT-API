import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: { type: String, default: null },
  lastName: { type: String, default: null },
  email: { type: String, unique: true },
  password: { type: String },
  role: { type: String },
});

export default mongoose.model("user", userSchema);
