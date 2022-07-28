import type { NextPage } from "next";
import { publicEnv } from "../../env";
import { shopifyToken } from "../../utils/shopify-token";
import { withShopifyOAuthSessionSsr } from "../../utils/with-oauth-session";

/**
 * Drops a cookie to later validate oauth `state` in the callback then redirects to Shopify authorize url.
 *
 * NOTE: If you don't care about validating the OAuth `state` param, this route could be
 * skipped and instead the index route could just redirect to the shopify auth url directly,
 * meaning you can therefore avoid cookie usage altogether.
 */

export const getServerSideProps = withShopifyOAuthSessionSsr(
  async (context) => {
    if (
      typeof context.query.shop !== "string" ||
      typeof context.query.host !== "string"
    ) {
      return { notFound: true };
    }

    const nonce = shopifyToken.generateNonce();

    context.req.session.state = nonce;
    await context.req.session.save();

    return {
      redirect: {
        destination: shopifyToken.generateAuthUrl(
          context.query.shop,
          publicEnv.SHOPIFY_SCOPE,
          nonce
        ),
        permanent: false,
      },
    };
  }
);

const PreAuth: NextPage = () => null;

export default PreAuth;
