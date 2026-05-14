import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import {
  Clock,
  Gift,
  Trophy,
  Building2,
  Users,
  CheckCircle2,
  XCircle,
  Pencil,
  Plus,
  ShieldCheck,
  Loader2,
  MoreHorizontal,
  RotateCcw,
  CalendarDays,
  Stethoscope,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { pendingClinics, pendingServices } from "@/lib/mock-data";
import { useClinics, updateClinicProfile, updateClinicServices } from "@/lib/clinics";
import { useAuth } from "@/lib/auth";
import { useBookings, isUpcoming, updateBookingStatus, type Booking } from "@/lib/bookings";
import { incrementLoyaltyPoints, useLoyaltyPoints } from "@/lib/loyalty";
import { BookingTicketCard, EmptyTicketState } from "@/components/booking-ticket-card";
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

function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

function PatientDashboard({ name }: { name: string }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const bookings = useBookings();
  const points = useLoyaltyPoints(user?.id) ?? 0;
  const nextTier = 1000;

  const { upcoming, history } = useMemo(() => {
    const upcoming = bookings.filter(isUpcoming);
    const history = bookings.filter((b) => !isUpcoming(b));
    return { upcoming, history };
  }, [bookings]);

  return (
    <>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold md:text-4xl">Hi, {name} 👋</h1>
          <p className="mt-1 text-muted-foreground">{t("dashboard.subtitle")}</p>
        </div>
        <Button asChild>
          <Link to="/">{t("dashboard.bookVisit")}</Link>
        </Button>
      </div>

      <div className="mb-6 rounded-2xl border border-border bg-gradient-to-br from-primary-soft to-secondary p-5 shadow-soft">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-soft">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t("loyalty.myRewards")}
              </p>
              <p className="text-2xl font-bold">
                {t("loyalty.youHavePoints", { count: points })}
              </p>
            </div>
          </div>
          <Badge className="bg-primary/10 text-primary hover:bg-primary/15">
            {t("loyalty.totalPoints")}: {points}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="upcoming">{t("dashboard.tabUpcoming")}</TabsTrigger>
          <TabsTrigger value="history">{t("dashboard.tabHistory")}</TabsTrigger>
          <TabsTrigger value="rewards">{t("dashboard.tabRewards")}</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcoming.length === 0 ? (
            <EmptyTicketState
              title={t("dashboard.emptyUpcomingTitle")}
              description={t("dashboard.emptyUpcomingDesc")}
              action={
                <Button asChild>
                  <Link to="/">{t("dashboard.discoverClinics")}</Link>
                </Button>
              }
            />
          ) : (
            upcoming.map((b) => <BookingTicketCard key={b.bookingId} booking={b} />)
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {history.length === 0 ? (
            <EmptyTicketState
              title={t("dashboard.emptyHistoryTitle")}
              description={t("dashboard.emptyHistoryDesc")}
            />
          ) : (
            history.map((b) => (
              <BookingTicketCard key={b.bookingId} booking={{ ...b, status: "completed" }} />
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
                <span className="font-medium">
                  {points} / {nextTier}
                </span>
              </div>
              <Progress value={(points / nextTier) * 100} />
              <p className="mt-2 text-xs text-muted-foreground">
                Earn {nextTier - points} more points to unlock 15% off all bookings.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              { title: "฿200 off voucher", cost: 500 },
              { title: "Free facial add-on", cost: 800 },
              { title: "Birthday surprise", cost: 1000 },
            ].map((r) => (
              <div
                key={r.title}
                className="flex items-center justify-between rounded-2xl border border-border bg-card p-4"
              >
                <div className="flex items-center gap-3">
                  <Gift className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{r.title}</p>
                    <p className="text-xs text-muted-foreground">{r.cost} pts</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  disabled={points < r.cost}
                  variant={points >= r.cost ? "default" : "outline"}
                >
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
  const { t } = useTranslation();
  const { user } = useAuth();
  const allBookings = useBookings();
  const allClinics = useClinics();

  // Statically map mock user to clinic "c1"
  const clinicId = "c1";
  const clinic = allClinics.find((c) => c.id === clinicId) || allClinics[0];

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [editProfile, setEditProfile] = useState({ name: clinic.name, location: clinic.location });

  const [isServiceOpen, setIsServiceOpen] = useState(false);
  const [editService, setEditService] = useState<{
    id?: string;
    name: string;
    price: string;
    duration: string;
  } | null>(null);

  const handleSaveProfile = () => {
    updateClinicProfile(clinic.id, { name: editProfile.name, location: editProfile.location });
    setIsProfileOpen(false);
    toast.success("Profile updated");
  };

  const handleSaveService = () => {
    if (!editService || !editService.name || !editService.price || !editService.duration) {
      toast.error("Please fill in all fields");
      return;
    }
    const price = Number(editService.price);
    const durationMin = Number(editService.duration);
    let nextServices = [...clinic.services];

    if (editService.id) {
      nextServices = nextServices.map((s) =>
        s.name === editService.id ? { name: editService.name, price, durationMin } : s,
      );
      toast.success("Service updated");
    } else {
      nextServices.push({ name: editService.name, price, durationMin });
      toast.success("Service added");
    }
    updateClinicServices(clinic.id, nextServices);
    setIsServiceOpen(false);
  };

  const handleDeleteService = (serviceName: string) => {
    const nextServices = clinic.services.filter((s) => s.name !== serviceName);
    updateClinicServices(clinic.id, nextServices);
    toast.success("Service removed");
  };

  const appointments = useMemo(() => {
    if (!user) return [] as Booking[];
    return allBookings.filter((b) => b.clinicId === clinic.id);
  }, [allBookings, user, clinic.id]);

  const handleStatus = (id: string, status: Booking["status"]) => {
    const booking = allBookings.find((b) => b.bookingId === id);
    const wasAlreadyCompleted = booking?.status === "completed";
    updateBookingStatus(id, status);
    if (status === "completed") {
      // Award 1 loyalty point to the patient on completion (only if not already completed)
      if (!wasAlreadyCompleted && booking?.patientId) {
        incrementLoyaltyPoints(booking.patientId, 1);
      }
      toast.success(t("clinicAdmin.toastCompleted"));
    } else if (status === "cancelled") toast(t("clinicAdmin.toastCancelled"));
    else toast(t("clinicAdmin.toastReopened"));
  };

  return (
    <>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/15">
              {t("clinicAdmin.title")}
            </Badge>
          </div>
          <h1 className="text-3xl font-bold md:text-4xl">{name}</h1>
          <p className="mt-1 text-muted-foreground">{t("clinicAdmin.subtitle")}</p>
        </div>
        <Button
          onClick={() => {
            setEditProfile({ name: clinic.name, location: clinic.location });
            setIsProfileOpen(true);
          }}
        >
          <Pencil className="mr-2 h-4 w-4" /> {t("clinicAdmin.editProfile")}
        </Button>

        <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Clinic Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Clinic Name</Label>
                <Input
                  value={editProfile.name}
                  onChange={(e) => setEditProfile({ ...editProfile, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={editProfile.location}
                  onChange={(e) => setEditProfile({ ...editProfile, location: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsProfileOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveProfile}>Save changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isServiceOpen} onOpenChange={setIsServiceOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editService?.id ? "Edit Service" : "Add Service"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Service Name</Label>
                <Input
                  value={editService?.name || ""}
                  onChange={(e) =>
                    setEditService((s) => (s ? { ...s, name: e.target.value } : null))
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price (THB)</Label>
                  <Input
                    type="number"
                    step="100"
                    value={editService?.price || ""}
                    onChange={(e) =>
                      setEditService((s) => (s ? { ...s, price: e.target.value } : null))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duration (min)</Label>
                  <Input
                    type="number"
                    value={editService?.duration || ""}
                    onChange={(e) =>
                      setEditService((s) => (s ? { ...s, duration: e.target.value } : null))
                    }
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsServiceOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveService}>Save changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="appointments" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">{t("clinicAdmin.tabProfile")}</TabsTrigger>
          <TabsTrigger value="services">{t("clinicAdmin.tabServices")}</TabsTrigger>
          <TabsTrigger value="appointments">
            {t("clinicAdmin.tabAppointments")} ({appointments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold">{clinic.name}</p>
                <p className="text-sm text-muted-foreground">
                  {clinic.location}
                  {clinic.verified ? " · Verified" : ""}
                </p>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Button
                variant="outline"
                onClick={() => {
                  setEditProfile({ name: clinic.name, location: clinic.location });
                  setIsProfileOpen(true);
                }}
              >
                <Pencil className="mr-2 h-4 w-4" /> Update details
              </Button>
              <Button variant="outline">
                <Pencil className="mr-2 h-4 w-4" /> Update contact & hours
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="services" className="space-y-3">
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={() => {
                setEditService({ name: "", price: "", duration: "" });
                setIsServiceOpen(true);
              }}
            >
              <Plus className="mr-1 h-4 w-4" /> {t("clinicAdmin.addService")}
            </Button>
          </div>
          {clinic.services.map((s) => (
            <div
              key={s.name}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-5"
            >
              <div>
                <p className="font-semibold">{s.name}</p>
                <p className="text-sm text-muted-foreground">
                  ฿{s.price.toLocaleString()} · {s.durationMin} min
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditService({
                      id: s.name,
                      name: s.name,
                      price: s.price.toString(),
                      duration: s.durationMin.toString(),
                    });
                    setIsServiceOpen(true);
                  }}
                >
                  <Pencil className="mr-1 h-4 w-4" /> {t("clinicAdmin.edit")}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDeleteService(s.name)}
                >
                  {t("clinicAdmin.remove")}
                </Button>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="appointments">
          {appointments.length === 0 ? (
            <EmptyTicketState
              title={t("clinicAdmin.emptyTitle")}
              description={t("clinicAdmin.emptyDesc")}
            />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("clinicAdmin.colPatient")}</TableHead>
                    <TableHead>{t("clinicAdmin.colService")}</TableHead>
                    <TableHead>{t("clinicAdmin.colDateTime")}</TableHead>
                    <TableHead>{t("clinicAdmin.colRef")}</TableHead>
                    <TableHead>{t("clinicAdmin.colStatus")}</TableHead>
                    <TableHead className="text-right">{t("clinicAdmin.colActions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.map((b) => (
                    <TableRow key={b.bookingId}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-medium">{b.patientName ?? "—"}</span>
                        </div>
                        {b.patientEmail && (
                          <p className="text-xs text-muted-foreground">{b.patientEmail}</p>
                        )}
                      </TableCell>
                      <TableCell>{b.serviceName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                          {b.date}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {b.time}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{b.bookingId}</TableCell>
                      <TableCell>
                        <StatusBadge status={b.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {b.status !== "completed" && (
                              <DropdownMenuItem
                                onClick={() => handleStatus(b.bookingId, "completed")}
                              >
                                <CheckCircle2 className="mr-2 h-4 w-4 text-success" />
                                {t("clinicAdmin.actionComplete")}
                              </DropdownMenuItem>
                            )}
                            {b.status !== "cancelled" && (
                              <DropdownMenuItem
                                onClick={() => handleStatus(b.bookingId, "cancelled")}
                              >
                                <XCircle className="mr-2 h-4 w-4 text-destructive" />
                                {t("clinicAdmin.actionCancel")}
                              </DropdownMenuItem>
                            )}
                            {b.status !== "upcoming" && (
                              <DropdownMenuItem
                                onClick={() => handleStatus(b.bookingId, "upcoming")}
                              >
                                <RotateCcw className="mr-2 h-4 w-4" />
                                {t("clinicAdmin.actionReopen")}
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}

function StatusBadge({ status }: { status: Booking["status"] }) {
  const { t } = useTranslation();
  if (status === "completed")
    return (
      <Badge className="bg-muted text-muted-foreground hover:bg-muted">
        {t("clinicAdmin.statusCompleted")}
      </Badge>
    );
  if (status === "cancelled")
    return <Badge variant="destructive">{t("clinicAdmin.statusCancelled")}</Badge>;
  return (
    <Badge className="bg-success text-success-foreground hover:bg-success">
      {t("clinicAdmin.statusUpcoming")}
    </Badge>
  );
}

function PlatformAdminDashboard({ name }: { name: string }) {
  return (
    <>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/15">
              <ShieldCheck className="mr-1 h-3 w-3" /> Platform Admin
            </Badge>
          </div>
          <h1 className="text-3xl font-bold md:text-4xl">{name}</h1>
          <p className="mt-1 text-muted-foreground">
            Approval queue for clinics and services awaiting verification.
          </p>
        </div>
      </div>

      <Tabs defaultValue="clinics" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="clinics">Pending Clinics ({pendingClinics.length})</TabsTrigger>
          <TabsTrigger value="services">Pending Services ({pendingServices.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="clinics" className="space-y-3">
          {pendingClinics.map((c) => (
            <div
              key={c.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-5"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {c.category} · {c.location} · Submitted {c.submitted}
                  </p>
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
            <div
              key={s.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-5"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary">
                  <Stethoscope className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">{s.service}</p>
                  <p className="text-sm text-muted-foreground">
                    {s.clinicName} · ฿{s.price.toLocaleString()} · Submitted {s.submitted}
                  </p>
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
