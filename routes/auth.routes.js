const express = require("express");
const router = express.Router();
const { register, login, getGoogleAuthUrl } = require("../controllers/auth.controller");
const verifyToken = require("../middleware/verifyToken");

router.post("/register", register);
router.post("/login", login);
router.get("/google-url", verifyToken, getGoogleAuthUrl);

module.exports = router;
