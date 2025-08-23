import dotenv from 'dotenv'

dotenv.config()

export const TELEGRAM_BOT_TOKEN = process.env.BOT_API_TOKEN ?? ''

