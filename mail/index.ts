import fs from "fs/promises";
import path, { resolve } from "path";
import process from "process";
import { authenticate } from "@google-cloud/local-auth";
import { google, Auth } from "googleapis";
import { TelegramActionContext, TelegramHearsContext } from "../interface";
import { logger } from "../log";
import { AUTHORIZED_USERNAME } from "../config/env";
import { error } from "console";

const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];

const TOKEN_PATH = path.join(process.cwd(), "token.json");
const CREDENTIALS_PATH = path.join(process.cwd(), "credentials.json");

export class CustomGmail {
  constructor() {
    this.initialize()
      .then(() => {
        logger.log("Gmail class instantiated.");
      })
      .catch((err) => {
        logger.error(err);
      });
  }

  private initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.authorize()
        .then((auth: Auth.OAuth2Client) => {
          this.listLabels(auth);
          resolve();
        })
        .catch((err) => {
          logger.log(err);
          reject(err);
        });
    });
  }

  /**
   * Reads previously authorized credentials from the save file.
   */
  private async loadSavedCredentialsIfExist(): Promise<Auth.OAuth2Client | null> {
    try {
      const content = await fs.readFile(TOKEN_PATH, "utf8");
      const credentials = JSON.parse(content);
      return google.auth.fromJSON(credentials) as Auth.OAuth2Client;
    } catch (err) {
      return null;
    }
  }

  /**
   * Serializes credentials to a file compatible with GoogleAuth.fromJSON.
   */
  private async saveCredentials(client: Auth.OAuth2Client): Promise<void> {
    const content = await fs.readFile(CREDENTIALS_PATH, "utf8");
    const keys = JSON.parse(content);
    const key = keys.installed || keys.web;

    const payload = JSON.stringify({
      type: "authorized_user",
      client_id: key.client_id,
      client_secret: key.client_secret,
      refresh_token: client.credentials.refresh_token,
    });

    await fs.writeFile(TOKEN_PATH, payload);
  }

  /**
   * Load or request or authorization to call APIs.
   */
  public async authorize(): Promise<Auth.OAuth2Client> {
    let client = await this.loadSavedCredentialsIfExist();
    if (client) {
      return client;
    }
    client = (await authenticate({
      scopes: SCOPES,
      keyfilePath: CREDENTIALS_PATH,
    })) as Auth.OAuth2Client;

    if (client.credentials) {
      await this.saveCredentials(client);
    }
    return client;
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
  private sanityCheck(ctx: TelegramHearsContext | TelegramActionContext): void {
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
  public getActiveGmail(ctx: TelegramHearsContext | TelegramActionContext): void {
    try {
      this.sanityCheck(ctx);

      logger.log(`Authorized user requesting for gmail.`);

      this.authorize()
        .then(async (auth) => {
          const gmail = google.gmail({ version: "v1", auth });
          const profile = await gmail.users.getProfile({ userId: "me" });
          const emailAddress = profile.data.emailAddress;
          logger.log(`Authenticated Gmail user: ${emailAddress}`);
          ctx.reply(`Authenticated Gmail user: ${emailAddress}`);
        })
        .catch((err) => {
          logger.error(`Failed to fetch Gmail username: ${err}`);
          ctx.reply("Failed to fetch Gmail username.");
        });
    } catch (err) {}
  }

  /**
   *
   */
  public getLastMail(ctx: TelegramHearsContext | TelegramActionContext): void {
    try {
      this.sanityCheck(ctx);
      ctx.reply("Fetching the last mail...");
    } catch (err) {}
  }

  /**
   *
   */
  public getTodaysAllMailSummary(
    ctx: TelegramHearsContext | TelegramActionContext,
  ): void {
    try {
      this.sanityCheck(ctx);
      ctx.reply("Fetching Gmail summary...");
    } catch (err) {}
  }
}

export const customGmail = new CustomGmail();
