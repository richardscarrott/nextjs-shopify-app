import {
  Provider as ShopifyAppBridgeProvider,
  LocationOrHref,
  History,
} from "@shopify/app-bridge-react";
import { isShopifyEmbedded } from "@shopify/app-bridge-utils";
import { AppProvider as ShopifyPolarisAppProvider } from "@shopify/polaris";
import enTranslations from "@shopify/polaris/locales/en.json";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";
import { publicEnv } from "../../env";

interface ProviderProps extends AppBridgeProvider {
  readonly children: React.ReactNode;
}

export const Provider: React.FunctionComponent<ProviderProps> = ({
  host,
  embed,
  children,
}) => (
  // @ts-ignore
  <ShopifyPolarisAppProvider i18n={enTranslations}>
    <AppBridgeProvider host={host} embed={embed}>
      {children}
    </AppBridgeProvider>
  </ShopifyPolarisAppProvider>
);

interface AppBridgeProvider {
  readonly host: string;
  readonly embed?: boolean;
  readonly children: React.ReactNode;
}

export const AppBridgeProvider: React.FunctionComponent<ProviderProps> = ({
  host,
  embed = false,
  children,
}) => {
  const isEmbedded = useIsShopifyEmbedded();
  const appBridgeRouter = useAppBridgeRouter();
  return (
    <ShopifyAppBridgeProvider
      config={{
        apiKey: publicEnv.SHOPIFY_API_KEY,
        host,
        forceRedirect: embed,
      }}
      router={appBridgeRouter}
    >
      {/* NOTE: We use the `isEmbedded` state to prevent the UI from flashing during the forced redirect after oauth */}
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

interface AppBridgeRouter {
  readonly location: LocationOrHref;
  readonly history: History;
}

const useAppBridgeRouter = (): AppBridgeRouter => {
  const router = useRouter();
  const location: LocationOrHref = useMemo(() => {
    const url = new URL(router.asPath, publicEnv.HOST_NAME);
    return {
      pathname: url.pathname,
      search: `?${url.searchParams.toString()}`,
      hash: url.hash,
    };
  }, [router.pathname, router.query]);

  const history: History = useMemo(
    () => ({ replace: (path) => router.replace(path) }),
    [router.replace]
  );

  return useMemo(
    () => ({
      location,
      history,
    }),
    [location, history]
  );
};
