const Feedback = require("../models/feedback.model");
const classifier = require("../ml/classifier");

exports.getEmails = async (req, res) => {
  try {
    // No connected accounts, so return an empty array
    res.json([]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// --- Feedback Logic ---
exports.addFeedback = async (req, res) => {
  const { content, correctLabel } = req.body;
  try {
    const feedback = new Feedback({
      emailContent: content,
      correctLabel: correctLabel,
    });
    await feedback.save();
    res
      .status(201)
      .json({ msg: "Feedback received. The model will be improved." });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

exports.classifyEmail = (req, res) => {
  const { subject, snippet } = req.body;
  if (!subject || !snippet) {
    return res.status(400).json({ msg: "Please provide subject and snippet." });
  }
  const contentToClassify = `${subject} ${snippet}`;
  const category = classifier.classify(contentToClassify);
  res.json({ category });
};
