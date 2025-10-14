const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, username: newUser.username },
      process.env.JWT_SECRET,
    );
    res.status(201).json({ token });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, username: user.username },
      process.env.JWT_SECRET,
    );
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Returns the Google OAuth URL for connecting accounts
exports.getGoogleAuthUrl = async (req, res) => {
  try {
    // Prefer explicit env URL if provided
    const explicitUrl = process.env.GOOGLE_OAUTH_URL;
    if (explicitUrl) {
      return res.status(200).json({ url: explicitUrl });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;
    const scope = encodeURIComponent(
      [
        "https://www.googleapis.com/auth/gmail.readonly",
        "email",
        "profile",
        "openid",
      ].join(" "),
    );

    if (!clientId || !redirectUri) {
      return res
        .status(500)
        .json({ error: "Google OAuth not configured on server" });
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      access_type: "offline",
      prompt: "consent",
      scope,
    });

    const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    return res.status(200).json({ url });
  } catch (error) {
    return res.status(500).json({ error: "Failed to generate Google URL" });
  }
};
