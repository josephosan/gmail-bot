import { Telegraf, Markup } from "telegraf";
import { message } from "telegraf/filters";
import { AUTHORIZED_USERNAME, TELEGRAM_BOT_TOKEN } from "../config/env";
import { TELEGRAM_BOT_COMMAND } from "../config/bot";
import { customGmail } from "../mail";
import { logger } from "../log";

export const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

bot.start((ctx) => {
  logger.log("Bot start");
  return ctx.reply(
    "Choose an action:",
    Markup.keyboard([
      [
        Markup.button.callback(
          TELEGRAM_BOT_COMMAND.AUTHORIZE,
          TELEGRAM_BOT_COMMAND.AUTHORIZE,
        ),
      ],
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
          TELEGRAM_BOT_COMMAND.AUTHORIZE,
          TELEGRAM_BOT_COMMAND.AUTHORIZE,
        ),
      ],
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

// Authorize
bot.hears(TELEGRAM_BOT_COMMAND.AUTHORIZE, async (ctx) => {
  try {
    const username = ctx.from.username ?? null;

    if (!username || username !== AUTHORIZED_USERNAME) {
      await ctx.reply(`Cannot authenticate user: ${username}`);
      return;
    }

    await customGmail.authorize(ctx);
  } catch (error) {
    logger.error(`Authorization error: ${error}`);
    await ctx.reply("Failed to start authorization. Please try again later.");
  }
});

// * Get all
bot.hears(TELEGRAM_BOT_COMMAND.GET_ALL_ACTIVE_GMAIL, (ctx) => {
  customGmail.getActiveGmail(ctx);
});

// * Get last
bot.hears(TELEGRAM_BOT_COMMAND.GET_LAST_MAIL, (ctx) => {
  customGmail.getLastUnreadMails(ctx);
});

// * Summary
bot.hears(TELEGRAM_BOT_COMMAND.GET_ALL_MAIL_SUMMARY, (ctx) => {
  customGmail.getTodaysAllMailSummary(ctx);
});

export async function sendMessageToUsername(username: string, text: string) {
  const user = await bot.telegram.getChat(`${username}`);
  return bot.telegram.sendMessage(user.id, text);
}

// HEH
bot.on(message("sticker"), (ctx) => ctx.reply("👍"));

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
