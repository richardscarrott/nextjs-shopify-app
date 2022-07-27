// https://github.com/Shopify/shopify-api-node/blob/main/src/utils/nonce.ts

import crypto from "crypto";

export const nonce = () => {
  const length = 15;
  const bytes = crypto.randomBytes(length);

  const nonce = bytes
    .map((byte) => {
      return byte % 10;
    })
    .join("");

  return nonce;
};
