import { object, assert, and, string, minLength } from "ok-computer";

// NOTE: Runtime config might be more suitable for us as these vars currently
// need to be available at build time...
// https://nextjs.org/docs/api-reference/next.config.js/runtime-configuration
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_HOST_NAME?: string;
      NEXT_PUBLIC_SHOPIFY_API_KEY?: string;
      SHOPIFY_API_SECRET?: string;
      SHOPIFY_SCOPE?: string;
      SESSION_COOKIE_SECRET?: string;
    }
  }
}

interface PrivateEnv {
  readonly SHOPIFY_API_SECRET: string;
  readonly SESSION_COOKIE_SECRET: string;
}

export const privateEnv = {
  SHOPIFY_API_SECRET: process.env.SHOPIFY_API_SECRET,
  SESSION_COOKIE_SECRET: process.env.SESSION_COOKIE_SECRET,
} as PrivateEnv;

if (typeof window === "undefined") {
  const validator = object({
    SHOPIFY_API_SECRET: and(string, minLength(1)),
    SESSION_COOKIE_SECRET: and(string, minLength(1)),
  });
  assert(validator(privateEnv));
}

interface PublicEnv {
  readonly HOST_NAME: string;
  readonly SHOPIFY_API_KEY: string;
  readonly SHOPIFY_SCOPE: string;
}

export const publicEnv = {
  HOST_NAME: process.env.NEXT_PUBLIC_HOST_NAME,
  SHOPIFY_API_KEY: process.env.NEXT_PUBLIC_SHOPIFY_API_KEY,
  SHOPIFY_SCOPE: process.env.NEXT_PUBLIC_SHOPIFY_SCOPE,
} as PublicEnv;

const validator = object({
  HOST_NAME: and(string, minLength(1)),
  SHOPIFY_API_KEY: and(string, minLength(1)),
  SHOPIFY_SCOPE: and(string, minLength(1)),
});
assert(validator(publicEnv));
