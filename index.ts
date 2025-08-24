import { bot } from "./bot";
import { EXPRESS_SERVER_PORT } from "./config/env";
import { logger } from "./log";
import { app } from "./server";

// * Launch bot
bot
  .launch(() => {
    logger.log("Bot launched");
  })
  .then(() => {
    // * Start express server
    app.listen(EXPRESS_SERVER_PORT, () =>
      logger.log(`Listening on port: ${EXPRESS_SERVER_PORT}`),
    );
  });
