import type { GetServerSideProps, NextPage } from "next";
import { publicEnv } from "../../env";
import { withShop, withShopifyOAuthSession } from "../../middleware/ssr";
import { shopifyToken } from "../../utils/shopify-token";
import { useSsr, wrapSsr } from "../../utils/use-ssr";

/**
 * Drops a cookie to later validate oauth `state` in the callback, then redirects to Shopify authorize url.
 *
 * NOTE: If you don't care about validating the OAuth `state` param, this route could be
 * skipped and instead the index route could just redirect to the shopify auth url directly,
 * meaning you can therefore avoid cookie usage altogether.
 */

export const getServerSideProps: GetServerSideProps = wrapSsr(
  useSsr(
    withShop(true),
    withShopifyOAuthSession,
    async (ctx, { shop, shopifyOAuthSession }) => {
      const nonce = shopifyToken.generateNonce();

      shopifyOAuthSession.state = nonce;
      await shopifyOAuthSession.save();

      return {
        redirect: {
          destination: shopifyToken.generateAuthUrl(
            shop,
            publicEnv.SHOPIFY_SCOPE,
            nonce
          ),
          permanent: false,
        },
      };
    }
  )
);

const PreAuth: NextPage = () => null;

export default PreAuth;
