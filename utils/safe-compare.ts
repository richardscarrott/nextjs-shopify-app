import crypto from "crypto";

/**
 * A timing safe string comparison utility.
 * https://github.com/Shopify/shopify-api-node/blob/1bb138f95d166e2602f6d470a887194f8988c430/src/utils/safe-compare.ts
 */
export const safeCompare = (
  strA: string | { [key: string]: string } | string[] | number[],
  strB: string | { [key: string]: string } | string[] | number[]
): boolean => {
  let buffA: Buffer;
  let buffB: Buffer;

  if (typeof strA !== typeof strB) {
    throw new Error(
      `Mismatched data types provided: ${typeof strA} and ${typeof strB}`
    );
  }

  if (typeof strA === "object") {
    buffA = Buffer.from(JSON.stringify(strA));
  } else {
    buffA = Buffer.from(strA);
  }
  if (typeof strB === "object") {
    buffB = Buffer.from(JSON.stringify(strB));
  } else {
    buffB = Buffer.from(strB);
  }

  if (buffA.length === buffB.length) {
    return crypto.timingSafeEqual(buffA, buffB);
  }
  return false;
};
