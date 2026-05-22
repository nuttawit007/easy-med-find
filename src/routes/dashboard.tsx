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
  Phone,
  Mail,
  Globe,
  Lock,
  Unlock,
  FileText,
  Map,
  MapPin,
  Check,
  UserCheck,
  ShieldAlert,
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
import { type OpeningHoursEntry } from "@/lib/mock-data";
import { useClinics, updateClinicProfile, updateClinicServices } from "@/lib/clinics";
import { useAuth } from "@/lib/auth";
import {
  usePendingClinics,
  usePendingServices,
  approveClinic,
  rejectClinic,
  approveService,
  rejectService,
  resetPendingData,
  type EnhancedPendingClinic,
  type EnhancedPendingService,
} from "@/lib/admin-approvals";
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
    const mine = bookings.filter((b) => b.patientId === user?.id);
    const upcoming = mine.filter(isUpcoming);
    const history = mine.filter((b) => !isUpcoming(b));
    return { upcoming, history };
  }, [bookings, user?.id]);

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

  // Find clinic owned by the current user via ownerId
  const clinic = allClinics.find((c) => c.ownerId === user?.id);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [editProfile, setEditProfile] = useState({ name: clinic?.name ?? "", location: clinic?.location ?? "" });

  const [isContactOpen, setIsContactOpen] = useState(false);
  const defaultHours = (): OpeningHoursEntry[] =>
    ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => ({
      day,
      isOpen: day !== "Sunday",
      open: "09:00",
      close: "18:00",
    }));
  const [editContact, setEditContact] = useState({
    phone: clinic?.phone ?? "",
    email: clinic?.email ?? "",
    website: clinic?.website ?? "",
    openingHours: clinic?.openingHours ?? defaultHours(),
  });

  const [isServiceOpen, setIsServiceOpen] = useState(false);
  const [editService, setEditService] = useState<{
    id?: string;
    name: string;
    price: string;
    duration: string;
  } | null>(null);

  const handleSaveProfile = () => {
    if (!clinic) return;
    updateClinicProfile(clinic.id, { name: editProfile.name, location: editProfile.location });
    setIsProfileOpen(false);
    toast.success("Profile updated");
  };

  const handleSaveContact = () => {
    if (!clinic) return;
    updateClinicProfile(clinic.id, {
      phone: editContact.phone.trim() || undefined,
      email: editContact.email.trim() || undefined,
      website: editContact.website.trim() || undefined,
      openingHours: editContact.openingHours,
    });
    setIsContactOpen(false);
    toast.success("Contact & hours updated");
  };

  const updateHoursEntry = (index: number, patch: Partial<OpeningHoursEntry>) => {
    setEditContact((prev) => {
      const next = [...prev.openingHours];
      next[index] = { ...next[index], ...patch };
      return { ...prev, openingHours: next };
    });
  };

  const handleSaveService = () => {
    if (!editService || !editService.name || !editService.price || !editService.duration) {
      toast.error("Please fill in all fields");
      return;
    }
    if (!clinic) return;
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
    if (!clinic) return;
    const nextServices = clinic.services.filter((s) => s.name !== serviceName);
    updateClinicServices(clinic.id, nextServices);
    toast.success("Service removed");
  };

  const appointments = useMemo(() => {
    if (!user || !clinic) return [] as Booking[];
    return allBookings.filter((b) => b.clinicId === clinic.id);
  }, [allBookings, user, clinic?.id]);

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

  // No clinic matched this user — show empty state
  if (!clinic) {
    return (
      <EmptyState
        title="No clinic linked to your account"
        description="Your account is not linked to any clinic yet. Contact the platform admin to get set up."
      />
    );
  }

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
              <Button
                variant="outline"
                onClick={() => {
                  setEditContact({
                    phone: clinic.phone ?? "",
                    email: clinic.email ?? "",
                    website: clinic.website ?? "",
                    openingHours: clinic.openingHours ?? defaultHours(),
                  });
                  setIsContactOpen(true);
                }}
              >
                <Pencil className="mr-2 h-4 w-4" /> Update contact & hours
              </Button>

              {/* Contact & Hours Dialog */}
              <Dialog open={isContactOpen} onOpenChange={setIsContactOpen}>
                <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Contact & Opening Hours</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-5 py-2">
                    {/* Contact */}
                    <div className="space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Contact</p>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> Phone</Label>
                        <Input
                          placeholder="+66 2 000 0000"
                          value={editContact.phone}
                          onChange={(e) => setEditContact((p) => ({ ...p, phone: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> Email</Label>
                        <Input
                          type="email"
                          placeholder="hello@clinic.com"
                          value={editContact.email}
                          onChange={(e) => setEditContact((p) => ({ ...p, email: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5" /> Website</Label>
                        <Input
                          placeholder="https://clinic.com"
                          value={editContact.website}
                          onChange={(e) => setEditContact((p) => ({ ...p, website: e.target.value }))}
                        />
                      </div>
                    </div>

                    {/* Opening Hours */}
                    <div className="space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Opening Hours</p>
                      <div className="space-y-2">
                        {editContact.openingHours.map((entry, i) => (
                          <div key={entry.day} className="grid grid-cols-[80px_1fr] items-center gap-2">
                            <button
                              type="button"
                              onClick={() => updateHoursEntry(i, { isOpen: !entry.isOpen })}
                              className={`rounded-lg border px-2 py-1 text-xs font-medium transition ${
                                entry.isOpen
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border bg-muted text-muted-foreground"
                              }`}
                            >
                              {entry.day.slice(0, 3)}
                            </button>
                            {entry.isOpen ? (
                              <div className="flex items-center gap-1">
                                <Input
                                  type="time"
                                  value={entry.open}
                                  className="h-8 px-2 text-xs"
                                  onChange={(e) => updateHoursEntry(i, { open: e.target.value })}
                                />
                                <span className="text-xs text-muted-foreground">–</span>
                                <Input
                                  type="time"
                                  value={entry.close}
                                  className="h-8 px-2 text-xs"
                                  onChange={(e) => updateHoursEntry(i, { close: e.target.value })}
                                />
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">Closed</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsContactOpen(false)}>Cancel</Button>
                    <Button onClick={handleSaveContact}>Save changes</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
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
  const { t } = useTranslation();
  const pendingClinics = usePendingClinics();
  const pendingServices = usePendingServices();
  const allClinics = useClinics();

  const [selectedClinic, setSelectedClinic] = useState<EnhancedPendingClinic | null>(null);

  // Verification Checklist State
  const [checklist, setChecklist] = useState({
    licenseValid: false,
    addressVerified: false,
    ownerIdentified: false,
  });

  // Reset checklist when selected clinic changes
  useEffect(() => {
    if (selectedClinic) {
      setChecklist({
        licenseValid: false,
        addressVerified: false,
        ownerIdentified: false,
      });
    }
  }, [selectedClinic]);

  const allChecked = checklist.licenseValid && checklist.addressVerified && checklist.ownerIdentified;

  const handleApproveClinic = (id: string) => {
    approveClinic(id);
    setSelectedClinic(null);
    toast.success(t("platformAdmin.toastApproveClinic"), {
      description: t("platformAdmin.toastApproveClinicDesc"),
    });
  };

  const handleRejectClinic = (id: string) => {
    rejectClinic(id);
    setSelectedClinic(null);
    toast.error(t("platformAdmin.toastRejectClinic"), {
      description: t("platformAdmin.toastRejectClinicDesc"),
    });
  };

  const handleApproveService = (id: string) => {
    const success = approveService(id, allClinics);
    if (success) {
      toast.success(t("platformAdmin.toastApproveService"));
    } else {
      toast.error("Failed to approve service. Clinic not found.");
    }
  };

  const handleRejectService = (id: string) => {
    rejectService(id);
    toast.error(t("platformAdmin.toastRejectService"));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Control Center Header */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-secondary/20 p-6 md:p-8 shadow-glow">
        <div className="absolute top-0 right-0 h-40 w-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 z-10">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Badge className="bg-primary/10 text-primary hover:bg-primary/15 border-none font-bold text-xs px-2.5 py-1 rounded-full uppercase tracking-wider">
                <ShieldCheck className="mr-1 h-3.5 w-3.5" /> {t("platformAdmin.badge")}
              </Badge>
              <span className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-widest animate-pulse">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> {t("platformAdmin.liveAuditNode")}
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-foreground md:text-4xl">{t("platformAdmin.controlCenter")}</h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-xl leading-relaxed">
              {t("platformAdmin.subtitle")}
            </p>
          </div>
          
          {/* Quick Metrics & Controls */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex gap-4">
              <div className="rounded-2xl border border-border bg-card p-4 text-center min-w-[100px] shadow-sm">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t("platformAdmin.pendingClinics")}</p>
                <p className="text-2xl font-black text-primary mt-1">{pendingClinics.length}</p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-4 text-center min-w-[100px] shadow-sm">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t("platformAdmin.pendingServices")}</p>
                <p className="text-2xl font-black text-secondary mt-1">{pendingServices.length}</p>
              </div>
            </div>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                resetPendingData();
                toast.success(t("platformAdmin.toastResetMock"));
              }}
              className="border-dashed border-primary/30 hover:border-primary/60 hover:bg-primary/5 text-primary font-bold text-xs px-4 py-5 rounded-2xl flex items-center gap-1.5 self-stretch justify-center"
            >
              <RotateCcw className="h-4 w-4" /> {t("platformAdmin.btnResetMock")}
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs Layout */}
      <Tabs defaultValue="clinics" className="w-full">
        <TabsList className="grid grid-cols-2 max-w-md bg-muted/65 p-1 rounded-2xl mb-8 border border-border/40">
          <TabsTrigger value="clinics" className="rounded-xl font-bold py-2.5 text-xs tracking-wide">
            {t("platformAdmin.tabClinics", { count: pendingClinics.length })}
          </TabsTrigger>
          <TabsTrigger value="services" className="rounded-xl font-bold py-2.5 text-xs tracking-wide">
            {t("platformAdmin.tabServices", { count: pendingServices.length })}
          </TabsTrigger>
        </TabsList>

        {/* Clinics Tab */}
        <TabsContent value="clinics" className="space-y-4 outline-none">
          {pendingClinics.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-12 rounded-3xl border border-dashed border-border/80 bg-card/50">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-4">
                <Building2 className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-foreground">{t("platformAdmin.emptyClinicsTitle")}</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">{t("platformAdmin.emptyClinicsDesc")}</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {pendingClinics.map((c) => (
                <div
                  key={c.id}
                  className="group flex items-center justify-between gap-4 rounded-3xl border border-border/80 bg-card p-5 shadow-sm hover:shadow-md hover:border-primary/30 transition duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 text-primary group-hover:scale-105 transition duration-300">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-extrabold text-foreground group-hover:text-primary transition duration-200">{c.name}</p>
                      <p className="text-xs text-muted-foreground mt-1 flex flex-wrap items-center gap-1.5 font-medium">
                        <span className="text-secondary font-bold">{c.category}</span>
                        <span>•</span>
                        <span>{c.location}</span>
                        <span>•</span>
                        <span className="text-[10px] text-muted-foreground/80">{c.submitted}</span>
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setSelectedClinic(c)}
                    className="shrink-0 bg-primary/5 hover:bg-primary text-primary hover:text-white font-bold text-xs px-4 py-4 rounded-xl border border-primary/10 shadow-none transition duration-200"
                  >
                    {t("platformAdmin.btnPerformAudit")}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-4 outline-none">
          {pendingServices.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-12 rounded-3xl border border-dashed border-border/80 bg-card/50">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-4">
                <Stethoscope className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-foreground">{t("platformAdmin.emptyServicesTitle")}</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">{t("platformAdmin.emptyServicesDesc")}</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {pendingServices.map((s) => (
                <div
                  key={s.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-border/80 bg-card p-5 shadow-sm hover:shadow-md transition duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary/15 to-primary/10 text-secondary">
                      <Stethoscope className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-extrabold text-foreground">{s.service}</p>
                      <p className="text-xs text-muted-foreground mt-1.5 flex flex-wrap items-center gap-2 font-semibold">
                        <span className="text-primary font-black">฿{s.price.toLocaleString()}</span>
                        <span className="text-muted-foreground/60">•</span>
                        <span className="bg-muted px-2 py-0.5 rounded text-[10px] font-bold text-foreground">{s.clinicName}</span>
                        <span className="text-muted-foreground/60">•</span>
                        <span className="text-[10px] text-muted-foreground/70 font-medium">Submitted {s.submitted}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRejectService(s.id)}
                      className="border-destructive/20 text-destructive hover:bg-destructive/10 font-bold text-xs px-4 py-4 rounded-xl"
                    >
                      <XCircle className="mr-1 h-4 w-4" /> {t("platformAdmin.btnReject")}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleApproveService(s.id)}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-4 py-4 rounded-xl border-none shadow-sm shadow-emerald-500/10"
                    >
                      <CheckCircle2 className="mr-1 h-4 w-4" /> {t("platformAdmin.btnApprove")}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* DETAILED CLINIC AUDIT DIALOG */}
      <Dialog open={!!selectedClinic} onOpenChange={(open) => !open && setSelectedClinic(null)}>
        <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto p-0 rounded-3xl border border-border bg-card shadow-glow animate-in zoom-in-95 duration-200">
          {selectedClinic && (
            <div>
              {/* Cover Banner */}
              <div className="relative h-28 bg-gradient-to-br from-primary via-primary/90 to-secondary/80 p-6 text-white flex items-end">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
                <div className="relative flex items-center gap-4 z-10">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-primary shadow-glow">
                    <Building2 className="h-7 w-7" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black leading-none">{selectedClinic.name}</h2>
                    <p className="text-xs text-white/80 mt-1 flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> {selectedClinic.location}
                    </p>
                  </div>
                </div>
                <Badge className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white border-none font-bold text-[10px]">
                  VERIFICATION STAGE
                </Badge>
              </div>

              <div className="grid gap-6 p-6 md:grid-cols-2">
                {/* Left Side: Document Details */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5">
                      <FileText className="h-4 w-4 text-primary" /> {t("platformAdmin.dossierTitle")}
                    </h3>
                    <div className="rounded-2xl border border-border bg-muted/30 p-4 space-y-3">
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">{t("platformAdmin.licenseId")}</p>
                        <p className="text-sm font-mono font-bold text-foreground flex items-center justify-between mt-0.5">
                          {selectedClinic.licenseNumber}
                          <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded uppercase tracking-wider">{t("platformAdmin.healthMinistryRegistered")}</span>
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">{t("platformAdmin.registeredCorp")}</p>
                        <p className="text-xs font-semibold text-foreground mt-0.5">{selectedClinic.registeredCompanyName}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-border/50">
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase">{t("platformAdmin.incorporation")}</p>
                          <p className="text-xs font-medium text-foreground mt-0.5">{selectedClinic.registeredDate}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase">{t("platformAdmin.category")}</p>
                          <p className="text-xs font-bold text-secondary mt-0.5">{selectedClinic.category}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5">
                      <Map className="h-4 w-4 text-primary" /> {t("platformAdmin.geospatialTitle")}
                    </h3>
                    <div className="rounded-2xl border border-border bg-muted/30 p-4 space-y-3">
                      {/* SVG Radar Map representation */}
                      <div className="relative overflow-hidden rounded-xl border border-border/80 bg-black/45 p-2 flex items-center justify-center">
                        <svg className="w-full h-24 rounded-lg overflow-hidden" viewBox="0 0 100 100">
                          <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
                          <line x1="50" y1="0" x2="50" y2="100" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
                          <circle cx="50" cy="50" r="20" fill="none" stroke="rgba(59,130,246,0.1)" strokeWidth="0.5" />
                          <circle cx="50" cy="50" r="35" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                          <circle cx="50" cy="50" r="4" fill="currentColor" className="text-primary animate-pulse" />
                          <circle cx="45" cy="35" r="2.5" fill="currentColor" className="text-secondary" />
                        </svg>
                        <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded text-[9px] font-mono text-emerald-400 font-bold border border-emerald-500/20">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> {t("platformAdmin.matchPerfect")}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">{t("platformAdmin.gpsCoordinates")}</p>
                        <p className="text-xs font-mono font-medium text-foreground mt-0.5">{selectedClinic.mapCoordinates}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side: Identity Check & Approval Audit */}
                <div className="flex flex-col justify-between gap-5">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5">
                        <UserCheck className="h-4 w-4 text-primary" /> {t("platformAdmin.ownerTitle")}
                      </h3>
                      <div className="rounded-2xl border border-border bg-muted/30 p-4 space-y-2.5">
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase">{t("platformAdmin.ownerName")}</p>
                          <p className="text-xs font-extrabold text-foreground mt-0.5">{selectedClinic.ownerName}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs pt-1.5 border-t border-border/50">
                          <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">{t("platformAdmin.ownerPhone")}</p>
                            <p className="font-semibold text-foreground truncate mt-0.5">{selectedClinic.ownerPhone}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">{t("platformAdmin.ownerEmail")}</p>
                            <p className="font-semibold text-foreground truncate mt-0.5">{selectedClinic.ownerEmail}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* INTERACTIVE CHECKLIST */}
                    <div>
                      <h3 className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground mb-2">
                        {t("platformAdmin.checklistTitle")}
                      </h3>
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={() => setChecklist(prev => ({ ...prev, licenseValid: !prev.licenseValid }))}
                          className={`w-full flex items-center justify-between rounded-xl border p-3 text-left transition ${
                            checklist.licenseValid 
                              ? "bg-emerald-500/10 border-emerald-500/30 text-foreground animate-none" 
                              : "bg-card border-border hover:border-primary/45 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <div className="flex gap-2.5 items-center">
                            <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded transition ${
                              checklist.licenseValid ? "bg-emerald-500 text-white" : "border border-border bg-muted"
                            }`}>
                              {checklist.licenseValid && <Check className="h-3.5 w-3.5" />}
                            </span>
                            <div>
                              <p className="text-xs font-bold text-foreground">{t("platformAdmin.checklistLicense")}</p>
                              <p className="text-[9px] text-muted-foreground mt-0.5">{t("platformAdmin.checklistLicenseSub")}</p>
                            </div>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setChecklist(prev => ({ ...prev, addressVerified: !prev.addressVerified }))}
                          className={`w-full flex items-center justify-between rounded-xl border p-3 text-left transition ${
                            checklist.addressVerified 
                              ? "bg-emerald-500/10 border-emerald-500/30 text-foreground" 
                              : "bg-card border-border hover:border-primary/45 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <div className="flex gap-2.5 items-center">
                            <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded transition ${
                              checklist.addressVerified ? "bg-emerald-500 text-white" : "border border-border bg-muted"
                            }`}>
                              {checklist.addressVerified && <Check className="h-3.5 w-3.5" />}
                            </span>
                            <div>
                              <p className="text-xs font-bold text-foreground">{t("platformAdmin.checklistGeospatial")}</p>
                              <p className="text-[9px] text-muted-foreground mt-0.5">{t("platformAdmin.checklistGeospatialSub")}</p>
                            </div>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setChecklist(prev => ({ ...prev, ownerIdentified: !prev.ownerIdentified }))}
                          className={`w-full flex items-center justify-between rounded-xl border p-3 text-left transition ${
                            checklist.ownerIdentified 
                              ? "bg-emerald-500/10 border-emerald-500/30 text-foreground" 
                              : "bg-card border-border hover:border-primary/45 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <div className="flex gap-2.5 items-center">
                            <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded transition ${
                              checklist.ownerIdentified ? "bg-emerald-500 text-white" : "border border-border bg-muted"
                            }`}>
                              {checklist.ownerIdentified && <Check className="h-3.5 w-3.5" />}
                            </span>
                            <div>
                              <p className="text-xs font-bold text-foreground">{t("platformAdmin.checklistKyc")}</p>
                              <p className="text-[9px] text-muted-foreground mt-0.5">{t("platformAdmin.checklistKycSub")}</p>
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-4 border-t border-border/60 flex items-center gap-3">
                    <Button
                      variant="outline"
                      onClick={() => handleRejectClinic(selectedClinic.id)}
                      className="flex-1 text-destructive hover:bg-destructive/10 text-xs py-5 rounded-xl font-bold border-destructive/20"
                    >
                      {t("platformAdmin.btnDeclineLicense")}
                    </Button>
                    <Button
                      disabled={!allChecked}
                      onClick={() => handleApproveClinic(selectedClinic.id)}
                      className={`flex-1 py-5 rounded-xl font-bold text-xs shadow-glow transition duration-300 ${
                        allChecked 
                          ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-none shadow-emerald-500/20" 
                          : "bg-muted text-muted-foreground border-border hover:bg-muted"
                      }`}
                    >
                      {allChecked ? (
                        <span className="flex items-center justify-center gap-1">
                          <Unlock className="h-4 w-4" /> {t("platformAdmin.btnVerifyPublish")}
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-1 text-muted-foreground/60">
                          <Lock className="h-4 w-4" /> {t("platformAdmin.btnLocked", { count: [checklist.licenseValid, checklist.addressVerified, checklist.ownerIdentified].filter(Boolean).length })}
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
