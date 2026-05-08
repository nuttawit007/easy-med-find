import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Building2, ShieldCheck, UserRound } from "lucide-react";
import { MedCentralLogo } from "@/components/medcentral-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAuth, type Role } from "@/lib/auth";

export const Route = createFileRoute("/auth")({
  component: Auth,
  head: () => ({ meta: [{ title: "Sign in — MedCentral" }] }),
});

function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, loginWithEmail } = useAuth();
  const navigate = useNavigate();

  const quickLogin = (role: Role, label: string) => {
    login(role);
    toast.success(`Signed in as ${label}`);
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="bg-hero-gradient flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-glow">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Stethoscope className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold">MedCentral</span>
        </Link>

        {/* Quick role login (testing) */}
        <div className="mb-5 rounded-2xl border border-dashed border-border bg-muted/30 p-3">
          <p className="mb-2 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Quick login (demo)
          </p>
          <div className="grid gap-2">
            <Button variant="outline" size="sm" className="justify-start" onClick={() => quickLogin("patient", "Patient")}>
              <UserRound className="mr-2 h-4 w-4 text-primary" /> Login as Patient
            </Button>
            <Button variant="outline" size="sm" className="justify-start" onClick={() => quickLogin("clinic_admin", "Clinic Admin")}>
              <Building2 className="mr-2 h-4 w-4 text-primary" /> Login as Clinic
            </Button>
            <Button variant="outline" size="sm" className="justify-start" onClick={() => quickLogin("platform_admin", "Platform Admin")}>
              <ShieldCheck className="mr-2 h-4 w-4 text-primary" /> Login as Admin
            </Button>
          </div>
        </div>

        <Tabs defaultValue="login">
          <TabsList className="mb-5 w-full">
            <TabsTrigger value="login" className="flex-1">Sign in</TabsTrigger>
            <TabsTrigger value="register" className="flex-1">Create account</TabsTrigger>
          </TabsList>

          <div className="space-y-3">
            <Button variant="outline" className="w-full" onClick={() => { loginWithEmail("google.user@gmail.com"); toast.success("Signed in with Google"); navigate({ to: "/dashboard" }); }}>
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18A10.997 10.997 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.83z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
              Continue with Google
            </Button>
            <Button variant="outline" className="w-full bg-[#06C755] text-white hover:bg-[#06C755]/90 hover:text-white" onClick={() => { loginWithEmail("line.user@line.me"); toast.success("Signed in with LINE"); navigate({ to: "/dashboard" }); }}>
              Continue with LINE
            </Button>
          </div>

          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            or with email
            <div className="h-px flex-1 bg-border" />
          </div>

          <TabsContent value="login">
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                loginWithEmail(email);
                toast.success("Signed in");
                navigate({ to: "/dashboard" });
              }}
            >
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="pw">Password</Label>
                <Input id="pw" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <Button className="w-full" size="lg" type="submit">Sign in</Button>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                loginWithEmail(email);
                toast.success("Account created");
                navigate({ to: "/dashboard" });
              }}
            >
              <div>
                <Label htmlFor="name">Full name</Label>
                <Input id="name" required />
              </div>
              <div>
                <Label htmlFor="email2">Email</Label>
                <Input id="email2" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="pw2">Password</Label>
                <Input id="pw2" type="password" required minLength={8} />
              </div>
              <Button className="w-full" size="lg" type="submit">Create account</Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
