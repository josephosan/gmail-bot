import express, { Request, Response } from "express";
import { logger } from "../log";
import { customGmail } from "../mail";
import { bot, sendMessageToUsername } from "../bot";
import { AUTHORIZED_USERNAME } from "../config/env";

export const app = express();

app.get("/oauth2", async (req: Request, res: Response) => {
  let params: Record<string, string> = {};
  if (req.originalUrl.includes("#")) {
    const hash = req.originalUrl.split("#")[1];
    hash.split("&").forEach((pair) => {
      const [key, value] = pair.split("=");
      params[key] = decodeURIComponent(value || "");
    });
  } else {
    params = req.query as Record<string, string>;
  }

  const accessToken = params.access_token;
  const tokenType = params.token_type;
  const expiresIn = params.expires_in;
  const error = params.error;
  const state = params.state;

  const generatedState = customGmail.getAuthorizationState();
  if (!params.state || params.state !== generatedState) {
    sendMessageToUsername(AUTHORIZED_USERNAME, "Authorization Failed!");
    logger.error(
      `Authorization failed, States don't match, state: ${params.state}, generatedState: ${generatedState}`,
    );
    return res.send(200);
  }

  if (error) {
    logger.error("Something went wrong on google side, authorization failed!");
    sendMessageToUsername(AUTHORIZED_USERNAME, "Authorization Failed!");
  }

  if (accessToken) {
    customGmail.saveCredentials({
      access_token: accessToken,
      token_type: tokenType,
      expires_in: expiresIn,
    });
    logger.log("Authorization successful");
    sendMessageToUsername(AUTHORIZED_USERNAME, "Authorization successful.");
  }

  res.send(200);
});
