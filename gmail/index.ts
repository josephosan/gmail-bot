import fs from "fs/promises";
import path from "path";
import process from "process";
import { authenticate } from "@google-cloud/local-auth";
import { google, Auth } from "googleapis";
import { TelegramActionContext, TelegramHearsContext } from "../interface";
import { logger } from "../log";

const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];

const TOKEN_PATH = path.join(process.cwd(), "token.json");
const CREDENTIALS_PATH = path.join(process.cwd(), "credentials.json");

export class CustomGmail {
  constructor() {
    logger.log("Gmail class instantiated.");
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

  // ** =========================== Actions =========================== ** //
  /**
   *
   */
  public getAllGmail(ctx: TelegramHearsContext | TelegramActionContext): void {
    ctx.reply("Fetching all Gmail...");
  }

  /**
   *
   */
  public getLastGmail(ctx: TelegramHearsContext | TelegramActionContext): void {
    ctx.reply("Fetching the last Gmail...");
  }

  /**
   *
   */
  public getSummary(ctx: TelegramHearsContext | TelegramActionContext): void {
    ctx.reply("Fetching Gmail summary...");
  }
}

export const customGmail = new CustomGmail();
