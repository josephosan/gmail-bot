import { Context } from "telegraf";
import { CallbackQuery, Message, Update } from "telegraf/typings/core/types/typegram";

/**
 *
 */
export type TelegramHearsContext = Context<{
  message: Update.New & Update.NonChannel & Message.TextMessage;
  update_id: number;
}> &
  Omit<Context<Update>, keyof Context<Update>> & {
    match: RegExpExecArray;
  };

/**
 *
 */
export type TelegramActionContext = Context<Update.CallbackQueryUpdate<CallbackQuery>> &
  Omit<Context<Update>, keyof Context<Update>> & {
    match: RegExpExecArray;
  };
