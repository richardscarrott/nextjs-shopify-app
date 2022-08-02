import jwt from "jsonwebtoken";
import { privateEnv, publicEnv } from "../env";
import assert from "assert";

const JWT_PERMITTED_CLOCK_TOLERANCE = 5;

export interface JwtPayload {
  readonly iss: string;
  readonly dest: string;
  readonly aud: string;
  readonly sub: string;
  readonly exp: number;
  readonly nbf: number;
  readonly iat: number;
  readonly jti: string;
  readonly sid: string;
}

/**
 * Decodes the given session token, and extracts the session information from it
 * https://github.com/Shopify/shopify-api-node/blob/b64d71f741e19b02bb215ef22378344343b7d2b8/src/utils/decode-session-token.ts#L25
 */
export const decodeSessionToken = (token: string): JwtPayload => {
  let payload: JwtPayload;
  try {
    assert(!!privateEnv.SHOPIFY_API_SECRET);
    payload = jwt.verify(token, privateEnv.SHOPIFY_API_SECRET, {
      algorithms: ["HS256"],
      clockTolerance: JWT_PERMITTED_CLOCK_TOLERANCE,
    }) as JwtPayload;
  } catch (ex) {
    throw new Error(`Failed to parse session token: ${(ex as Error).message}`);
  }

  // The exp and nbf fields are validated by the JWT library

  if (payload.aud !== publicEnv.SHOPIFY_API_KEY) {
    throw new Error("Session token had invalid API key");
  }

  return payload;
};
