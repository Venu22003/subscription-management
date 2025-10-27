const mongoose = require("mongoose");

const paymentHistorySchema = new mongoose.Schema(
  {
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paidDate: {
      type: Date,
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      default: "Not specified",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PaymentHistory", paymentHistorySchema);