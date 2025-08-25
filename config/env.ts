import dotenv from "dotenv";

dotenv.config();

// ** =============================================================== ** //
// **                               Bot                               ** //
// ** =============================================================== ** //
export const TELEGRAM_BOT_TOKEN = process.env.BOT_API_TOKEN || "";
export const AUTHORIZED_USERNAME = process.env.AUTHORIZED_USERNAME ?? "josephosan";

// ** =============================================================== ** //
// **                          Express Server                         ** //
// ** =============================================================== ** //
export const EXPRESS_SERVER_PORT = process.env.EXPRESS_SERVER_PORT || 3001;

// ** =============================================================== ** //
// **                              Google                             ** //
// ** =============================================================== ** //
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
export const GOOGLE_PROJECT_ID = process.env.GOOGLE_PROJECT_ID || "";
export const GOOGLE_AUTH_URL = process.env.GOOGLE_AUTH_URL || "";
export const GOOGLE_TOKEN_URL = process.env.GOOGLE_TOKEN_URL || "";
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
export const GOOGLE_REDIRECT_URL = process.env.GOOGLE_REDIRECT_URL || "";
export const GOOGLE_GMAIL_SCOPE = process.env.GOOGLE_GMAIL_SCOPE || "";
