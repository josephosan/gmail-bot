import express, { Request, Response } from "express";
import { logger } from "../log";
import { customGmail } from "../mail";
import { sendMessageToUsername } from "../bot";
import { AUTHORIZED_USERNAME, FINAL_REDIRECT_URL } from "../config/env";

export const app = express();

app.get("/oauth2callback", async (req: Request, res: Response) => {
  logger.log(`Api called with url: ${req.originalUrl}`);
  const code = req.query.code as string;
  const state = req.query.state as string;

  const generatedState = customGmail.getAuthorizationState();
  if (!state || state !== generatedState) {
    logger.error(
      `Authorization failed, States don't match, state: ${state}, generatedState: ${generatedState}`,
    );
    return res.sendStatus(403);
  }

  if (!code) {
    logger.error("No authorization code returned");
    return res.sendStatus(400);
  }

  try {
    const { tokens } = await customGmail.getOauth2Client().getToken(code);
    customGmail.setCredentials(tokens);
    logger.log("Authorization successful");
    return res.redirect(FINAL_REDIRECT_URL);
  } catch (err) {
    logger.error(`Error: ${err}`);
    res.sendStatus(500);
  }
});
