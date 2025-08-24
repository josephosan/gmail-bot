import express, { Request, Response } from "express";
import { logger } from "../log";

export const app = express();

app.get("/oauth2", async (req: Request, res: Response) => {
  const code = req.query.code as string;

  if (!code) {
    return res.status(400).send("No code provided");
  }

  logger.log(`Auth code: ${code}`);
});
