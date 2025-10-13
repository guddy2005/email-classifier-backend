const { google } = require("googleapis");

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI,
);

exports.fetchLatestEmails = async (accessToken, refreshToken) => {
  try {
    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    const res = await gmail.users.messages.list({
      userId: "me",
      maxResults: 50,
      q: "in:inbox",
    });

    const messages = res.data.messages;
    if (!messages || messages.length === 0) {
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
      return {
        id: msg.data.id,
        snippet: msg.data.snippet,
        subject: headers.find((h) => h.name === "Subject")?.value || "",
        from: headers.find((h) => h.name === "From")?.value || "",
        date: headers.find((h) => h.name === "Date")?.value || "",
      };
    });

    return Promise.all(emailPromises);
  } catch (error) {
    console.error("Failed to fetch Gmail emails:", error);
    return [];
  }
};
