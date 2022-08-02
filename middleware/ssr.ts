// NOTE: This is utils/use-ssr.ts middleware for SSR not next.js middleware
// See: https://gist.github.com/richardscarrott/cf314c28580e31099e3484ba6f950f2b
// Not: https://nextjs.org/docs/advanced-features/middleware

import { SsrMiddleware, useSsr } from "../utils/use-ssr";
import { privateEnv, publicEnv } from "../env";
import { AuthScopes } from "../utils/scopes";
import { find } from "../utils/shop-storage";
import { sanitizeShop, sanitizeHost } from "../utils/shop-validator";
import { IronSession, getIronSession, IronSessionOptions } from "iron-session";
import getPropertyDescriptorForReqSession from "../utils/iron-session";

export interface WithHostAndShopVars {
  shop: string;
  host: string;
}

export const withShop =
  <T extends boolean>(
    required: T
  ): SsrMiddleware<
    T extends true ? WithHostAndShopVars : Partial<WithHostAndShopVars>
  > =>
  (ctx, vars, next) => {
    const shop = sanitizeShop(ctx.query.shop?.toString() || "");
    const host = sanitizeHost(ctx.query.host?.toString() || "");
    if (required && (!shop || !host)) {
      return { notFound: true };
    }
    vars.shop = shop || undefined;
    vars.host = host || undefined;
    return next();
  };

interface WithIsDataReqVars {
  isDataReq: boolean;
}

// This is probably unwise, but I'm keen to be able to avoid install checks on SPA navigation's.
// https://github.com/vercel/next.js/blob/0f99768f9811fdf027a083471bd2a435f6207f4a/packages/next/server/web/adapter.ts#L26
export const unstable_withIsDataReq: SsrMiddleware<WithIsDataReqVars> = (
  ctx,
  vars,
  next
) => {
  vars.isDataReq = !!ctx.req.headers["x-nextjs-data"];
  return next();
};

export const requireInstall: SsrMiddleware = useSsr(
  withShop(true),
  unstable_withIsDataReq,
  async (ctx, vars, next) => {
    if (vars.isDataReq) {
      return next();
    }
    const shop = await find(vars.shop);
    if (!shop || !new AuthScopes(publicEnv.SHOPIFY_SCOPE).equals(shop.scope)) {
      return {
        redirect: {
          destination: `/auth?shop=${vars.shop}&host=${vars.host}`,
          permanent: false,
        },
      };
    }
    return next();
  }
);

const withIronSession =
  <Vars>(
    options: IronSessionOptions & { varName: string }
  ): SsrMiddleware<Vars> =>
  async (ctx, vars, next) => {
    const session = (await getIronSession(
      ctx.req,
      ctx.res,
      options
    )) as IronSession;
    Object.defineProperty(
      vars,
      options.varName,
      getPropertyDescriptorForReqSession(session)
    );
    return next();
  };

export const withShopifyOAuthSession = withIronSession<{
  shopifyOAuthSession: IronSession & { state?: string };
}>({
  varName: "shopifyOAuthSession",
  cookieName: "shopify.oauth.session",
  password: privateEnv.SESSION_COOKIE_SECRET,
  cookieOptions: {
    path: "/",
    httpOnly: true,
    sameSite: "lax", // We use "lax" to ensure it's sent when shopify /oauth/authorize redirects back to our callback url
    maxAge: undefined, // Session cookie (i.e. expire when browser closes)
  },
});
