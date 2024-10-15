import mongoose, { Schema } from "mongoose";

const subScriptionSchema = new Schema(
  {
    subscriber: {
      type: Schema.Types.ObjectId, // One who s subscribing
      ref: "User",
    },
    channel: {
      type: Schema.Types.ObjectId, // One who is subscriber is subscribing
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Subscription = mongoose.model("Subscriptions", subScriptionSchema);
