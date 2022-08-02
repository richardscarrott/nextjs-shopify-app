import type { GetServerSideProps, NextPage } from "next";
import React, { useEffect } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { Redirect } from "@shopify/app-bridge/actions";
import { isShopifyEmbedded } from "@shopify/app-bridge-utils";
import { AppBridgeProvider } from "../../components/lib/provider";
import { publicEnv } from "../../env";
import { useSsr, wrapSsr } from "../../utils/use-ssr";
import { withShop } from "../../middleware/ssr";

/**
 * Kicks off the Shopify OAuth flow, making sure we're in the top frame
 */

interface Props {
  readonly redirectUrl: string;
  readonly host: string;
}

export const getServerSideProps: GetServerSideProps<Props> = wrapSsr(
  useSsr(withShop(true), (ctx, { shop, host }) => {
    return {
      props: {
        redirectUrl: `${publicEnv.HOST_NAME}/auth/preauth?shop=${shop}&host=${host}`,
        host,
      },
    };
  })
);

const AuthPage: NextPage<Props> = (props) => (
  <AppBridgeProvider host={props.host}>
    <Auth {...props} />
  </AppBridgeProvider>
);

export default AuthPage;

const Auth: React.FunctionComponent<Props> = ({ redirectUrl }) => {
  const app = useAppBridge();

  useEffect(() => {
    const redirect = Redirect.create(app);
    if (isShopifyEmbedded()) {
      redirect.dispatch(Redirect.Action.REMOTE, redirectUrl);
      return;
    }
    window.location.href = redirectUrl;
  }, [app, redirectUrl]);

  return null;
};
