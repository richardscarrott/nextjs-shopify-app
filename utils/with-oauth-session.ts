import { withIronSessionSsr } from "iron-session/next";
import { privateEnv } from "../env";

declare module "iron-session" {
  interface IronSessionData {
    state?: string;
  }
}


// NOTE: This session cookie is only for oauth which occurs in the top frame where
// we are a first party.
export const withShopifyOAuthSessionSsr = <Props extends { [key: string]: unknown }>(
  handler: Parameters<typeof withIronSessionSsr<Props>>[0]
) =>
  withIronSessionSsr<Props>(handler, {
    cookieName: "shopify.oauth.session",
    password: privateEnv.SESSION_COOKIE_SECRET,
    cookieOptions: {
      path: "/",
      httpOnly: true,
      sameSite: "lax", // We use "lax" to ensure it's sent when shopify /oauth/authorize redirects back to our callback url
      maxAge: undefined, // Session cookie (i.e. expire when browser closes)
    },
  });
