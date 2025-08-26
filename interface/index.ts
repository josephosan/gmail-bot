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

/**
 *
 */
export type TelegramContext = TelegramHearsContext | TelegramActionContext;

/**
 *
 */
export interface GoogleAuthData {
  access_token: string;
  expires_in: string;
  token_type: string;
  scope?: string;
  refresh_token?: string;
}

export interface GoogleCredentials {
  /**
   * This field is only present if the access_type parameter was set to offline in the authentication request. For details, see Refresh tokens.
   */
  refresh_token?: string | null;
  /**
   * The time in ms at which this token is thought to expire.
   */
  expiry_date?: number | null;
  /**
   * A token that can be sent to a Google API.
   */
  access_token?: string | null;
  /**
   * Identifies the type of token returned. At this time, this field always has the value Bearer.
   */
  token_type?: string | null;
  /**
   * A JWT that contains identity information about the user that is digitally signed by Google.
   */
  id_token?: string | null;
  /**
   * The scopes of access granted by the access_token expressed as a list of space-delimited, case-sensitive strings.
   */
  scope?: string;
}
