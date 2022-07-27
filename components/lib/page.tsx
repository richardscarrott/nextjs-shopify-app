import { Provider as ShopifyAppBridgeProvider } from "@shopify/app-bridge-react";
import { isShopifyEmbedded } from "@shopify/app-bridge-utils";
import React, { useEffect, useState } from "react";
import { publicEnv } from "../../env";

// Page is intended to merely a bunch of Providers used by the majority of pages Page's

interface PageProps extends AppBridgeProvider {
  readonly children: React.ReactNode;
}

export const Page: React.FunctionComponent<PageProps> = ({
  host,
  embed,
  children,
}) => (
  <AppBridgeProvider host={host} embed={embed}>
    {children}
  </AppBridgeProvider>
);

interface AppBridgeProvider {
  readonly host: string;
  readonly embed?: boolean;
  readonly children: React.ReactNode;
}

const AppBridgeProvider: React.FunctionComponent<PageProps> = ({
  host,
  embed = false,
  children,
}) => {
  const isEmbedded = useIsShopifyEmbedded();
  return (
    <ShopifyAppBridgeProvider
      config={{
        apiKey: publicEnv.SHOPIFY_API_KEY,
        host,
        forceRedirect: embed,
      }}
    >
      {/* NOTE: We use the `embed` state to avoid the UI from flashing during the forced redirect after oauth */}
      {!embed || isEmbedded ? children : null}
    </ShopifyAppBridgeProvider>
  );
};

const useIsShopifyEmbedded = () => {
  const [isEmbedded, setIsEmbedded] = useState(false);
  useEffect(() => {
    setIsEmbedded(isShopifyEmbedded());
  }, []);
  return isEmbedded;
};
