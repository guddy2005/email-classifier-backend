const express = require("express");
const router = express.Router();
const {
  getEmails,
  addFeedback,
  classifyEmail,
} = require("../controllers/email.controller");
const verifyToken = require("../middleware/verifyToken");

// --- Email Data Routes ---
router.get("/emails", verifyToken, getEmails);
router.post("/emails/feedback", verifyToken, addFeedback);
router.post("/emails/classify", verifyToken, classifyEmail);

module.exports = router;
