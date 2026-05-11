import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { MedCentralLogo } from "@/components/medcentral-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/auth")({
  component: Auth,
  head: () => ({ meta: [{ title: "Sign in — MedCentral" }] }),
});

function Auth() {
  const { user, loading, signInWithGoogle, signInWithLine, signInWithEmail, signUpWithEmail } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "line" | null>(null);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard" });
  }, [user, loading, navigate]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }
    setSubmitting(true);
    try {
      if (mode === "signin") {
        await signInWithEmail(email, password);
      } else {
        const { needsConfirmation } = await signUpWithEmail(email, password);
        if (needsConfirmation) {
          toast.success(t("auth.checkEmail"));
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
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

  const isSignIn = mode === "signin";

  return (
    <div className="bg-hero-gradient flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-glow">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2.5">
          <MedCentralLogo size={40} className="rounded-xl shadow-soft" />
          <span className="text-xl font-bold">
            Med<span className="text-primary">Central</span>
          </span>
        </Link>

        <h1 className="mb-1 text-center text-2xl font-bold">
          {isSignIn ? t("auth.signInTitle") : t("auth.signUpTitle")}
        </h1>
        <p className="mb-6 text-center text-sm text-muted-foreground">
          {isSignIn ? t("auth.signInSubtitle") : t("auth.signUpSubtitle")}
        </p>

        <form onSubmit={handleEmailSubmit} className="space-y-4">
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
              autoComplete={isSignIn ? "current-password" : "new-password"}
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
            {isSignIn ? t("auth.signInCta") : t("auth.signUpCta")}
          </Button>
        </form>

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
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18A10.997 10.997 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.83z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
            )}
            Continue with Google
          </Button>
          <Button
            className="w-full bg-[#06C755] text-white hover:bg-[#06C755]/90"
            size="lg"
            onClick={handleLine}
            disabled={oauthLoading !== null || submitting}
          >
            {oauthLoading === "line" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Continue with LINE
          </Button>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {isSignIn ? t("auth.noAccount") : t("auth.haveAccount")}{" "}
          <button
            type="button"
            className="font-medium text-primary hover:underline"
            onClick={() => setMode(isSignIn ? "signup" : "signin")}
          >
            {isSignIn ? t("auth.switchToSignUp") : t("auth.switchToSignIn")}
          </button>
        </p>
      </div>
    </div>
  );
}
