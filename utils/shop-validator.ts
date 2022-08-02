// https://github.com/Shopify/shopify-api-node/blob/main/src/utils/shop-validator.ts

/**
 * Validates and sanitizes shop domain urls. Accepts myshopify.com and myshopify.io.
 */
export function sanitizeShop(
  shop: string,
  throwOnInvalid = false
): string | null {
  const domainsRegex = ["myshopify\\.com", "myshopify\\.io"];

  const shopUrlRegex = new RegExp(
    `^[a-zA-Z0-9][a-zA-Z0-9-_]*\\.(${domainsRegex.join("|")})[/]*$`
  );

  const sanitizedShop = shopUrlRegex.test(shop) ? shop : null;
  if (!sanitizedShop && throwOnInvalid) {
    throw new Error("Received invalid shop argument");
  }

  return sanitizedShop;
}

/**
 * Validates and sanitizes Shopify host arguments.
 */
export function sanitizeHost(
  host: string,
  throwOnInvalid = false
): string | null {
  const base64regex =
    /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;

  const sanitizedHost = base64regex.test(host) ? host : null;
  if (!sanitizedHost && throwOnInvalid) {
    throw new Error("Received invalid host argument");
  }

  return sanitizedHost;
}
