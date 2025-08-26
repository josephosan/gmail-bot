import fs from "fs/promises";
import path, { resolve } from "path";
import process from "process";
import crypto from "node:crypto";
import { google, Auth } from "googleapis";
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

const TOKEN_PATH = path.join(process.cwd(), "token.json");

class CustomGmail {
  private authData: null | GoogleAuthData = null;
  private authorizationState: null | string = null;

  private oauth2Client: Auth.OAuth2Client;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      GOOGLE_REDIRECT_URL,
    );

    this.loadSavedCredentialsIfExist();
  }

  public async loadSavedCredentialsIfExist(): Promise<GoogleAuthData | null> {
    try {
      const content = await fs.readFile(TOKEN_PATH, "utf8");
      const credentials = JSON.parse(content);
      this.authData = credentials;
      return credentials;
    } catch (err) {
      return null;
    }
  }

  public async saveCredentials(credentials: GoogleAuthData): Promise<void> {
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

    // Generate unique state
    const _tmp_name = `_telegram_username_${username}`;
    this.authorizationState = Buffer.from(_tmp_name).toString("base64");

    // Generate params
    const params = new URLSearchParams();

    params.append("scope", GOOGLE_GMAIL_SCOPE);
    params.append("include_granted_scopes", "true");
    params.append("response_type", "token");
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

      const gmail = google.gmail({
        version: "v1",
        auth: this.oauth2Client,
      });
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
   *
   */
  public getLastMail(ctx: TelegramContext): void {
    try {
      this.sanityCheck(ctx);
      ctx.reply("Fetching the last mail...");
    } catch (err) {}
  }

  /**
   *
   */
  public getTodaysAllMailSummary(ctx: TelegramContext): void {
    try {
      this.sanityCheck(ctx);
      ctx.reply("Fetching Gmail summary...");
    } catch (err) {}
  }
}

export const customGmail = new CustomGmail();
