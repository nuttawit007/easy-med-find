import { createFileRoute, Link } from "@tanstack/react-router";
import { Calendar, Clock, Gift, Star, Trophy } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { upcomingAppointments, bookingHistory } from "@/lib/mock-data";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
  head: () => ({
    meta: [{ title: "My Dashboard — MedCentral" }],
  }),
});

function Dashboard() {
  const points = 720;
  const nextTier = 1000;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="container mx-auto px-4 py-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold md:text-4xl">Hi, Mint 👋</h1>
            <p className="mt-1 text-muted-foreground">Here's what's coming up and your rewards progress.</p>
          </div>
          <Button asChild><Link to="/">Book another visit</Link></Button>
        </div>

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="rewards">My Rewards</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-3">
            {upcomingAppointments.map((a) => (
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
            ))}
          </TabsContent>

          <TabsContent value="history" className="space-y-3">
            {bookingHistory.map((h) => (
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
            ))}
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
      </section>
    </div>
  );
}
