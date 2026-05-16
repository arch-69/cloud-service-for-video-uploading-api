import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
    },

    status: {
      type: String,
      enum: ["ACTIVE", "EXPIRED", "CANCELLED", "PAST_DUE"],
    },

    startedAt: Date,

    expiresAt: Date,

    autoRenew: Boolean,
  },
  { timestamps: true },
);

const Subscription = mongoose.model("Subscription", subscriptionSchema);
export default Subscription;
