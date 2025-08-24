import dotenv from "dotenv";

dotenv.config();

/**
 *
 */
export const TELEGRAM_BOT_TOKEN = process.env.BOT_API_TOKEN || "";

/**
 *
 */
export const EXPRESS_SERVER_PORT = process.env.EXPRESS_SERVER_PORT || 3001;

/**
 *
 */
export const AUTHORIZED_USERNAME = process.env.AUTHORIZED_USERNAME ?? "josephosan";
