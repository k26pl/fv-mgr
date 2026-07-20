import { baseUrl, cert, key, pw, nip } from "./config";
import { buildSignedAuthRequest } from "./crypto";
import {
  AuthChallengeSchema,
  AuthInitResponseSchema,
  AuthStatusSchema,
  PublicKeyCertificateSchema,
  TokenPairSchema,
  type TokenPair,
} from "./types";

let cachedToken: { pair: TokenPair; fetchedAt: number } | null = null;

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`KSeF request failed ${res.status} ${url}: ${body}`);
  }
  return res.json() as Promise<T>;
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Runs the full certificate auth flow and returns a fresh access token. */
async function authenticate(): Promise<TokenPair> {
  // 1. Get current KSeF public key (used to encrypt the challenge token, if
  //    required by the chosen auth variant — kept here for completeness).
  const pubKeyRes = await fetchJson(
    `${baseUrl}/security/public-key-certificates`,
  );
  PublicKeyCertificateSchema.array().parse(pubKeyRes);

  // 2. Request an auth challenge.
  const challengeRes = await fetchJson(`$baseUrl}/auth/challenge`, {
    method: "POST",
  });
  const { challenge, timestamp } = AuthChallengeSchema.parse(challengeRes);

  // 3. Build & XAdES-sign the AuthTokenRequest with our certificate.
  const signedXml = buildSignedAuthRequest({
    nip: nip,
    challenge,
    timestampIso: timestamp,
    certPem: cert,
    keyPem: key,
  });

  // 4. Submit the signed request to open an auth session.
  const initRes = await fetchJson(`${baseUrl}/auth/xades-signature`, {
    method: "POST",
    headers: { "Content-Type": "application/xml" },
    body: signedXml,
  });
  const { referenceNumber, authenticationToken } =
    AuthInitResponseSchema.parse(initRes);

  // 5. Poll until the async auth session finishes processing.
  for (let attempt = 0; attempt < 15; attempt++) {
    const statusRes = await fetchJson(`${baseUrl}/auth/${referenceNumber}`, {
      headers: { Authorization: `Bearer ${authenticationToken.token}` },
    });
    const status = AuthStatusSchema.parse(statusRes);
    if (status.status.code === 200) break;
    if (status.status.code >= 400) {
      throw new Error(`KSeF auth failed: ${status.status.description}`);
    }
    await sleep(1000);
  }

  // 6. Redeem the temporary token for a real access/refresh token pair.
  const tokenRes = await fetchJson(`${baseUrl}/auth/token/redeem`, {
    method: "POST",
    headers: { Authorization: `Bearer ${authenticationToken.token}` },
  });
  return TokenPairSchema.parse(tokenRes);
}

/** Returns a cached access token, transparently re-authenticating when it's near expiry. */
export async function getAccessToken(): Promise<string> {
  const now = Date.now();
  if (
    cachedToken &&
    new Date(cachedToken.pair.accessToken.validUntil).getTime() - now > 60_000
  ) {
    return cachedToken.pair.accessToken.token;
  }
  const pair = await authenticate();
  cachedToken = { pair, fetchedAt: now };
  return pair.accessToken.token;
}
