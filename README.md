# Gmail-Bot (TypeScript, Node.js)

## Project Description

Gmail-Bot is a **TypeScript (Node.js) application** that integrates with Telegram, Gmail, and Gemini AI APIs to provide users with summarized insights from their Gmail inbox via a Telegram bot. The project is fully **dockerized** and orchestrated with `docker-compose` for easy deployment and management. Configuration is handled through an `.env` file.

## Features

- Telegram bot interface (via Telegraf)
- Gmail OAuth2 authentication and email fetching
- AI-powered email summarization using Gemini API
- Express web server for OAuth2 callback and health checks
- Persistent logging and token storage
- Easy deployment with Docker and docker-compose
- Supports nginx-proxy and Let's Encrypt for HTTPS

## Tech Stack

- **TypeScript**
- **Node.js**
- **Express**
- **Telegraf** (Telegram Bot API)
- **Gmail API**
- **Google OAuth2**
- **Gemini API**
- **Docker**

## Project Structure

```
├── src/                   # TypeScript source code
├── Dockerfile             # Docker image definition
├── docker-compose.yml     # Multi-container orchestration
├── .env                   # Environment variable configuration
├── log.txt                # Application logs (persisted)
├── token.json             # Gmail OAuth2 token (persisted)
```

## Configuration

All sensitive and environment-specific configuration is managed via the `.env` file. The following variables are required:

```env
BOT_API_TOKEN=            # Telegram bot API token
AUTHORIZED_USERNAME=      # Telegram username(s) allowed to use the bot
BOT_ID=                   # Telegram bot ID
EXPRESS_SERVER_PORT=      # Port for the Express server
GOOGLE_CLIENT_ID=         # Google OAuth2 client ID
GOOGLE_CLIENT_SECRET=     # Google OAuth2 client secret
GOOGLE_REDIRECT_URL=      # OAuth2 redirect URL (should match Google Console settings)
GOOGLE_GMAIL_SCOPE=       # Gmail API scope (e.g., https://mail.google.com/)
GEMINI_API_KEY=           # Gemini AI API key

# (Optional, for deployment with nginx-proxy and Let's Encrypt)
VIRTUAL_HOST=             # Domain for nginx-proxy routing
LETSENCRYPT_HOST=         # Domain for Let's Encrypt SSL
LETSENCRYPT_EMAIL=        # Email for Let's Encrypt registration
```

## Usage

1. **Fill in `.env`**  
   Copy `.env.example` to `.env` and provide all required values as described above.

2. **Build and Start the Application**

   ```sh
   docker-compose up -d --build
   ```

3. **Authenticate and Use the Bot**
   - Open Telegram and start a chat with your bot.
   - Send `/auth` to begin the Gmail OAuth2 authentication process.
   - Follow the link to authorize Gmail access.
   - Once authenticated, use bot commands (e.g., `/summary`) to fetch and summarize your Gmail inbox.

## Deployment

This project is designed for easy deployment in a Docker environment. For production, it supports integration with **nginx-proxy** and **Let's Encrypt** for automated reverse proxy and HTTPS:

- Set `VIRTUAL_HOST` and `LETSENCRYPT_HOST` in your `.env`.
- Ensure your `docker-compose.yml` joins the external `core-net` network used by nginx-proxy.
- The Express server will be accessible via the configured domain.

## Notes

- The bot persists Gmail OAuth2 tokens in `token.json` and logs to `log.txt` (both mounted as Docker volumes).
- Only users specified in `AUTHORIZED_USERNAME` can interact with the bot.
- For development, you can run the app locally with Docker Compose and expose necessary ports.
- Don't forget to setup nginx for your auth callback.

## Example Workflow

1. **User sends `/authorize` in Telegram**  
   The bot replies with a Google OAuth2 link.
2. **User completes Gmail authentication**  
   The Express server receives the callback and stores the OAuth2 token.
3. **User sends `Get Summary` in Telegram**  
   The bot fetches recent emails from Gmail, sends them to Gemini AI for summarization, and replies with a concise summary.
4. **User receives summarized insights**  
   Stay on top of your inbox with AI-powered summaries, all from within Telegram.
