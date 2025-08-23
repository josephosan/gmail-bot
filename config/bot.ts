import dotenv from "dotenv";

dotenv.config();

// ** ========================= Bot Commands ======================== ** //
export enum TELEGRAM_BOT_COMMAND {
  GET_ALL_GMAIL = "GET_ALL_GMAIL",
  GET_LAST_GMAIL = "GET_LAST_GMAIL",
  GET_SUMMARY_GMAIL = "GET_SUMMARY_GMAIL"
}
