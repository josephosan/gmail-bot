import { Telegraf, Markup } from "telegraf";
import { message } from "telegraf/filters";
import { TELEGRAM_BOT_TOKEN } from "../config/env";
import { TELEGRAM_BOT_COMMAND } from "../config/bot";
import { customGmail } from "../gmail";
import { logger } from "../log";

logger.log(TELEGRAM_BOT_TOKEN);
export const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

bot.start((ctx) => {
  logger.log("Bot start");
  return ctx.reply(
    "Choose an action:",
    Markup.keyboard([
      [
        Markup.button.callback(
          TELEGRAM_BOT_COMMAND.GET_ALL_GMAIL,
          TELEGRAM_BOT_COMMAND.GET_ALL_GMAIL,
        ),
      ],
      [
        Markup.button.callback(
          TELEGRAM_BOT_COMMAND.GET_LAST_GMAIL,
          TELEGRAM_BOT_COMMAND.GET_LAST_GMAIL,
        ),
      ],
      [
        Markup.button.callback(
          TELEGRAM_BOT_COMMAND.GET_SUMMARY_GMAIL,
          TELEGRAM_BOT_COMMAND.GET_SUMMARY_GMAIL,
        ),
      ],
    ])
      .resize()
      .oneTime(),
  );
});

bot.help((ctx) => {
  return ctx.reply(
    "Choose an action:",
    Markup.inlineKeyboard([
      [
        Markup.button.callback(
          TELEGRAM_BOT_COMMAND.GET_ALL_GMAIL,
          TELEGRAM_BOT_COMMAND.GET_ALL_GMAIL,
        ),
      ],
      [
        Markup.button.callback(
          TELEGRAM_BOT_COMMAND.GET_LAST_GMAIL,
          TELEGRAM_BOT_COMMAND.GET_LAST_GMAIL,
        ),
      ],
      [
        Markup.button.callback(
          TELEGRAM_BOT_COMMAND.GET_SUMMARY_GMAIL,
          TELEGRAM_BOT_COMMAND.GET_SUMMARY_GMAIL,
        ),
      ],
    ]),
  );
});

// * Get all
bot.hears(TELEGRAM_BOT_COMMAND.GET_ALL_GMAIL, (ctx) => {
  customGmail.getAllGmail(ctx);
});
bot.action(TELEGRAM_BOT_COMMAND.GET_ALL_GMAIL, (ctx) => {
  customGmail.getAllGmail(ctx);
});

// * Get last
bot.hears(TELEGRAM_BOT_COMMAND.GET_LAST_GMAIL, (ctx) => {
  customGmail.getLastGmail(ctx);
});
bot.action(TELEGRAM_BOT_COMMAND.GET_LAST_GMAIL, (ctx) => {
  customGmail.getLastGmail(ctx);
});

// * Summary
bot.hears(TELEGRAM_BOT_COMMAND.GET_SUMMARY_GMAIL, (ctx) => {
  customGmail.getSummary(ctx);
});
bot.action(TELEGRAM_BOT_COMMAND.GET_SUMMARY_GMAIL, (ctx) => {
  customGmail.getSummary(ctx);
});

// HEH
bot.on(message("sticker"), (ctx) => ctx.reply("👍"));

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
