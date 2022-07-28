import ShopifyToken from "shopify-token";
import { privateEnv, publicEnv } from "../env";

// https://github.com/lpinca/shopify-token
export const shopifyToken = new ShopifyToken({
  apiKey: publicEnv.SHOPIFY_API_KEY,
  sharedSecret: privateEnv.SHOPIFY_API_SECRET,
  redirectUri: `${publicEnv.HOST_NAME}/auth/callback`,
});
