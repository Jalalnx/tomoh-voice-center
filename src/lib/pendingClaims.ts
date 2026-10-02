// Anonymous service requests come back with a one-time claim token. We keep it
// on this device so that, once the visitor signs in or creates an account on
// the platform and returns, AuthContext can attach the requests to the account.
//
// The token never goes into a URL (no leaking via history, Referer or logs) —
// it only travels in the claim POST body to our own API.
//
// localStorage can be unavailable (private mode, blocked site data), so every
// access is guarded; losing it just means the request stays anonymous.

const KEY = "tomoh_voice_pending_claims";
const TOKEN_RE = /^[a-f0-9]{64}$/;
// Matches config('voice.service_requests.claim_ttl_days') on the backend.
const TTL_MS = 30 * 24 * 60 * 60 * 1000;
const MAX_ENTRIES = 20; // backend accepts at most 20 tokens per claim

interface PendingClaim {
  token: string;
  reference: string;
  expiresAt: number;
}

function read(): PendingClaim[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    const now = Date.now();
    return parsed.filter(
      (c): c is PendingClaim =>
        typeof c?.token === "string" &&
        TOKEN_RE.test(c.token) &&
        typeof c?.reference === "string" &&
        typeof c?.expiresAt === "number" &&
        c.expiresAt > now,
    );
  } catch {
    return [];
  }
}

function write(claims: PendingClaim[]) {
  try {
    if (claims.length) localStorage.setItem(KEY, JSON.stringify(claims));
    else localStorage.removeItem(KEY);
  } catch {
    // ignore — see header comment
  }
}

export function addPendingClaim(token: string, reference: string) {
  if (!TOKEN_RE.test(token)) return;
  const claims = read().filter((c) => c.token !== token);
  claims.push({ token, reference, expiresAt: Date.now() + TTL_MS });
  write(claims.slice(-MAX_ENTRIES));
}

export function getPendingClaims(): PendingClaim[] {
  const claims = read();
  write(claims); // drop expired / malformed entries
  return claims;
}

export function removePendingClaims(tokens: string[]) {
  const drop = new Set(tokens);
  write(read().filter((c) => !drop.has(c.token)));
}
