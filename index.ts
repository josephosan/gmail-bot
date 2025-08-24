import { bot } from "./bot";
import { logger } from "./log";

// * Launch bot
bot.launch(() => {
  logger.log("Bot launched");
});
