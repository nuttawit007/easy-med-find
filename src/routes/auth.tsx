import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, ShieldAlert } from "lucide-react";
import { MedCentralLogo } from "@/components/medcentral-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useAuth, type UserRole } from "@/lib/auth";

type AuthSearch = { tab?: "signin" | "signup" };

export const Route = createFileRoute("/auth")({
  component: Auth,
  validateSearch: (search: Record<string, unknown>): AuthSearch => ({
    tab: search.tab === "signup" ? "signup" : "signin",
  }),
  head: () => ({ meta: [{ title: "Sign in — MedCentral" }] }),
});

function Auth() {
  const {
    user,
    loading,
    signInWithGoogle,
    signInWithLine,
    signInWithEmail,
    signUpWithEmail,
    signInAsMock,
    signInAsNewClinic,
  } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const search = useSearch({ from: "/auth" });

  const [mode, setMode] = useState<"signin" | "signup">(search.tab ?? "signin");

  useEffect(() => {
    if (search.tab) setMode(search.tab);
  }, [search.tab]);

  // Sign-in fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Sign-up fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole>("patient");

  const [submitting, setSubmitting] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "line" | null>(null);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard" });
  }, [user, loading, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error(t("auth.errEmailPassword"));
      return;
    }
    setSubmitting(true);
    try {
      await signInWithEmail(email, password);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("auth.errAuthFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !signUpEmail || !phone || !signUpPassword) {
      toast.error(t("auth.errFillFields"));
      return;
    }
    if (signUpPassword !== confirmPassword) {
      toast.error(t("auth.errPasswordMatch"));
      return;
    }
    if (signUpPassword.length < 6) {
      toast.error(t("auth.errPasswordLength"));
      return;
    }
    setSubmitting(true);
    try {
      const { needsConfirmation } = await signUpWithEmail({
        email: signUpEmail,
        password: signUpPassword,
        firstName,
        lastName,
        phone,
        role,
      });
      if (needsConfirmation) {
        toast.success(t("auth.checkEmail"));
      } else {
        toast.success(t("auth.accountCreated"));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("auth.errSignUpFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setOauthLoading("google");
    try {
      await signInWithGoogle();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Google sign-in failed");
      setOauthLoading(null);
    }
  };

  const handleLine = async () => {
    setOauthLoading("line");
    try {
      await signInWithLine();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "LINE sign-in failed");
      setOauthLoading(null);
    }
  };

  const handleMockLogin = (r: UserRole) => {
    signInAsMock(r);
    navigate({ to: "/dashboard" });
  };

  const handleMockNewClinicLogin = () => {
    signInAsNewClinic();
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="bg-hero-gradient flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-glow">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2.5">
          <MedCentralLogo size={40} className="rounded-xl shadow-soft" />
          <span className="text-xl font-bold">
            Med<span className="text-primary">Central</span>
          </span>
        </Link>

        <Tabs
          value={mode}
          onValueChange={(v) => setMode(v as "signin" | "signup")}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">{t("auth.login")}</TabsTrigger>
            <TabsTrigger value="signup">{t("auth.signup")}</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="mt-6">
            <h1 className="mb-1 text-center text-2xl font-bold">{t("auth.signInTitle")}</h1>
            <p className="mb-6 text-center text-sm text-muted-foreground">
              {t("auth.signInSubtitle")}
            </p>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t("auth.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder={t("auth.emailPlaceholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t("auth.password")}</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder={t("auth.passwordPlaceholder")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={submitting}
                  minLength={6}
                  required
                />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t("auth.signInCta")}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="mt-6">
            <h1 className="mb-1 text-center text-2xl font-bold">{t("auth.signUpTitle")}</h1>
            <p className="mb-6 text-center text-sm text-muted-foreground">
              {t("auth.signUpSubtitle")}
            </p>
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName">{t("auth.firstName")}</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={submitting}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">{t("auth.lastName")}</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={submitting}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signUpEmail">{t("auth.email")}</Label>
                <Input
                  id="signUpEmail"
                  type="email"
                  autoComplete="email"
                  placeholder={t("auth.emailPlaceholder")}
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  disabled={submitting}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{t("auth.phone")}</Label>
                <Input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder={t("auth.phonePlaceholder")}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={submitting}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signUpPassword">{t("auth.password")}</Label>
                <Input
                  id="signUpPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder={t("auth.passwordPlaceholder")}
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  disabled={submitting}
                  minLength={6}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t("auth.confirmPassword")}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder={t("auth.passwordPlaceholder")}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={submitting}
                  minLength={6}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>{t("auth.accountType")}</Label>
                <Tabs value={role} onValueChange={(v) => setRole(v as UserRole)}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="patient">{t("auth.rolePatient")}</TabsTrigger>
                    <TabsTrigger value="clinic">{t("auth.roleClinic")}</TabsTrigger>
                    <TabsTrigger value="admin">{t("auth.roleAdmin")}</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t("auth.createAccount")}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            {t("auth.orContinueWith")}
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full"
            size="lg"
            onClick={handleGoogle}
            disabled={oauthLoading !== null || submitting}
          >
            {oauthLoading === "google" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18A10.997 10.997 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.83z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"
                />
              </svg>
            )}
            {t("auth.continueWithGoogle")}
          </Button>
          <Button
            className="w-full bg-[#06C755] text-white hover:bg-[#06C755]/90"
            size="lg"
            onClick={handleLine}
            disabled={oauthLoading !== null || submitting}
          >
            {oauthLoading === "line" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("auth.continueWithLine")}
          </Button>
        </div>

        <div className="mt-8 rounded-2xl border border-dashed border-border bg-muted/40 p-4">
          <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <ShieldAlert className="h-3.5 w-3.5" />
            {t("auth.devLogin")}
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Button size="sm" variant="secondary" onClick={() => handleMockLogin("patient")}>
              {t("auth.devLoginAsPatient")}
            </Button>
            <Button size="sm" variant="secondary" onClick={() => handleMockLogin("clinic")}>
              {t("auth.devLoginAsClinic")}
            </Button>
            <Button size="sm" variant="secondary" onClick={() => handleMockLogin("admin")}>
              {t("auth.devLoginAsAdmin")}
            </Button>
            <Button size="sm" variant="secondary" onClick={handleMockNewClinicLogin} className="border-primary/30 bg-primary/5 text-primary hover:bg-primary/10">
              {t("auth.roleClinic")} (New)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
