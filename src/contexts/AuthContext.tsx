import React, { createContext, useContext, useEffect, useState } from "react";
import { platformApi } from "@/lib/api";
import { LOGIN_URL } from "@/config";

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
}

const AuthContext = createContext<AuthContextValue>({ user: null, loading: true });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

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

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

// Link component for anonymous users who want to log in for pre-fill convenience
export const LoginPrompt: React.FC = () => {
  const { user, loading } = useAuth();
  if (loading || user) return null;
  const back = encodeURIComponent(window.location.href);
  return (
    <div className="bg-burgundy-50 border border-burgundy-100 rounded-xl px-4 py-3 mb-6 flex items-center justify-between gap-4 text-sm">
      <p className="text-gray-600">
        <span className="font-medium">هل لديك حساب؟</span> سجّل دخولك لملء بياناتك تلقائياً
      </p>
      <a
        href={`${LOGIN_URL}?return=${back}`}
        className="text-tomoh-burgundy font-bold hover:underline flex-shrink-0"
      >
        تسجيل الدخول ←
      </a>
    </div>
  );
};
