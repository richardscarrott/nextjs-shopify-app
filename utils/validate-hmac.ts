// TODO: https://github.com/Shopify/shopify-api-node/blob/main/src/utils/hmac-validator.ts

export interface AuthQuery {
  code?: string;
  timestamp?: string;
  state?: string;
  shop?: string;
  host?: string;
  hmac?: string;
}

export const validateHmac = (query: AuthQuery) => {
  if (!query.hmac) {
    return false;
  }
  const { hmac } = query;

  // TODO.

  return true;
};
