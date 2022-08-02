// NOTE: This is utils/use.ts middleware for API routes, not next.js middleware
// See: https://gist.github.com/richardscarrott/cf314c28580e31099e3484ba6f950f2b
// Not: https://nextjs.org/docs/advanced-features/middleware

import Shopify from "shopify-api-node";
import { decodeSessionToken } from "../utils/decode-session-token";
import { find, ShopRecord } from "../utils/shop-storage";
import { sanitizeShop } from "../utils/shop-validator";
import { use, Middleware } from "../utils/use";

export const method =
  (
    method:
      | "GET"
      | "HEAD"
      | "POST"
      | "PUT"
      | "DELETE"
      | "CONNECT"
      | "OPTIONS"
      | "TRACE"
      | "PATCH"
  ): Middleware =>
  (req, res, vars, next) => {
    if (req.method !== method) {
      res.status(404).end();
      return;
    }
    return next();
  };

interface WithVerifiedShopVars {
  verifiedShop: string;
}

// https://github.com/Shopify/shopify-api-node/blob/b64d71f741e19b02bb215ef22378344343b7d2b8/src/auth/oauth/oauth.ts#L256
export const withVerifiedShop: Middleware<WithVerifiedShopVars> = (
  req,
  res,
  vars,
  next
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    throw new Error("Expected auth header");
  }
  const matches = authHeader.match(/^Bearer (.+)$/);
  if (!matches) {
    throw new Error("Missing Bearer token in authorization header");
  }
  const jwtPayload = decodeSessionToken(matches[1]);
  const verifiedShop = sanitizeShop(jwtPayload.dest.replace(/^https:\/\//, ""));
  if (!verifiedShop) {
    throw new Error("Could not verify shop");
  }
  vars.verifiedShop = verifiedShop;
  return next();
};

interface WithVerifiedShopRecordVars {
  verifiedShopRecord: ShopRecord;
}

export const withVerifiedShopRecord = use<
  WithVerifiedShopVars,
  WithVerifiedShopRecordVars
>(withVerifiedShop, async (req, res, vars, next) => {
  vars.verifiedShopRecord = await find(vars.verifiedShop);
  return next();
});

interface WithVerifiedShopifyClient {
  verifiedShopifyClient: Shopify;
}

export const withVerifiedShopifyClient = use<
  WithVerifiedShopRecordVars,
  WithVerifiedShopifyClient
>(withVerifiedShopRecord, (req, res, vars, next) => {
  vars.verifiedShopifyClient = new Shopify({
    shopName: vars.verifiedShopRecord.shop,
    accessToken: vars.verifiedShopRecord.accessToken,
  });
  return next();
});
