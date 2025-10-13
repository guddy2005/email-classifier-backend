const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/auth.controller");
const googleController = require("../controllers/google.controller");
const verifyToken = require("../middleware/verifyToken");

router.post("/register", register);
router.post("/login", login);

// Analyze emails
router.get("/emails/analyze", verifyToken, googleController.analyzeEmails);

// Get analytics
router.get("/analytics", verifyToken, googleController.getAnalytics);

module.exports = router;
