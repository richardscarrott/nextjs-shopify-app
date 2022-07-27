import type { GetServerSideProps, NextPage } from "next";
import React, { useEffect } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { Redirect } from "@shopify/app-bridge/actions";
import { isShopifyEmbedded } from "@shopify/app-bridge-utils";
import { Page } from "../../components/lib/page";
import { publicEnv } from "../../env";

/**
 * Kicks off the Shopify OAuth flow, making sure we're in the top frame
 */

interface Props {
  readonly redirectUrl: string;
  readonly host: string;
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  if (
    typeof context.query.shop !== "string" ||
    typeof context.query.host !== "string"
  ) {
    return { notFound: true };
  }

  return {
    props: {
      redirectUrl: `${publicEnv.HOST_NAME}/auth/preauth?shop=${context.query.shop}&host=${context.query.host}`,
      host: context.query.host,
    },
  };
};

const AuthPage: NextPage<Props> = (props) => (
  <Page host={props.host}>
    <Auth {...props} />
  </Page>
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
