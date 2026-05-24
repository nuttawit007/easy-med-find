import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type UserRole = "patient" | "clinic" | "admin";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  phone?: string;
};

export type SignUpPayload = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: UserRole;
};

type AuthContextType = {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  isMock: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithLine: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (payload: SignUpPayload) => Promise<{ needsConfirmation: boolean }>;
  signInAsMock: (role: UserRole) => void;
  signInAsNewClinic: () => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

const MOCK_STORAGE_KEY = "medcentral.mockUser";

const REDIRECT_URL =
  typeof window !== "undefined"
    ? `${window.location.origin}/`
    : "https://easy-med-find.lovable.app/";

function toAuthUser(u: User | null | undefined): AuthUser | null {
  if (!u) return null;
  const meta = (u.user_metadata ?? {}) as Record<string, unknown>;
  const firstName = (meta.first_name as string) || "";
  const lastName = (meta.last_name as string) || "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ");
  const name =
    fullName ||
    (meta.full_name as string) ||
    (meta.name as string) ||
    (meta.display_name as string) ||
    (u.email ? u.email.split("@")[0] : "User");
  const avatar = (meta.avatar_url as string) || (meta.picture as string) || undefined;
  const role = ((meta.role as UserRole) || "patient") as UserRole;
  return {
    id: u.id,
    name,
    email: u.email ?? "",
    avatar,
    role,
    firstName,
    lastName,
    phone: (meta.phone as string) || "",
  };
}

function makeMockUser(role: UserRole): AuthUser {
  const presets: Record<UserRole, AuthUser> = {
    patient: {
      id: "mock-patient",
      name: "Pat Patient",
      email: "patient@medcentral.com",
      role: "patient",
      firstName: "Pat",
      lastName: "Patient",
    },
    clinic: {
      id: "mock-clinic",
      name: "Clinic Manager",
      email: "clinic@medcentral.com",
      role: "clinic",
      firstName: "Clinic",
      lastName: "Manager",
    },
    admin: {
      id: "mock-admin",
      name: "Platform Admin",
      email: "admin@medcentral.com",
      role: "admin",
      firstName: "Platform",
      lastName: "Admin",
    },
  };
  return presets[role];
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isMock, setIsMock] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore mock session if present
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem(MOCK_STORAGE_KEY);
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as AuthUser;
          setUser(parsed);
          setIsMock(true);
          setLoading(false);
          return;
        } catch {
          localStorage.removeItem(MOCK_STORAGE_KEY);
        }
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(toAuthUser(newSession?.user));
      setIsMock(false);
    });

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(toAuthUser(s?.user));
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: REDIRECT_URL },
    });
    if (error) throw error;
  };

  const signInWithLine = async () => {
    // LINE is not a native Supabase OAuth provider.
    // We redirect directly to LINE's OAuth 2.1 authorization endpoint.
    const clientId = import.meta.env.VITE_LINE_CLIENT_ID as string | undefined;
    if (!clientId) {
      throw new Error("LINE Login ยังไม่ได้ตั้งค่า — กรุณาเพิ่ม VITE_LINE_CLIENT_ID ใน .env");
    }
    const state = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    sessionStorage.setItem("lineOAuthState", state);
    const redirectUri = `${window.location.origin}/auth`;
    const params = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      redirect_uri: redirectUri,
      state,
      scope: "profile openid email",
    });
    window.location.href = `https://access.line.me/oauth2/v2.1/authorize?${params}`;
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUpWithEmail = async (payload: SignUpPayload) => {
    const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/` : undefined;
    const { data, error } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: {
        emailRedirectTo: redirectTo,
        data: {
          first_name: payload.firstName,
          last_name: payload.lastName,
          phone: payload.phone,
          role: payload.role,
          full_name: `${payload.firstName} ${payload.lastName}`.trim(),
        },
      },
    });
    if (error) throw error;
    return { needsConfirmation: !data.session };
  };

  const signInAsMock = (role: UserRole) => {
    const mock = makeMockUser(role);
    if (typeof window !== "undefined") {
      localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(mock));
    }
    setUser(mock);
    setSession(null);
    setIsMock(true);
    setLoading(false);
  };

  const signInAsNewClinic = () => {
    const mock: AuthUser = {
      id: "mock-clinic-new",
      name: "New Clinic Manager",
      email: "newclinic@medcentral.com",
      role: "clinic",
      firstName: "New",
      lastName: "Manager",
    };
    if (typeof window !== "undefined") {
      localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(mock));
    }
    setUser(mock);
    setSession(null);
    setIsMock(true);
    setLoading(false);
  };

  const signOut = async () => {
    if (isMock) {
      if (typeof window !== "undefined") localStorage.removeItem(MOCK_STORAGE_KEY);
      setUser(null);
      setIsMock(false);
      return;
    }
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isMock,
        signInWithGoogle,
        signInWithLine,
        signInWithEmail,
        signUpWithEmail,
        signInAsMock,
        signInAsNewClinic,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
