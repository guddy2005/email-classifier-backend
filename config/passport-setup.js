const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const ConnectedAccount = require("../models/connectedAccount.model");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,

      callbackURL: process.env.GOOGLE_REDIRECT_URI,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      console.log("--- [Passport] Google Callback Strategy Fired ---");
      const { state } = req.query;

      try {
        // The 'state' parameter contains the JWT of the logged-in user.
        if (!state) {
          return done(new Error("State parameter (JWT) is missing"), false);
        }

        // Verify the JWT to get the user's ID.
        const decoded = jwt.verify(state, "secret");
        const userId = decoded.id;

        if (!userId) {
          return done(new Error("Invalid user ID in JWT"), false);
        }

        // Find the user in your database.
        const user = await User.findById(userId);
        if (!user) {
          return done(new Error("User not found"), false);
        }

        // Create or update the connected Google account for this user.
        await ConnectedAccount.findOneAndUpdate(
          { userId: user._id, provider: "google" },
          {
            email: profile.emails[0].value,
            accessToken: accessToken,
            refreshToken: refreshToken,
            providerId: profile.id,
          },
          { upsert: true, new: true, setDefaultsOnInsert: true },
        );

        console.log(`--- [Passport] ✅ Linked Google account for user: ${user.email} ---`);
        return done(null, user); // Pass the user to the route handler.
      } catch (error) {
        console.error("--- [Passport] ❌ CRITICAL ERROR in strategy:", error);
        return done(error);
      }
    },
  ),
);
