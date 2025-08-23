import { Telegraf, Markup } from "telegraf";
import { message } from "telegraf/filters";
import { TELEGRAM_BOT_TOKEN } from "../config/env";
import { TELEGRAM_BOT_COMMAND } from "../config/bot";

export const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

bot.start((ctx) => {
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

bot.hears(TELEGRAM_BOT_COMMAND.GET_ALL_GMAIL, (ctx) => {
  ctx.reply("Fetching all Gmail...");
});

bot.hears(TELEGRAM_BOT_COMMAND.GET_LAST_GMAIL, (ctx) => {
  ctx.reply("Fetching the last Gmail...");
});

bot.hears(TELEGRAM_BOT_COMMAND.GET_SUMMARY_GMAIL, (ctx) => {
  ctx.reply("Fetching Gmail summary...");
});

// HEH
bot.on(message("sticker"), (ctx) => ctx.reply("👍"));

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
