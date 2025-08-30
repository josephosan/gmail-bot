import fs from "fs/promises";
import path from "path";
import process from "process";
import { google, Auth, gmail_v1 } from "googleapis";
import {
  GoogleAuthData,
  GoogleCredentials,
  TelegramActionContext,
  TelegramContext,
  TelegramHearsContext,
} from "../interface";
import { logger } from "../log";
import {
  AUTHORIZED_USERNAME,
  GOOGLE_AUTH_URL,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_GMAIL_SCOPE,
  GOOGLE_REDIRECT_URL,
} from "../config/env";
import { promptAi } from "../gemini";

const TOKEN_PATH = path.join(process.cwd(), "token.json");

class CustomGmail {
  private authorizationState: null | string = null;

  private oauth2Client: Auth.OAuth2Client;
  private authCredentials: GoogleCredentials | null = null;

  private lastEmailId: string | undefined | null = null;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      GOOGLE_REDIRECT_URL,
    );

    this.loadSavedCredentialsIfExist();
  }

  public async loadSavedCredentialsIfExist(): Promise<GoogleCredentials | null> {
    try {
      const content = await fs.readFile(TOKEN_PATH, "utf8");
      const credentials = JSON.parse(content);
      this.authCredentials = credentials;
      return credentials;
    } catch (err) {
      return null;
    }
  }

  public async saveCredentials(credentials: GoogleCredentials): Promise<void> {
    this.authCredentials = credentials;
    const payload = JSON.stringify({
      ...credentials,
    });

    await fs.writeFile(TOKEN_PATH, payload);
  }

  /**
   * Load or request or authorization to call APIs.
   */
  public async authorize(ctx: TelegramContext): Promise<void> {
    const username = ctx.from?.username;
    if (!username) {
      logger.error("No username provided for authentication");
      throw new Error("No username provided for authentication");
    }

    // * Check if already authorized
    if (this.authCredentials?.access_token) {
      logger.log(`Authorized user requested for authorization, passed.`);
      ctx.reply(`Already authorized.`);
      return;
    }

    await ctx.reply(
      "Authorization process started. Please follow the instructions sent to your email.",
    );

    // Generate unique state
    const _tmp_name = `_telegram_username_${Date.now()}${username}`;
    this.authorizationState = Buffer.from(_tmp_name).toString("base64");

    // Generate params
    const params = new URLSearchParams();

    params.append("scope", GOOGLE_GMAIL_SCOPE);
    params.append("include_granted_scopes", "true");
    params.append("response_type", "code");
    params.append("state", this.authorizationState);
    params.append("redirect_uri", GOOGLE_REDIRECT_URL);
    params.append("client_id", GOOGLE_CLIENT_ID);

    ctx.reply(`${GOOGLE_AUTH_URL}?${params}`);
  }

  /**
   * Lists the labels in the user's account.
   */
  public async listLabels(auth: Auth.OAuth2Client): Promise<void> {
    const gmail = google.gmail({ version: "v1", auth });
    const res = await gmail.users.labels.list({
      userId: "me",
    });

    const labels = res.data.labels;
    if (!labels || labels.length === 0) {
      console.log("No labels found.");
      return;
    }

    console.log("Labels:");
    labels.forEach((label) => {
      console.log(`- ${label.name}`);
    });
  }

  /**
   *
   */
  private sanityCheck(ctx: TelegramContext): void {
    const telegramUser = ctx.from;
    const userName = telegramUser?.username;

    if (!userName || userName !== AUTHORIZED_USERNAME) {
      logger.error(`Telegram user requesting: ${userName}, is not allowed`);
      ctx.reply(`Telegram requesting user: ${userName} is not allowed`);
      throw new Error("Unauthorized");
    }
  }

  /**
   *
   */
  private splitMessage(text: string, chunkSize = 4000): string[] {
    const chunks: string[] = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.substring(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   *
   */
  private async getGmailAndHandleRotate(): Promise<gmail_v1.Gmail> {
    try {
      const gmail = google.gmail({
        version: "v1",
        auth: this.oauth2Client,
      });
      const profile = await gmail.users.getProfile({ userId: "me" });
      logger.log(`Response for me api: ${profile?.data?.emailAddress || ""}`);
      return gmail;
    } catch (err) {
      throw err;
    }
  }

  // ** =========================== Actions =========================== ** //
  /**
   *
   */
  public getOauth2Client(): Auth.OAuth2Client {
    return this.oauth2Client;
  }

  /**
   *
   */
  public setCredentials(tokens: GoogleCredentials): void {
    this.saveCredentials(tokens);
    this.oauth2Client.setCredentials(tokens);
  }

  /**
   *
   */
  public getAuthorizationState(): string | null {
    return this.authorizationState;
  }

  /**
   *
   */
  public nullifyAuthorizationState(): void {
    this.authorizationState = null;
  }

  /**
   *
   */
  public async getActiveGmail(ctx: TelegramContext): Promise<void> {
    try {
      this.sanityCheck(ctx);

      logger.log(`Authorized user requesting for gmail.`);

      const gmail = await this.getGmailAndHandleRotate();
      const profile = await gmail.users.getProfile({ userId: "me" });
      const emailAddress = profile.data.emailAddress;
      logger.log(`Authenticated Gmail user: ${emailAddress}`);
      ctx.reply(`Authenticated Gmail user: ${emailAddress}`);
    } catch (err) {
      logger.error(`Failed to fetch Gmail username: ${err}`);
      ctx.reply(`Failed to fetch Gmail username. ${err}`);
    }
  }

  /**
   * Fetch the last Gmail for the authenticated user
   */
  public async getLastMail(ctx: TelegramContext): Promise<void> {
    try {
      this.sanityCheck(ctx);

      const gmail = await this.getGmailAndHandleRotate();

      const { data } = await gmail.users.messages.list({
        userId: "me",
        maxResults: 1,
        labelIds: ["INBOX"],
      });

      const messages = data.messages;
      if (!messages || messages.length === 0) {
        ctx.reply("No emails found in your inbox.");
        return;
      }

      const thisEmailId = messages[0].id;

      const msg = await gmail.users.messages.get({
        userId: "me",
        id: thisEmailId!,
        format: "full",
      });

      const payload = msg.data.payload!;
      const headers = payload.headers || [];

      const from = headers.find((h) => h.name === "From")?.value || "Unknown sender";
      const subject = headers.find((h) => h.name === "Subject")?.value || "(No subject)";
      const date = headers.find((h) => h.name === "Date")?.value || "";

      let body = "";
      if (payload.parts && payload.parts.length) {
        const part = payload.parts.find((p) => p.mimeType === "text/plain");
        if (part && part.body && part.body.data) {
          body = Buffer.from(part.body.data, "base64").toString("utf-8");
        }
      } else if (payload.body?.data) {
        body = Buffer.from(payload.body.data, "base64").toString("utf-8");
      }

      ctx.reply(
        `📧 Last email:\nFrom: ${from}\nSubject: ${subject}\nDate: ${date}\n\n${body.slice(
          0,
          500,
        )}...`,
      );
    } catch (err) {
      logger.error(`Failed to fetch last Gmail: ${err}`);
      ctx.reply(`Failed to fetch last Gmail. ${err}`);
    }
  }

  /**
   *
   */
  public async getTodaysAllMailSummary(ctx: TelegramContext): Promise<void> {
    try {
      this.sanityCheck(ctx);

      const gmail = await this.getGmailAndHandleRotate();

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const query = `after:${Math.floor(today.getTime() / 1000)}`;

      const res = await gmail.users.messages.list({
        userId: "me",
        q: query,
        maxResults: 50,
      });

      const messages = res.data.messages || [];

      if (!messages.length) {
        ctx.reply("No emails found today.");
        return;
      }

      const feed: string[] = [];

      for (const msg of messages) {
        const fullMsg = await gmail.users.messages.get({
          userId: "me",
          id: msg.id!,
          format: "full",
        });

        const payload = fullMsg.data.payload!;
        const headers = payload.headers || [];

        const from = headers.find((h) => h.name === "From")?.value || "Unknown sender";
        const subject =
          headers.find((h) => h.name === "Subject")?.value || "(No subject)";
        const date = headers.find((h) => h.name === "Date")?.value || "";

        // Extract snippet/body
        let body = fullMsg.data.snippet || "";
        if (!body && payload.parts?.length) {
          const part = payload.parts.find((p) => p.mimeType === "text/plain");
          if (part?.body?.data) {
            body = Buffer.from(part.body.data, "base64").toString("utf-8");
          }
        } else if (payload.body?.data) {
          body = Buffer.from(payload.body.data, "base64").toString("utf-8");
        }

        feed.push(
          `From: ${from}\nSubject: ${subject}\nDate: ${date}\nBody: ${body}\n\n---\n`,
        );
      }

      const feedText = feed.join("\n");
      ctx.reply(`📬 Feed of today's emails generated. Total emails: ${messages.length}`);

      const basePrompt = `
        You are my email assistant. Below I will provide you with a feed of all my emails for today, including the sender, subject, date, and body text.

        Your task:
        1. Summarize the main topics and information from these emails in a clear, concise way.
        2. Group related emails together if they are about the same topic.
        3. Highlight any important actions, deadlines, or requests.
        4. Keep the summary easy to scan, using bullet points if possible.
        5. Ignore irrelevant details like signatures, disclaimers, or repeated automated text.

        Here are today’s emails:
        ${feedText}
      `;
      const summary = await promptAi(basePrompt);
      if (!summary) {
        logger.error(`Gemeni returned an empty response`);
        ctx.reply(`Gemeni error, Empty response.`);
        return;
      }
      const chunks = this.splitMessage(summary);

      for (const chunk of chunks) {
        await ctx.reply(chunk, { parse_mode: undefined });
      }
    } catch (err) {
      console.error(`Failed to fetch today's emails: ${err}`);
      ctx.reply(`Failed to fetch today's emails. ${err}`);
    }
  }
}

export const customGmail = new CustomGmail();
