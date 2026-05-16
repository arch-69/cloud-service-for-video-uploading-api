import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
    },

    storageLimit: {
      type: Number,
      required: true,
    },

    bandwidthLimit: {
      type: Number,
      required: true,
    },

    maxFileSize: {
      type: Number,
      required: true,
    },

    monthlyPrice: {
      type: Number,
      default: 0,
      required: true,
    },
  },
  { timestamps: true },
);

const Plan = mongoose.model("Plan", planSchema);
export default Plan;
