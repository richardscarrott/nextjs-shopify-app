import { NextPage } from "next";
import { validateHmac } from "../../utils/validate-hmac";
import { withShopifyOAuthSessionSsr } from "../../utils/with-oauth-session";
import ShopifyToken from "shopify-token";
import { save } from "../../utils/shop-storage";
import { privateEnv, publicEnv } from "../../env";

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
      typeof context.query.shop !== "string" ||
      typeof context.query.host !== "string" ||
      typeof context.query.hmac !== "string"
    ) {
      return { notFound: true };
    }
    if (!context.req.session) {
      throw new Error("Session not found");
    }
    if (!validateHmac(context.query)) {
      throw new Error("Invalid hmac");
    }
    // TODO: Use safe compare from here https://github.com/Shopify/shopify-api-node/blob/main/src/utils/safe-compare.ts?
    if (context.query.state !== context.req.session.state) {
      throw new Error(
        `Invalid state param: ${context.query.state} vs ${context.req.session.state}`
      );
    }

    // Now we've validated the `state` we can ditch the session cookie
    // (this is our last chance to do so because we'll be embedded shortly,
    // which means we no longer have access to cookies).
    context.req.session.destroy();

    // TODO: Move this to util and use other features, it seems quite good?
    const shopifyToken = new ShopifyToken({
      apiKey: publicEnv.SHOPIFY_API_KEY,
      sharedSecret: privateEnv.SHOPIFY_API_SECRET,
      redirectUri: "notused",
    });

    const result = await shopifyToken.getAccessToken(
      context.query.shop,
      context.query.code
    );

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
