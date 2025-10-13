const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema(
  {
    emailContent: {
      type: String,
      required: true,
    },
    correctLabel: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Feedback", FeedbackSchema);
