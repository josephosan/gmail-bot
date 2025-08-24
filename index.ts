import { bot } from "./bot";
import { customGmail } from "./gmail";
import { logger } from "./log";

// * Run gmail stuff
// customGmail.authorize().then(customGmail.listLabels).catch(console.error);

// * Launch bot
bot.launch(() => {
  logger.log("Bot launched");
});
