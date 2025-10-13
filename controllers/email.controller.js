const { google } = require("googleapis");
const ConnectedAccount = require("../models/connectedAccount.model");
const Feedback = require("../models/feedback.model");
const gmailService = require("../services/gmail.service");
const classifier = require("../ml/classifier");

// --- Google OAuth ---
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI,
);

exports.connectGoogle = (req, res) => {
  const scopes = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/userinfo.email",
  ];
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    state: req.userId, // Pass userId through state to identify user in callback
  });
  res.redirect(url);
};

exports.googleCallback = async (req, res) => {
  const { code, state } = req.query;
  const userId = state;

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });
    const profile = await gmail.users.getProfile({ userId: "me" });

    await ConnectedAccount.findOneAndUpdate(
      { userId, provider: "google" },
      {
        email: profile.data.emailAddress,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
      },
      { upsert: true, new: true },
    );

    res.send(
      "Google account connected successfully! You can close this window.",
    );
  } catch (error) {
    console.error("Error during Google OAuth callback:", error);
    res.status(500).send("Failed to connect Google account.");
  }
};

// --- Main Email Fetching Logic ---
exports.getEmails = async (req, res) => {
  try {
    const accounts = await ConnectedAccount.find({ userId: req.userId });
    if (accounts.length === 0) {
      return res.json([]);
    }

    let allEmails = [];
    for (const account of accounts) {
      let emails = [];
      if (account.provider === "google") {
        emails = await gmailService.fetchLatestEmails(
          account.accessToken,
          account.refreshToken,
        );
      }

      emails = emails.map((email) => ({
        ...email,
        provider: account.provider,
        accountEmail: account.email,
      }));
      allEmails.push(...emails);
    }

    allEmails.sort((a, b) => new Date(b.date) - new Date(a.date));

    const classifiedEmails = allEmails.map((email) => {
      const contentToClassify = `${email.subject} ${email.snippet}`;
      const category = classifier.classify(contentToClassify);
      return { ...email, category };
    });

    res.json(classifiedEmails);
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
