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
          TELEGRAM_BOT_COMMAND.GET_ALL_ACTIVE_GMAIL,
          TELEGRAM_BOT_COMMAND.GET_ALL_ACTIVE_GMAIL,
        ),
      ],
      [
        Markup.button.callback(
          TELEGRAM_BOT_COMMAND.GET_LAST_MAIL,
          TELEGRAM_BOT_COMMAND.GET_LAST_MAIL,
        ),
      ],
      [
        Markup.button.callback(
          TELEGRAM_BOT_COMMAND.GET_ALL_MAIL_SUMMARY,
          TELEGRAM_BOT_COMMAND.GET_ALL_MAIL_SUMMARY,
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
          TELEGRAM_BOT_COMMAND.GET_ALL_ACTIVE_GMAIL,
          TELEGRAM_BOT_COMMAND.GET_ALL_ACTIVE_GMAIL,
        ),
      ],
      [
        Markup.button.callback(
          TELEGRAM_BOT_COMMAND.GET_LAST_MAIL,
          TELEGRAM_BOT_COMMAND.GET_LAST_MAIL,
        ),
      ],
      [
        Markup.button.callback(
          TELEGRAM_BOT_COMMAND.GET_ALL_MAIL_SUMMARY,
          TELEGRAM_BOT_COMMAND.GET_ALL_MAIL_SUMMARY,
        ),
      ],
    ]),
  );
});

// * Get all
bot.hears(TELEGRAM_BOT_COMMAND.GET_ALL_ACTIVE_GMAIL, (ctx) => {
  customGmail.getActiveGmail(ctx);
});
bot.action(TELEGRAM_BOT_COMMAND.GET_ALL_ACTIVE_GMAIL, (ctx) => {
  customGmail.getActiveGmail(ctx);
});

// * Get last
bot.hears(TELEGRAM_BOT_COMMAND.GET_LAST_MAIL, (ctx) => {
  customGmail.getLastMail(ctx);
});
bot.action(TELEGRAM_BOT_COMMAND.GET_LAST_MAIL, (ctx) => {
  customGmail.getLastMail(ctx);
});

// * Summary
bot.hears(TELEGRAM_BOT_COMMAND.GET_ALL_MAIL_SUMMARY, (ctx) => {
  customGmail.getTodaysAllMailSummary(ctx);
});
bot.action(TELEGRAM_BOT_COMMAND.GET_ALL_MAIL_SUMMARY, (ctx) => {
  customGmail.getTodaysAllMailSummary(ctx);
});

// HEH
bot.on(message("sticker"), (ctx) => ctx.reply("👍"));

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
