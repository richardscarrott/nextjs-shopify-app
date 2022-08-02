import { NextPage } from "next";
import { save } from "../../utils/shop-storage";
import { publicEnv } from "../../env";
import { shopifyToken } from "../../utils/shopify-token";
import { safeCompare } from "../../utils/safe-compare";
import { useSsr, wrapSsr } from "../../utils/use-ssr";
import { withShop, withShopifyOAuthSession } from "../../middleware/ssr";

/**
 * Exchanges the oath `code` for an access token and shop + offline access token
 * in shop storage then redirects back to the now 'installed' app.
 */

export const getServerSideProps = wrapSsr(
  useSsr(
    withShop(true),
    withShopifyOAuthSession,
    async (ctx, { shop, shopifyOAuthSession }) => {
      if (
        typeof ctx.query.code !== "string" ||
        typeof ctx.query.timestamp !== "string" ||
        typeof ctx.query.state !== "string" ||
        typeof ctx.query.hmac !== "string"
      ) {
        return { notFound: true };
      }
      if (!shopifyToken.verifyHmac(ctx.query)) {
        throw new Error("Invalid hmac");
      }
      if (typeof shopifyOAuthSession.state !== "string") {
        throw new Error("Missing session state");
      }
      if (
        ctx.query.state.length &&
        !safeCompare(ctx.query.state, shopifyOAuthSession.state)
      ) {
        throw new Error(
          `Invalid state param: ${ctx.query.state} vs ${shopifyOAuthSession.state}`
        );
      }

      const result = await shopifyToken.getAccessToken(shop, ctx.query.code);

      // Now we've validated the `state` (and used up `code`) we can ditch the session cookie
      // (This is our last chance to do so because we'll be embedded shortly, which means we
      // will no longer have access to cookies).
      shopifyOAuthSession.destroy();

      await save({
        shop,
        accessToken: result.access_token,
        scope: result.scope,
      });

      return {
        redirect: {
          destination: `https://${shop}/admin/apps/${publicEnv.SHOPIFY_API_KEY}`,
          permanent: false,
        },
      };
    }
  )
);

const Callback: NextPage = () => null;

export default Callback;
