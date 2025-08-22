// config/dropbox.js
import { Dropbox } from "dropbox";
import dotenv from "dotenv";

dotenv.config();

const dbx = new Dropbox({
  clientId: process.env.DROPBOX_APP_KEY,
  clientSecret: process.env.DROPBOX_APP_SECRET,
  refreshToken: process.env.DROPBOX_REFRESH_TOKEN,
});

export default dbx;