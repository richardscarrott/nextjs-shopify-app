import type { NextPage } from "next";
import { publicEnv } from "../../env";
import { nonce } from "../../utils/nonce";
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

    const state = nonce();
    context.req.session.state = state;
    await context.req.session.save();

    const authUrl = new URL(
      `https://${context.query.shop}/admin/oauth/authorize`
    );
    authUrl.searchParams.append("client_id", publicEnv.SHOPIFY_API_KEY);
    authUrl.searchParams.append("scope", publicEnv.SHOPIFY_SCOPE);
    authUrl.searchParams.append(
      "redirect_uri",
      `${publicEnv.HOST_NAME}/auth/callback`
    );
    authUrl.searchParams.append("state", state);

    return {
      redirect: {
        destination: authUrl.toString(),
        permanent: false,
      },
    };
  }
);

const PreAuth: NextPage = () => null;

export default PreAuth;
