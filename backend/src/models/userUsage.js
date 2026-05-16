import mongoose from "mongoose";

const usageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  usedStorage: Number,

  usedBandwidth: Number,

  isOverQuota: Boolean,
});

const Usage = mongoose.model("Usage", usageSchema);

export default Usage;
