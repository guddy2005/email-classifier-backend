const mongoose = require("mongoose");

const ConnectedAccountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    provider: {
      type: String,
      enum: ["google"], 
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    accessToken: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true },
);

ConnectedAccountSchema.index({ userId: 1, provider: 1 }, { unique: true });

module.exports = mongoose.model("ConnectedAccount", ConnectedAccountSchema);
