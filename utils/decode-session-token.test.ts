// https://github.com/Shopify/shopify-api-node/blob/b64d71f741e19b02bb215ef22378344343b7d2b8/src/utils/__tests__/decode-session-token.test.ts

jest.mock("../env", () => {
  return {
    publicEnv: {
      SHOPIFY_API_KEY: "test_key",
    },
    privateEnv: {
      SHOPIFY_API_SECRET: "test_secret_key",
    },
  };
});
import jwt from "jsonwebtoken";
import { decodeSessionToken, JwtPayload } from "./decode-session-token";
import { publicEnv, privateEnv } from "../env";

let payload: JwtPayload;

// The tests below are not in a describe block because we need to alter the Context object, and we want to start
// each test with a valid Context.
beforeEach(() => {
  // Defined here so we can get the initialized Context values
  payload = {
    iss: "test-shop.myshopify.io/admin",
    dest: "test-shop.myshopify.io",
    aud: publicEnv.SHOPIFY_API_KEY,
    sub: "1",
    exp: Date.now() / 1000 + 3600,
    nbf: 1234,
    iat: 1234,
    jti: "4321",
    sid: "abc123",
  };
});

test("JWT session token can verify valid tokens", () => {
  const token = jwt.sign(payload, privateEnv.SHOPIFY_API_SECRET, {
    algorithm: "HS256",
  });

  const actualPayload = decodeSessionToken(token);
  expect(actualPayload).toStrictEqual(payload);
});

test("JWT session token fails with invalid tokens", () => {
  expect(() => decodeSessionToken("not_a_valid_token")).toThrow(
    new Error("Failed to parse session token: jwt malformed")
  );
});

test("JWT session token fails if the token is expired", () => {
  const invalidPayload = { ...payload };
  invalidPayload.exp = new Date().getTime() / 1000 - 60;

  const token = jwt.sign(invalidPayload, privateEnv.SHOPIFY_API_SECRET, {
    algorithm: "HS256",
  });
  expect(() => decodeSessionToken(token)).toThrow(
    new Error("Failed to parse session token: jwt expired")
  );
});

test("JWT session token fails if the token is not activated yet", () => {
  const invalidPayload = { ...payload };
  invalidPayload.nbf = new Date().getTime() / 1000 + 60;

  const token = jwt.sign(invalidPayload, privateEnv.SHOPIFY_API_SECRET, {
    algorithm: "HS256",
  });
  expect(() => decodeSessionToken(token)).toThrow(
    new Error("Failed to parse session token: jwt not active")
  );
});

test("JWT session token fails if the API key is wrong", () => {
  // The token is signed with a key that is not the current value
  const token = jwt.sign(payload, privateEnv.SHOPIFY_API_SECRET, {
    algorithm: "HS256",
  });
  // @ts-ignore
  publicEnv.SHOPIFY_API_KEY = "something_else";
  expect(() => decodeSessionToken(token)).toThrow(
    new Error("Session token had invalid API key")
  );
});
