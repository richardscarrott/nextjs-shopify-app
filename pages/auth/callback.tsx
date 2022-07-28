import { NextPage } from "next";
import { withShopifyOAuthSessionSsr } from "../../utils/with-oauth-session";
import { save } from "../../utils/shop-storage";
import { publicEnv } from "../../env";
import { shopifyToken } from "../../utils/shopify-token";
import { safeCompare } from "../../utils/safe-compare";

/**
 * Exchanges the oath `code` for an access token and shop + offline access token
 * in shop storage then redirects back to the now 'installed' app.
 */

export const getServerSideProps = withShopifyOAuthSessionSsr(
  async (context) => {
    if (
      typeof context.query.code !== "string" ||
      typeof context.query.timestamp !== "string" ||
      typeof context.query.state !== "string" ||
      context.query.state.length === 0 ||
      typeof context.query.shop !== "string" ||
      typeof context.query.host !== "string" ||
      typeof context.query.hmac !== "string"
    ) {
      return { notFound: true };
    }
    if (!shopifyToken.verifyHmac(context.query)) {
      throw new Error("Invalid hmac");
    }
    if (typeof context.req.session.state !== "string") {
      throw new Error("Missing session state");
    }
    if (!safeCompare(context.query.state, context.req.session.state)) {
      throw new Error(
        `Invalid state param: ${context.query.state} vs ${context.req.session.state}`
      );
    }

    const result = await shopifyToken.getAccessToken(
      context.query.shop,
      context.query.code
    );

    // Now we've validated the `state` (and used up `code`) we can ditch the session cookie
    // (This is our last chance to do so because we'll be embedded shortly, which means we
    // will no longer have access to cookies).
    context.req.session.destroy();

    await save({
      shop: context.query.shop,
      accessToken: result.access_token,
      scope: result.scope,
    });

    return {
      redirect: {
        destination: `https://${context.query.shop}/admin/apps/${publicEnv.SHOPIFY_API_KEY}`,
        permanent: false,
      },
    };
  }
);

const Callback: NextPage = () => null;

export default Callback;
