import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Calendar, Clock, Gift, Star, Trophy, Building2, Stethoscope, Users, CheckCircle2, XCircle, Pencil, Plus, ShieldCheck, Loader2 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { upcomingAppointments, bookingHistory, pendingClinics, pendingServices, clinicAdminAppointments } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
  head: () => ({
    meta: [{ title: "My Dashboard — MedCentral" }],
  }),
});

function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="container mx-auto px-4 py-10">
        {user.role === "admin" ? (
          <PlatformAdminDashboard name={user.name} />
        ) : user.role === "clinic" ? (
          <ClinicAdminDashboard name={user.name} />
        ) : (
          <PatientDashboard name={user.name} />
        )}
      </section>
    </div>
  );
}

function EmptyState({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

function PatientDashboard({ name }: { name: string }) {
  const points = 0;
  const nextTier = 1000;

  return (
    <>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold md:text-4xl">Hi, {name} 👋</h1>
          <p className="mt-1 text-muted-foreground">Here's what's coming up and your rewards progress.</p>
        </div>
        <Button asChild><Link to="/">Book a visit</Link></Button>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="rewards">My Rewards</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-3">
          {upcomingAppointments.length === 0 ? (
            <EmptyState
              title="No upcoming appointments"
              description="Book your first visit to see it here."
              action={<Button asChild><Link to="/">Discover clinics</Link></Button>}
            />
          ) : (
            upcomingAppointments.map((a) => (
              <div key={a.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft">
                <div>
                  <p className="text-sm text-muted-foreground">{a.clinicName}</p>
                  <p className="text-lg font-semibold">{a.service}</p>
                  <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {a.date}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {a.time}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Reschedule</Button>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">Cancel</Button>
                </div>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-3">
          {bookingHistory.length === 0 ? (
            <EmptyState title="No past bookings" description="Your completed visits will appear here." />
          ) : (
            bookingHistory.map((h) => (
              <div key={h.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5">
                <div>
                  <p className="text-sm text-muted-foreground">{h.clinicName}</p>
                  <p className="font-semibold">{h.service}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{h.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{h.status}</Badge>
                  <Button size="sm" variant="outline"><Star className="mr-1 h-3.5 w-3.5" /> Leave review</Button>
                </div>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="rewards">
          <div className="rounded-2xl border border-border bg-gradient-to-br from-primary-soft to-secondary p-6 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-soft">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Your loyalty balance</p>
                <p className="text-3xl font-bold">{points} pts</p>
              </div>
            </div>
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress to Gold</span>
                <span className="font-medium">{points} / {nextTier}</span>
              </div>
              <Progress value={(points / nextTier) * 100} />
              <p className="mt-2 text-xs text-muted-foreground">Earn {nextTier - points} more points to unlock 15% off all bookings.</p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              { title: "฿200 off voucher", cost: 500 },
              { title: "Free facial add-on", cost: 800 },
              { title: "Birthday surprise", cost: 1000 },
            ].map((r) => (
              <div key={r.title} className="flex items-center justify-between rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                  <Gift className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{r.title}</p>
                    <p className="text-xs text-muted-foreground">{r.cost} pts</p>
                  </div>
                </div>
                <Button size="sm" disabled={points < r.cost} variant={points >= r.cost ? "default" : "outline"}>
                  Redeem
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}

function ClinicAdminDashboard({ name }: { name: string }) {
  const services = [
    { id: "s1", name: "Pico Laser Full Face", price: 3500, duration: 45 },
    { id: "s2", name: "Laser Hair Removal (Underarm)", price: 990, duration: 30 },
    { id: "s3", name: "Acne Laser Treatment", price: 2200, duration: 40 },
  ];

  return (
    <>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/15">Clinic Admin</Badge>
          </div>
          <h1 className="text-3xl font-bold md:text-4xl">{name}</h1>
          <p className="mt-1 text-muted-foreground">Manage your clinic profile, services and patient appointments.</p>
        </div>
        <Button onClick={() => toast("Editing clinic profile…")}>
          <Pencil className="mr-2 h-4 w-4" /> Edit Clinic Profile
        </Button>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Clinic Profile</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Building2 className="h-6 w-6" /></div>
              <div>
                <p className="font-semibold">Aura Skin & Laser Clinic</p>
                <p className="text-sm text-muted-foreground">Sukhumvit, Bangkok · Verified</p>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Button variant="outline"><Pencil className="mr-2 h-4 w-4" /> Update photos & description</Button>
              <Button variant="outline"><Pencil className="mr-2 h-4 w-4" /> Update contact & hours</Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="services" className="space-y-3">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => toast("New service form…")}><Plus className="mr-1 h-4 w-4" /> Add service</Button>
          </div>
          {services.map((s) => (
            <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-5">
              <div>
                <p className="font-semibold">{s.name}</p>
                <p className="text-sm text-muted-foreground">฿{s.price.toLocaleString()} · {s.duration} min</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline"><Pencil className="mr-1 h-4 w-4" /> Edit</Button>
                <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">Remove</Button>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="appointments" className="space-y-3">
          {clinicAdminAppointments.map((a) => (
            <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-5">
              <div>
                <p className="font-semibold">{a.service}</p>
                <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {a.date}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {a.time}</span>
                  <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> Patient #{a.id.slice(-2)}</span>
                </div>
              </div>
              <Badge variant={a.status === "Confirmed" ? "default" : "secondary"}>{a.status}</Badge>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </>
  );
}

function PlatformAdminDashboard({ name }: { name: string }) {
  return (
    <>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/15"><ShieldCheck className="mr-1 h-3 w-3" /> Platform Admin</Badge>
          </div>
          <h1 className="text-3xl font-bold md:text-4xl">{name}</h1>
          <p className="mt-1 text-muted-foreground">Approval queue for clinics and services awaiting verification.</p>
        </div>
      </div>

      <Tabs defaultValue="clinics" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="clinics">Pending Clinics ({pendingClinics.length})</TabsTrigger>
          <TabsTrigger value="services">Pending Services ({pendingServices.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="clinics" className="space-y-3">
          {pendingClinics.map((c) => (
            <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary"><Building2 className="h-5 w-5" /></div>
                <div>
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-sm text-muted-foreground">{c.category} · {c.location} · Submitted {c.submitted}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => toast.error("Rejected")}>
                  <XCircle className="mr-1 h-4 w-4" /> Reject
                </Button>
                <Button size="sm" onClick={() => toast.success("Approved")}>
                  <CheckCircle2 className="mr-1 h-4 w-4" /> Approve
                </Button>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="services" className="space-y-3">
          {pendingServices.map((s) => (
            <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary"><Stethoscope className="h-5 w-5" /></div>
                <div>
                  <p className="font-semibold">{s.service}</p>
                  <p className="text-sm text-muted-foreground">{s.clinicName} · ฿{s.price.toLocaleString()} · Submitted {s.submitted}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => toast.error("Rejected")}>
                  <XCircle className="mr-1 h-4 w-4" /> Reject
                </Button>
                <Button size="sm" onClick={() => toast.success("Approved")}>
                  <CheckCircle2 className="mr-1 h-4 w-4" /> Approve
                </Button>
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </>
  );
}
