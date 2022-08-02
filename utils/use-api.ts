import useSWR from "swr";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticatedFetch } from "@shopify/app-bridge-utils";
import { publicEnv } from "../env";

const useAuthenticatedFetch = () => {
  const app = useAppBridge();
  return authenticatedFetch(app);
};

interface UseApiOptions {
  readonly path: string;
  readonly shop: string;
  readonly host: string;
}

export const useApi = <Data extends {}>({
  path,
  shop,
  host,
}: UseApiOptions) => {
  const url = new URL(path, publicEnv.HOST_NAME);
  url.searchParams.append("shop", shop);
  url.searchParams.append("host", host);
  const fetch = useAuthenticatedFetch();
  return useSWR<Data>(
    url.toString(),
    () =>
      fetch(url.toString()).then((resp) => {
        if (resp.ok) {
          return resp.json();
        }
        throw new Error(`[ApiError] status: ${resp.status}`);
      }),
    { revalidateOnFocus: false }
  );
};
