import mongoose from "mongoose";

const dateTokenSchema = new mongoose.Schema({
  name: { type: String, unique: true },
  expiredTimestamp: { type: String },
});

export default mongoose.model("datetoken", dateTokenSchema);
