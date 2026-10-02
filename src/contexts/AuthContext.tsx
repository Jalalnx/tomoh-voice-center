import React, { createContext, useContext, useEffect, useState } from "react";
import { platformApi, claimServiceRequests } from "@/lib/api";
import { getPendingClaims, removePendingClaims } from "@/lib/pendingClaims";
import { LOGIN_URL, REGISTER_URL } from "@/config";

// Mirrors the pattern from tomoh-meet-main. The platform owns login/register —
// here we only probe for the shared .tomoh.io session cookie so we can
// pre-fill name/email in feedback forms for logged-in users.
// Auth is NOT required to submit feedback; the probe is best-effort.

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  avatar?: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  /** False while anonymous service requests stored on this device are being linked to the account. */
  claimsSettled: boolean;
  /** How many anonymous requests were linked to the account on this visit. */
  claimedCount: number;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  claimsSettled: true,
  claimedCount: 0,
});

/** Platform login/register URL that returns to `path` on this site afterwards. */
export function accountUrl(kind: "login" | "register", path = window.location.pathname): string {
  const back = encodeURIComponent(new URL(path, window.location.origin).href);
  return `${kind === "login" ? LOGIN_URL : REGISTER_URL}?return=${back}`;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [claimsSettled, setClaimsSettled] = useState(true);
  const [claimedCount, setClaimedCount] = useState(0);

  useEffect(() => {
    platformApi
      .get("/user")
      .then((res) => {
        const data = res.data?.data ?? res.data;
        if (data?.id) {
          setUser({
            id: data.id,
            username: data.username,
            email: data.email,
            avatar: data.avatar ?? null,
          });
        }
      })
      .catch(() => {
        // 401 = not signed in — perfectly fine for a public feedback center
      })
      .finally(() => setLoading(false));
  }, []);

  // Signed in with requests submitted anonymously from this device → link them.
  // Tokens are dropped after any definitive answer (claimed, already used or
  // expired all come back as 2xx); on network/5xx errors they're kept for the
  // next visit.
  useEffect(() => {
    if (!user) return;
    const tokens = getPendingClaims().map((c) => c.token);
    if (!tokens.length) return;

    setClaimsSettled(false);
    claimServiceRequests(tokens)
      .then((count) => {
        removePendingClaims(tokens);
        setClaimedCount(count);
      })
      .catch((err) => {
        const status = err?.response?.status;
        if (status === 422) removePendingClaims(tokens);
      })
      .finally(() => setClaimsSettled(true));
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, claimsSettled, claimedCount }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

// Link component for anonymous users who want to log in for pre-fill convenience
export const LoginPrompt: React.FC = () => {
  const { user, loading } = useAuth();
  if (loading || user) return null;
  return (
    <div className="bg-burgundy-50 border border-burgundy-100 rounded-xl px-4 py-3 mb-6 flex items-center justify-between gap-4 text-sm">
      <p className="text-gray-600">
        <span className="font-medium">هل لديك حساب؟</span> سجّل دخولك لملء بياناتك تلقائياً
      </p>
      <a
        href={accountUrl("login", window.location.href)}
        className="text-tomoh-burgundy font-bold hover:underline flex-shrink-0"
      >
        تسجيل الدخول ←
      </a>
    </div>
  );
};
