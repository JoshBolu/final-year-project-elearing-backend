// routes/auth.js
import express from "express";
import { Dropbox } from "dropbox";

const router = express.Router();

router.get("/auth", (req, res) => {
  const dbx = new Dropbox({ clientId: process.env.DROPBOX_APP_KEY });
  const authUrl = dbx.getAuthenticationUrl(
    "https://final-year-project-elearing-backend.onrender.com/auth/callback",
    null,
    "code",
    "offline",
    null,
    "none",
    false
  );
  res.redirect(authUrl);
});

router.get("/auth/callback", async (req, res) => {
  const { code } = req.query;
  const dbx = new Dropbox({
    clientId: process.env.DROPBOX_APP_KEY,
    clientSecret: process.env.DROPBOX_APP_SECRET,
  });

  const tokenRes = await dbx.getAccessTokenFromCode(
    "https://final-year-project-elearing-backend.onrender.com/auth/callback",
    code
  );

  // This contains both access_token and refresh_token
  console.log(tokenRes.result);

  res.send("Check your console for refresh_token");
});

export default router;