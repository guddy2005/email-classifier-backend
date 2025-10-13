const User = require("../models/user.model");
const { google } = require("googleapis");
const { classify } = require("../ml/classifier");

const fetchAndClassifyEmails = async (userId) => {
  console.log(`[fetchAndClassifyEmails] Checking for user with ID: ${userId}`);
  const user = await User.findById(userId);

  if (!user || !user.googleAccessToken) {
    console.log(
      "[fetchAndClassifyEmails] User found, but Google account is not connected.",
    );
    throw new Error("Google account not connected");
  }

  console.log(
    `[fetchAndClassifyEmails] User ${user.email} has a connected Google account. Fetching emails...`,
  );

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  );

  oauth2Client.setCredentials({
    access_token: user.googleAccessToken,
    refresh_token: user.googleRefreshToken,
  });

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  const gmailRes = await gmail.users.messages.list({
    userId: "me",
    maxResults: 50,
  });
  const messages = gmailRes.data.messages || [];

  if (messages.length === 0) {
    return [];
  }

  const emailPromises = messages.map(async (message) => {
    const msg = await gmail.users.messages.get({
      userId: "me",
      id: message.id,
      format: "metadata",
      metadataHeaders: ["Subject", "From", "Date"],
    });

    const headers = msg.data.payload.headers;
    const subject = headers.find((h) => h.name === "Subject")?.value || "";
    const snippet = msg.data.snippet || "";

    const contentToClassify = `${subject} ${snippet}`;
    const category = classify(contentToClassify);

    return {
      id: msg.data.id,
      snippet: snippet,
      subject: subject,
      from: headers.find((h) => h.name === "From")?.value || "",
      date: headers.find((h) => h.name === "Date")?.value || "",
      category: category,
    };
  });

  return Promise.all(emailPromises);
};

exports.analyzeEmails = async (req, res) => {
  try {
    const classifiedEmails = await fetchAndClassifyEmails(req.user.id);
    res.json(classifiedEmails);
  } catch (error) {
    console.error("Error analyzing emails:", error.message);
    if (error.message === "Google account not connected") {
      return res.status(400).json({ error: "Google account not connected" });
    }
    res.status(500).json({ error: "Failed to analyze emails" });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const classifiedEmails = await fetchAndClassifyEmails(req.user.id);

    const totalEmails = classifiedEmails.length;
    const categoryCounts = classifiedEmails.reduce((acc, email) => {
      acc[email.category] = (acc[email.category] || 0) + 1;
      return acc;
    }, {});

    res.json({ totalEmails, categoryCounts });
  } catch (error) {
    console.error("Error fetching analytics:", error.message);
    if (error.message === "Google account not connected") {
      return res.status(400).json({ error: "Google account not connected" });
    }
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
};
