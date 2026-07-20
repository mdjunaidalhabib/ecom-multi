import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * 🔥 FIX (server crash on boot): আগে GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET
 * env var না থাকলে `new GoogleStrategy(...)` সাথে সাথে throw করতো, আর
 * যেহেতু configurePassport() server.js-এর top-level-এ (কোনো try/catch
 * ছাড়া) কল হতো, পুরো Node process crash করে exit হয়ে যেত — মানে
 * সার্ভারই বুট হতো না, super-admin/shop-admin login (যেটা Google OAuth-এর
 * সাথে সম্পর্কহীন, শুধু email+password+JWT) সহ *কোনো* রুটই কাজ করতো না।
 *
 * এখন Google credentials না থাকলে শুধু Google login feature-টা বন্ধ থাকবে
 * (warning log হবে), বাকি সব রুট/লগইন স্বাভাবিকভাবে কাজ করবে।
 */
export function configurePassport() {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, AUTH_API_URL } = process.env;

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !AUTH_API_URL) {
    console.warn(
      "⚠️ GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / AUTH_API_URL সেট নেই — " +
        "Google login বন্ধ থাকবে (super-admin/shop-admin login-এ কোনো প্রভাব নেই, " +
        "সেটা আলাদা JWT-based auth ব্যবহার করে)."
    );
    return;
  }

  const callbackURL = `${AUTH_API_URL}/auth/google/callback`;

  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL,
        passReqToCallback: true,
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          const googleId = profile.id;
          const name = profile.displayName || "User";
          const email = profile.emails?.[0]?.value?.toLowerCase();
          const avatar = profile.photos?.[0]?.value || "";

          let user = await User.findOne({ googleId });

          if (!user && email) {
            user = await User.findOne({ email });
            if (user) {
              user.googleId = googleId;
              if (!user.avatar && avatar) user.avatar = avatar;
              if (!user.name && name) user.name = name;
              await user.save();
            }
          }

          if (!user) {
            user = await User.create({
              googleId,
              name,
              email: email || `noemail-${googleId}@example.local`,
              avatar,
            });
          }

          // ✅ JWT generate
          const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "90d" }
          );

          return done(null, { token, user });
        } catch (err) {
          console.error("❌ Passport Google Strategy error:", err);
          return done(err, null);
        }
      }
    )
  );
}