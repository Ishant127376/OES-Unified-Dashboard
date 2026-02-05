// Edge-runtime compatible JWT (HS256) verification for middleware.
// We still SIGN tokens in Node (route handlers) using jsonwebtoken.

type JwtPayload = {
  sub: string;
  email: string;
  role: "Admin" | "Sub-User";
  assignedDevices?: string[];
  iat?: number;
  exp?: number;
};

function base64UrlDecodeToBytes(input: string) {
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
  const str = atob(b64 + pad);
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) bytes[i] = str.charCodeAt(i);
  return bytes;
}

function base64UrlDecodeToString(input: string) {
  const bytes = base64UrlDecodeToBytes(input);
  return new TextDecoder().decode(bytes);
}

function bytesToBase64Url(bytes: Uint8Array) {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  const b64 = btoa(bin);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function hmacSha256(secret: string, data: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return new Uint8Array(sig);
}

export async function verifyJwtEdge(token: string, secret: string): Promise<JwtPayload | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [headerB64, payloadB64, sigB64] = parts;

    const headerJson = base64UrlDecodeToString(headerB64);
    const header = JSON.parse(headerJson) as { alg?: string; typ?: string };
    if (header.alg !== "HS256") return null;

    const signingInput = `${headerB64}.${payloadB64}`;
    const expectedSig = await hmacSha256(secret, signingInput);
    const expectedSigB64 = bytesToBase64Url(expectedSig);
    if (expectedSigB64 !== sigB64) return null;

    const payloadJson = base64UrlDecodeToString(payloadB64);
    const payload = JSON.parse(payloadJson) as JwtPayload;

    if (payload.exp && Date.now() / 1000 > payload.exp) return null;
    if (!payload.sub || !payload.role || !payload.email) return null;
    return payload;
  } catch {
    return null;
  }
}
