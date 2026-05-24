import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, useCallback } from "react";
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
  User,
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
  Send,
  AlertTriangle,
  Clock4,
  ClipboardCheck,
  FileCheck2,
  Landmark,
  Star,
  UploadCloud,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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
import { type OpeningHoursEntry, CATEGORIES } from "@/lib/mock-data";
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
import {
  useMyClinicRegistration,
  submitClinicRegistration,
  clearRejectedRegistration,
  type ClinicRegistrationFormData,
} from "@/lib/clinic-registration";
import { addPendingClinicFromRegistration } from "@/lib/admin-approvals";

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

type PatientSection = "appointments" | "history" | "rewards" | "profile";

function PatientDashboard({ name }: { name: string }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const bookings = useBookings();
  const points = useLoyaltyPoints(user?.id) ?? 0;
  const nextTier = 1000;
  const [activeSection, setActiveSection] = useState<PatientSection>("appointments");

  const { upcoming, history } = useMemo(() => {
    const mine = bookings.filter((b) => b.patientId === user?.id);
    const upcoming = mine.filter(isUpcoming);
    const history = mine.filter((b) => !isUpcoming(b));
    return { upcoming, history };
  }, [bookings, user?.id]);

  const navItems: {
    id: PatientSection;
    icon: React.ElementType;
    labelKey: string;
    badge?: number;
  }[] = [
    {
      id: "appointments",
      icon: CalendarDays,
      labelKey: "dashboard.navAppointments",
      badge: upcoming.length || undefined,
    },
    { id: "history", icon: Clock, labelKey: "dashboard.navHistory" },
    { id: "rewards", icon: Trophy, labelKey: "dashboard.navRewards" },
    { id: "profile", icon: User, labelKey: "dashboard.navProfile" },
  ];

  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-start">
      {/* ── Sidebar / mobile top nav ── */}
      <aside className="md:w-56 md:shrink-0">
        {/* User card — desktop only */}
        <div className="mb-3 hidden overflow-hidden rounded-2xl border border-border/60 bg-card p-4 shadow-soft md:block">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground shadow-glow">
              {name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate font-bold">{name}</p>
              <p className="truncate text-xs text-muted-foreground">{t("auth.rolePatient")}</p>
            </div>
          </div>
          {/* Mini loyalty chip */}
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-primary/20 bg-primary-soft px-3 py-2">
            <Trophy className="h-3.5 w-3.5 text-primary" />
            <span className="text-sm font-bold text-primary">{points}</span>
            <span className="text-xs text-muted-foreground">{t("loyalty.points")}</span>
          </div>
        </div>

        {/* Nav items — horizontal scroll on mobile, vertical on desktop */}
        <nav className="flex gap-1.5 overflow-x-auto pb-1 md:flex-col md:overflow-visible md:pb-0">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex shrink-0 cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold
                  transition-all duration-150 md:w-full
                  ${
                    isActive
                      ? "bg-primary/10 text-primary font-semibold border border-primary/25"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="whitespace-nowrap">{t(item.labelKey)}</span>
                {item.badge && item.badge > 0 ? (
                  <span
                    className={`ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-bold
                      ${isActive ? "bg-primary text-primary-foreground" : "bg-primary/80 text-primary-foreground"}`}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ── Main content area ── */}
      <div className="min-w-0 flex-1 space-y-5">
        {/* ── Appointments ── */}
        {activeSection === "appointments" && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">{t("dashboard.navAppointments")}</h2>
                <p className="text-sm text-muted-foreground">
                  Hi, {name} 👋 — {t("dashboard.subtitle")}
                </p>
              </div>
              <Button
                asChild
                size="sm"
                className="cursor-pointer rounded-xl font-semibold shadow-soft"
              >
                <Link to="/">{t("dashboard.bookVisit")}</Link>
              </Button>
            </div>
            <div className="space-y-4">
              {upcoming.length === 0 ? (
                <EmptyTicketState
                  title={t("dashboard.emptyUpcomingTitle")}
                  description={t("dashboard.emptyUpcomingDesc")}
                  action={
                    <Button
                      asChild
                      className="cursor-pointer rounded-2xl font-semibold shadow-soft"
                    >
                      <Link to="/">{t("dashboard.discoverClinics")}</Link>
                    </Button>
                  }
                />
              ) : (
                upcoming.map((b) => <BookingTicketCard key={b.bookingId} booking={b} />)
              )}
            </div>
          </>
        )}

        {/* ── History ── */}
        {activeSection === "history" && (
          <>
            <div>
              <h2 className="text-xl font-bold">{t("dashboard.navHistory")}</h2>
              <p className="text-sm text-muted-foreground">{t("dashboard.tabHistory")}</p>
            </div>
            <div className="space-y-4">
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
            </div>
          </>
        )}

        {/* ── Rewards ── */}
        {activeSection === "rewards" && (
          <>
            <div>
              <h2 className="text-xl font-bold">{t("dashboard.navRewards")}</h2>
              <p className="text-sm text-muted-foreground">{t("loyalty.myRewards")}</p>
            </div>

            {/* Loyalty progress card */}
            <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary-soft to-secondary/40 p-6 shadow-soft">
              <div className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-primary/8 blur-2xl" />
              <div className="relative flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-glow">
                  <Trophy className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("dashboard.loyaltyBalance")}
                  </p>
                  <p className="text-3xl font-extrabold text-foreground">
                    {points} {t("loyalty.points")}
                  </p>
                </div>
              </div>
              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-muted-foreground">
                    {t("dashboard.progressToGold")}
                  </span>
                  <span className="font-bold">
                    {points} / {nextTier}
                  </span>
                </div>
                <Progress value={(points / nextTier) * 100} className="h-2.5 rounded-full" />
                <p className="mt-2 text-xs text-muted-foreground">
                  {t("dashboard.earnMorePoints", { count: nextTier - points })}
                </p>
              </div>
            </div>

            {/* Rewards grid */}
            <div className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  { titleKey: "loyalty.rewardVoucher", cost: 500, emoji: "🎟️" },
                  { titleKey: "loyalty.rewardFacial", cost: 800, emoji: "✨" },
                  { titleKey: "loyalty.rewardBirthday", cost: 1000, emoji: "🎂" },
                ] as const
              ).map((r) => (
                <div
                  key={r.titleKey}
                  className="group flex cursor-pointer items-center justify-between rounded-2xl border border-border/60 bg-card p-4 transition-all duration-200 hover:border-primary/30 hover:bg-primary/5 hover:shadow-soft"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-soft text-xl transition-colors group-hover:bg-primary/15">
                      {r.emoji}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground transition-colors group-hover:text-primary">
                        {t(r.titleKey)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {r.cost} {t("loyalty.ptsRequired")}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    disabled={points < r.cost}
                    variant={points >= r.cost ? "default" : "outline"}
                    className={`cursor-pointer rounded-xl font-semibold ${points >= r.cost ? "shadow-soft" : ""}`}
                  >
                    {t("loyalty.redeem")}
                  </Button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Profile ── */}
        {activeSection === "profile" && (
          <>
            <div>
              <h2 className="text-xl font-bold">{t("dashboard.navProfile")}</h2>
              <p className="text-sm text-muted-foreground">{t("dashboard.profileSubtitle")}</p>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card shadow-soft">
              {/* Avatar banner */}
              <div className="flex items-center gap-4 border-b border-border/60 p-5">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground shadow-glow">
                  {name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-lg font-bold">{name}</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>

              {/* Info rows */}
              <div className="divide-y divide-border/60">
                <ProfileRow label={t("auth.email")} value={user?.email ?? "—"} />
                <ProfileRow label={t("dashboard.profileRole")} value={t("auth.rolePatient")} />
                <ProfileRow
                  label={t("dashboard.profileLoyalty")}
                  value={`${points} ${t("loyalty.points")}`}
                  highlight
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ProfileRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-semibold ${highlight ? "text-primary" : "text-foreground"}`}>
        {value}
      </span>
    </div>
  );
}

type ClinicSection = "appointments" | "profile" | "services" | "account";

function ClinicAdminDashboard({ name }: { name: string }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const allBookings = useBookings();
  const allClinics = useClinics();

  // Find clinic owned by the current user via ownerId
  const clinic = allClinics.find((c) => c.ownerId === user?.id);

  // Check registration status for clinic managers without a linked clinic
  const myRegistration = useMyClinicRegistration(user?.id);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [editProfile, setEditProfile] = useState({
    name: clinic?.name ?? "",
    location: clinic?.location ?? "",
  });

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
  const [activeClinicSection, setActiveClinicSection] = useState<ClinicSection>("appointments");

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

  // No clinic matched this user — check registration status
  if (!clinic) {
    // Pending registration — show waiting page
    if (myRegistration?.status === "pending") {
      return <PendingApprovalStatus registration={myRegistration} />;
    }
    // Rejected registration — show rejection notice with resubmit
    if (myRegistration?.status === "rejected") {
      return <RejectedRegistrationStatus userId={user?.id ?? ""} registration={myRegistration} />;
    }
    // No registration at all — show registration form
    return <ClinicRegistrationForm userId={user?.id ?? ""} userName={name} />;
  }

  const clinicNavItems: {
    id: ClinicSection;
    icon: React.ElementType;
    labelKey: string;
    badge?: number;
  }[] = [
    {
      id: "appointments",
      icon: CalendarDays,
      labelKey: "clinicAdmin.navAppointments",
      badge: appointments.length || undefined,
    },
    { id: "profile", icon: Building2, labelKey: "clinicAdmin.navProfile" },
    { id: "services", icon: Stethoscope, labelKey: "clinicAdmin.navServices" },
    { id: "account", icon: User, labelKey: "clinicAdmin.navAccount" },
  ];

  return (
    <>
      {/* ── Service Add/Edit Dialog ── */}
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
                onChange={(e) => setEditService((s) => (s ? { ...s, name: e.target.value } : null))}
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

      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        {/* ── Sidebar ── */}
        <aside className="md:w-56 md:shrink-0">
          {/* Clinic card — desktop only */}
          <div className="mb-3 hidden overflow-hidden rounded-2xl border border-border/60 bg-card p-4 shadow-soft md:block">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground shadow-soft">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate font-bold">{clinic.name}</p>
                <p className="truncate text-xs text-muted-foreground">{t("clinicAdmin.title")}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-secondary/20 bg-secondary/10 px-3 py-2">
              <CalendarDays className="h-3.5 w-3.5 text-secondary" />
              <span className="text-sm font-bold text-secondary">{appointments.length}</span>
              <span className="text-xs text-muted-foreground">
                {t("clinicAdmin.navAppointments")}
              </span>
            </div>
          </div>

          {/* Nav items */}
          <nav className="flex gap-1.5 overflow-x-auto pb-1 md:flex-col md:overflow-visible md:pb-0">
            {clinicNavItems.map((item) => {
              const isActive = activeClinicSection === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveClinicSection(item.id)}
                  className={`flex shrink-0 cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold
                    transition-all duration-150 md:w-full
                    ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-soft"
                        : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                    }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="whitespace-nowrap">{t(item.labelKey)}</span>
                  {item.badge && item.badge > 0 ? (
                    <span
                      className={`ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-bold
                        ${isActive ? "bg-white/25 text-white" : "bg-primary text-primary-foreground"}`}
                    >
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* ── Main content ── */}
        <div className="min-w-0 flex-1 space-y-5">
          {/* Profile section */}
          {activeClinicSection === "profile" && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold">{t("clinicAdmin.navProfile")}</h2>
                <p className="text-sm text-muted-foreground">{t("clinicAdmin.subtitle")}</p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-6 shadow-soft space-y-6">
                <h3 className="text-lg font-semibold">{t("clinicAdmin.editProfileTitle")}</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="clinicName">{t("clinicAdmin.clinicName")}</Label>
                      <Input
                        id="clinicName"
                        value={editProfile.name}
                        onChange={(e) => setEditProfile({ ...editProfile, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="clinicLocation">{t("clinicAdmin.locationAddress")}</Label>
                      <Textarea
                        id="clinicLocation"
                        value={editProfile.location}
                        onChange={(e) =>
                          setEditProfile({ ...editProfile, location: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>{t("clinicAdmin.profilePicture")}</Label>
                      <Input type="file" accept="image/*" />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("clinicAdmin.clinicGallery")}</Label>
                      <div className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-muted-foreground cursor-pointer hover:bg-muted/50 transition-colors">
                        <UploadCloud className="h-6 w-6 mb-2" />
                        <span className="text-xs text-center">{t("clinicAdmin.uploadPhotos")}</span>
                        <Input type="file" className="hidden" multiple accept="image/*" />
                      </div>
                    </div>
                  </div>
                </div>
                <Button onClick={handleSaveProfile}>{t("clinicAdmin.saveProfileChanges")}</Button>
              </div>

              <div className="rounded-2xl border border-border bg-card p-6 shadow-soft space-y-6">
                <h3 className="text-lg font-semibold">{t("clinicAdmin.contactHoursTitle")}</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5" /> {t("clinicAdmin.phone")}
                      </Label>
                      <Input
                        placeholder="+66 2 000 0000"
                        value={editContact.phone}
                        onChange={(e) => setEditContact((p) => ({ ...p, phone: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5" /> {t("clinicAdmin.email")}
                      </Label>
                      <Input
                        type="email"
                        placeholder="hello@clinic.com"
                        value={editContact.email}
                        onChange={(e) => setEditContact((p) => ({ ...p, email: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    {editContact.openingHours.map((entry, i) => (
                      <div
                        key={entry.day}
                        className="flex items-center justify-between p-2 border rounded-lg bg-muted/20"
                      >
                        <div className="flex items-center gap-3 w-1/3">
                          <Switch
                            id={`switch-${entry.day}`}
                            checked={entry.isOpen}
                            onCheckedChange={(checked) => updateHoursEntry(i, { isOpen: checked })}
                          />
                          <Label htmlFor={`switch-${entry.day}`} className="font-medium text-sm">
                            {entry.day.slice(0, 3)}
                          </Label>
                        </div>

                        <div className="flex items-center gap-2 w-2/3 justify-end">
                          {entry.isOpen ? (
                            <>
                              <Input
                                type="time"
                                value={entry.open}
                                className="w-28 h-8 text-xs"
                                onChange={(e) => updateHoursEntry(i, { open: e.target.value })}
                              />
                              <span className="text-muted-foreground">-</span>
                              <Input
                                type="time"
                                value={entry.close}
                                className="w-28 h-8 text-xs"
                                onChange={(e) => updateHoursEntry(i, { close: e.target.value })}
                              />
                            </>
                          ) : (
                            <span className="text-xs font-semibold text-muted-foreground w-[240px] text-center bg-muted/50 py-1.5 rounded">
                              {t("clinicAdmin.closed")}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <Button onClick={handleSaveContact}>{t("clinicAdmin.saveContactHours")}</Button>
              </div>
            </div>
          )}

          {/* Services */}
          {activeClinicSection === "services" && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold">{t("clinicAdmin.navServices")}</h2>
                  <p className="text-sm text-muted-foreground">{t("clinicAdmin.subtitle")}</p>
                </div>
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
              <div className="space-y-3">
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
              </div>
            </>
          )}

          {/* Appointments */}
          {activeClinicSection === "appointments" && (
            <>
              <div>
                <h2 className="text-xl font-bold">{t("clinicAdmin.navAppointments")}</h2>
                <p className="text-sm text-muted-foreground">{t("clinicAdmin.subtitle")}</p>
              </div>
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
            </>
          )}

          {/* Account */}
          {activeClinicSection === "account" && (
            <>
              <div>
                <h2 className="text-xl font-bold">{t("clinicAdmin.navAccount")}</h2>
                <p className="text-sm text-muted-foreground">{t("clinicAdmin.subtitle")}</p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-card shadow-soft">
                <div className="flex items-center gap-4 border-b border-border/60 p-5">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground text-2xl font-bold shadow-soft">
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-lg font-bold">{name}</p>
                    <Badge className="mt-1 bg-primary/10 text-primary hover:bg-primary/15">
                      {t("clinicAdmin.title")}
                    </Badge>
                  </div>
                </div>
                <div className="divide-y divide-border/60">
                  <ProfileRow label={t("clinicAdmin.navProfile")} value={clinic.name} />
                  <ProfileRow label={t("dashboard.profileRole")} value={t("clinicAdmin.title")} />
                  <ProfileRow
                    label={t("clinicAdmin.navAppointments")}
                    value={String(appointments.length)}
                    highlight
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
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

type AdminSection = "clinics" | "services";

function PlatformAdminDashboard({ name }: { name: string }) {
  const { t } = useTranslation();
  const pendingClinics = usePendingClinics();
  const pendingServices = usePendingServices();
  const allClinics = useClinics();

  const [selectedClinic, setSelectedClinic] = useState<EnhancedPendingClinic | null>(null);
  const [activeAdminSection, setActiveAdminSection] = useState<AdminSection>("clinics");

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

  const allChecked =
    checklist.licenseValid && checklist.addressVerified && checklist.ownerIdentified;

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

  const adminNavItems: {
    id: AdminSection;
    icon: React.ElementType;
    labelKey: string;
    badge?: number;
  }[] = [
    {
      id: "clinics",
      icon: Building2,
      labelKey: "platformAdmin.navClinics",
      badge: pendingClinics.length || undefined,
    },
    {
      id: "services",
      icon: Stethoscope,
      labelKey: "platformAdmin.navServices",
      badge: pendingServices.length || undefined,
    },
  ];

  return (
    <>
      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        {/* ── Sidebar ── */}
        <aside className="md:w-56 md:shrink-0">
          {/* Admin card — desktop only */}
          <div className="mb-3 hidden overflow-hidden rounded-2xl border border-border/60 bg-card p-4 shadow-soft md:block">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-glow">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate font-bold">{name}</p>
                <p className="truncate text-xs text-muted-foreground">{t("platformAdmin.badge")}</p>
              </div>
            </div>
            {/* Stats */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-primary/20 bg-primary-soft px-2 py-2 text-center">
                <p className="text-lg font-black text-primary">{pendingClinics.length}</p>
                <p className="text-[10px] font-semibold text-muted-foreground">คลินิก</p>
              </div>
              <div className="rounded-xl border border-secondary/20 bg-secondary/10 px-2 py-2 text-center">
                <p className="text-lg font-black text-secondary">{pendingServices.length}</p>
                <p className="text-[10px] font-semibold text-muted-foreground">บริการ</p>
              </div>
            </div>
          </div>

          {/* Nav items */}
          <nav className="flex gap-1.5 overflow-x-auto pb-1 md:flex-col md:overflow-visible md:pb-0">
            {adminNavItems.map((item) => {
              const isActive = activeAdminSection === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveAdminSection(item.id)}
                  className={`flex shrink-0 cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold
                    transition-all duration-150 md:w-full
                    ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-soft"
                        : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                    }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="whitespace-nowrap">{t(item.labelKey)}</span>
                  {item.badge && item.badge > 0 ? (
                    <span
                      className={`ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-bold
                        ${isActive ? "bg-white/25 text-white" : "bg-primary text-primary-foreground"}`}
                    >
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>

          {/* Reset mock data */}
          <button
            onClick={() => {
              resetPendingData();
              toast.success(t("platformAdmin.toastResetMock"));
            }}
            className="mt-2 flex w-full cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border/60 px-3 py-2.5 text-xs font-semibold text-muted-foreground transition-all hover:border-primary/40 hover:text-primary md:w-full"
          >
            <RotateCcw className="h-3.5 w-3.5 shrink-0" />
            <span className="whitespace-nowrap">{t("platformAdmin.btnResetMock")}</span>
          </button>
        </aside>

        {/* ── Main content ── */}
        <div className="min-w-0 flex-1 space-y-5">
          {/* live node badge */}
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold">
              {activeAdminSection === "clinics"
                ? t("platformAdmin.navClinics")
                : t("platformAdmin.navServices")}
            </h2>
            <span className="flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-500">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />{" "}
              {t("platformAdmin.liveAuditNode")}
            </span>
          </div>

          {/* Clinics section */}
          {activeAdminSection === "clinics" && (
            <div className="space-y-4">
              {pendingClinics.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center p-12 rounded-3xl border border-dashed border-border/80 bg-card/50">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-4">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-bold text-foreground">
                    {t("platformAdmin.emptyClinicsTitle")}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                    {t("platformAdmin.emptyClinicsDesc")}
                  </p>
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
                          <p className="font-extrabold text-foreground group-hover:text-primary transition duration-200">
                            {c.name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 flex flex-wrap items-center gap-1.5 font-medium">
                            <span className="text-secondary font-bold">{c.category}</span>
                            <span>•</span>
                            <span>{c.location}</span>
                            <span>•</span>
                            <span className="text-[10px] text-muted-foreground/80">
                              {c.submitted}
                            </span>
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
            </div>
          )}

          {/* Services section */}
          {activeAdminSection === "services" && (
            <div className="space-y-4">
              {pendingServices.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center p-12 rounded-3xl border border-dashed border-border/80 bg-card/50">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-4">
                    <Stethoscope className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-bold text-foreground">
                    {t("platformAdmin.emptyServicesTitle")}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                    {t("platformAdmin.emptyServicesDesc")}
                  </p>
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
                            <span className="text-primary font-black">
                              ฿{s.price.toLocaleString()}
                            </span>
                            <span className="text-muted-foreground/60">•</span>
                            <span className="bg-muted px-2 py-0.5 rounded text-[10px] font-bold text-foreground">
                              {s.clinicName}
                            </span>
                            <span className="text-muted-foreground/60">•</span>
                            <span className="text-[10px] text-muted-foreground/70 font-medium">
                              Submitted {s.submitted}
                            </span>
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
            </div>
          )}
        </div>
      </div>

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
                      <FileText className="h-4 w-4 text-primary" />{" "}
                      {t("platformAdmin.dossierTitle")}
                    </h3>
                    <div className="rounded-2xl border border-border bg-muted/30 p-4 space-y-3">
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">
                          {t("platformAdmin.licenseId")}
                        </p>
                        <p className="text-sm font-mono font-bold text-foreground flex items-center justify-between mt-0.5">
                          {selectedClinic.licenseNumber}
                          <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded uppercase tracking-wider">
                            {t("platformAdmin.healthMinistryRegistered")}
                          </span>
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">
                          {t("platformAdmin.registeredCorp")}
                        </p>
                        <p className="text-xs font-semibold text-foreground mt-0.5">
                          {selectedClinic.registeredCompanyName}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-border/50">
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase">
                            {t("platformAdmin.incorporation")}
                          </p>
                          <p className="text-xs font-medium text-foreground mt-0.5">
                            {selectedClinic.registeredDate}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase">
                            {t("platformAdmin.category")}
                          </p>
                          <p className="text-xs font-bold text-secondary mt-0.5">
                            {selectedClinic.category}
                          </p>
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
                        <svg
                          className="w-full h-24 rounded-lg overflow-hidden"
                          viewBox="0 0 100 100"
                        >
                          <line
                            x1="0"
                            y1="50"
                            x2="100"
                            y2="50"
                            stroke="rgba(255,255,255,0.06)"
                            strokeWidth="0.5"
                          />
                          <line
                            x1="50"
                            y1="0"
                            x2="50"
                            y2="100"
                            stroke="rgba(255,255,255,0.06)"
                            strokeWidth="0.5"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="20"
                            fill="none"
                            stroke="rgba(59,130,246,0.1)"
                            strokeWidth="0.5"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="35"
                            fill="none"
                            stroke="rgba(255,255,255,0.03)"
                            strokeWidth="0.5"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="4"
                            fill="currentColor"
                            className="text-primary animate-pulse"
                          />
                          <circle
                            cx="45"
                            cy="35"
                            r="2.5"
                            fill="currentColor"
                            className="text-secondary"
                          />
                        </svg>
                        <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded text-[9px] font-mono text-emerald-400 font-bold border border-emerald-500/20">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />{" "}
                          {t("platformAdmin.matchPerfect")}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">
                          {t("platformAdmin.gpsCoordinates")}
                        </p>
                        <p className="text-xs font-mono font-medium text-foreground mt-0.5">
                          {selectedClinic.mapCoordinates}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side: Identity Check & Approval Audit */}
                <div className="flex flex-col justify-between gap-5">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5">
                        <UserCheck className="h-4 w-4 text-primary" />{" "}
                        {t("platformAdmin.ownerTitle")}
                      </h3>
                      <div className="rounded-2xl border border-border bg-muted/30 p-4 space-y-2.5">
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase">
                            {t("platformAdmin.ownerName")}
                          </p>
                          <p className="text-xs font-extrabold text-foreground mt-0.5">
                            {selectedClinic.ownerName}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs pt-1.5 border-t border-border/50">
                          <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">
                              {t("platformAdmin.ownerPhone")}
                            </p>
                            <p className="font-semibold text-foreground truncate mt-0.5">
                              {selectedClinic.ownerPhone}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">
                              {t("platformAdmin.ownerEmail")}
                            </p>
                            <p className="font-semibold text-foreground truncate mt-0.5">
                              {selectedClinic.ownerEmail}
                            </p>
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
                          onClick={() =>
                            setChecklist((prev) => ({ ...prev, licenseValid: !prev.licenseValid }))
                          }
                          className={`w-full flex items-center justify-between rounded-xl border p-3 text-left transition ${
                            checklist.licenseValid
                              ? "bg-emerald-500/10 border-emerald-500/30 text-foreground animate-none"
                              : "bg-card border-border hover:border-primary/45 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <div className="flex gap-2.5 items-center">
                            <span
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded transition ${
                                checklist.licenseValid
                                  ? "bg-emerald-500 text-white"
                                  : "border border-border bg-muted"
                              }`}
                            >
                              {checklist.licenseValid && <Check className="h-3.5 w-3.5" />}
                            </span>
                            <div>
                              <p className="text-xs font-bold text-foreground">
                                {t("platformAdmin.checklistLicense")}
                              </p>
                              <p className="text-[9px] text-muted-foreground mt-0.5">
                                {t("platformAdmin.checklistLicenseSub")}
                              </p>
                            </div>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setChecklist((prev) => ({
                              ...prev,
                              addressVerified: !prev.addressVerified,
                            }))
                          }
                          className={`w-full flex items-center justify-between rounded-xl border p-3 text-left transition ${
                            checklist.addressVerified
                              ? "bg-emerald-500/10 border-emerald-500/30 text-foreground"
                              : "bg-card border-border hover:border-primary/45 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <div className="flex gap-2.5 items-center">
                            <span
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded transition ${
                                checklist.addressVerified
                                  ? "bg-emerald-500 text-white"
                                  : "border border-border bg-muted"
                              }`}
                            >
                              {checklist.addressVerified && <Check className="h-3.5 w-3.5" />}
                            </span>
                            <div>
                              <p className="text-xs font-bold text-foreground">
                                {t("platformAdmin.checklistGeospatial")}
                              </p>
                              <p className="text-[9px] text-muted-foreground mt-0.5">
                                {t("platformAdmin.checklistGeospatialSub")}
                              </p>
                            </div>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setChecklist((prev) => ({
                              ...prev,
                              ownerIdentified: !prev.ownerIdentified,
                            }))
                          }
                          className={`w-full flex items-center justify-between rounded-xl border p-3 text-left transition ${
                            checklist.ownerIdentified
                              ? "bg-emerald-500/10 border-emerald-500/30 text-foreground"
                              : "bg-card border-border hover:border-primary/45 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <div className="flex gap-2.5 items-center">
                            <span
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded transition ${
                                checklist.ownerIdentified
                                  ? "bg-emerald-500 text-white"
                                  : "border border-border bg-muted"
                              }`}
                            >
                              {checklist.ownerIdentified && <Check className="h-3.5 w-3.5" />}
                            </span>
                            <div>
                              <p className="text-xs font-bold text-foreground">
                                {t("platformAdmin.checklistKyc")}
                              </p>
                              <p className="text-[9px] text-muted-foreground mt-0.5">
                                {t("platformAdmin.checklistKycSub")}
                              </p>
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
                          <Lock className="h-4 w-4" />{" "}
                          {t("platformAdmin.btnLocked", {
                            count: [
                              checklist.licenseValid,
                              checklist.addressVerified,
                              checklist.ownerIdentified,
                            ].filter(Boolean).length,
                          })}
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
    </>
  );
}

/* ─────────────────────────────────────────────────────────
   CLINIC REGISTRATION FORM
   Shown when a Clinic Manager logs in without a linked clinic
   and has no pending/rejected registration.
   ───────────────────────────────────────────────────────── */

function ClinicRegistrationForm({ userId, userName }: { userId: string; userName: string }) {
  const { t } = useTranslation();

  const emptyForm: ClinicRegistrationFormData = {
    name: "",
    category: "",
    location: "",
    description: "",
    licenseNumber: "",
    registeredCompanyName: "",
    registeredDate: "",
    mapCoordinates: "",
    ownerName: "",
    ownerPhone: "",
    ownerEmail: "",
  };

  const [form, setForm] = useState<ClinicRegistrationFormData>(emptyForm);

  const set = useCallback(
    (field: keyof ClinicRegistrationFormData, value: string) =>
      setForm((prev) => ({ ...prev, [field]: value })),
    [],
  );

  const handleSubmit = () => {
    // Validate required fields
    const required: (keyof ClinicRegistrationFormData)[] = [
      "name",
      "category",
      "location",
      "licenseNumber",
      "ownerName",
      "ownerPhone",
      "ownerEmail",
      "description",
      "registeredCompanyName",
      "registeredDate",
      "mapCoordinates",
    ];
    const missing = required.some((key) => !form[key]?.trim());
    if (missing) {
      toast.error(t("clinicRegistration.errFillRequired"));
      return;
    }

    // Submit registration
    const registration = submitClinicRegistration(form, userId);

    // Also push into admin pending queue
    const now = new Date();
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const submittedDate = `${monthNames[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;

    addPendingClinicFromRegistration(
      {
        name: form.name,
        category: form.category,
        location: form.location,
        licenseNumber: form.licenseNumber,
        ownerName: form.ownerName,
        ownerPhone: form.ownerPhone,
        ownerEmail: form.ownerEmail,
        description: form.description,
        mapCoordinates: form.mapCoordinates,
        registeredCompanyName: form.registeredCompanyName,
        registeredDate: form.registeredDate,
        submittedBy: userId,
      },
      submittedDate,
    );

    toast.success(t("clinicRegistration.toastSubmitted"), {
      description: t("clinicRegistration.toastSubmittedDesc"),
    });
  };

  const inputCls =
    "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm transition focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none placeholder:text-muted-foreground/50";
  const textareaCls =
    "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm transition focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none placeholder:text-muted-foreground/50 resize-none min-h-[80px]";
  const labelCls = "block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5";

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-primary/5 p-6 md:p-8 shadow-glow">
        <div className="absolute top-0 right-0 h-48 w-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="mb-2 flex items-center gap-2">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/15 border-none font-bold text-xs px-2.5 py-1 rounded-full uppercase tracking-wider">
              <Building2 className="mr-1 h-3.5 w-3.5" /> {t("clinicAdmin.title")}
            </Badge>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground md:text-4xl">
            {t("clinicRegistration.formTitle")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-xl leading-relaxed">
            {t("clinicRegistration.formSubtitle")}
          </p>
        </div>
      </div>

      {/* Form Sections */}
      <div className="space-y-6">
        {/* Section 1: Clinic Information */}
        <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground mb-5 flex items-center gap-1.5">
            <Building2 className="h-4 w-4 text-primary" />{" "}
            {t("clinicRegistration.sectionClinicInfo")}
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelCls}>{t("clinicRegistration.clinicName")} *</label>
              <input
                className={inputCls}
                placeholder={t("clinicRegistration.clinicNamePlaceholder")}
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>{t("clinicRegistration.category")} *</label>
              <select
                className={inputCls}
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
              >
                <option value="">{t("clinicRegistration.categoryPlaceholder")}</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="Wellness">Wellness</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className={labelCls}>{t("clinicRegistration.location")} *</label>
              <input
                className={inputCls}
                placeholder={t("clinicRegistration.locationPlaceholder")}
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelCls}>{t("clinicRegistration.description")} *</label>
              <textarea
                className={textareaCls}
                placeholder={t("clinicRegistration.descriptionPlaceholder")}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Legal & Registration Documents */}
        <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground mb-5 flex items-center gap-1.5">
            <Landmark className="h-4 w-4 text-primary" /> {t("clinicRegistration.sectionLegalDocs")}
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelCls}>{t("clinicRegistration.licenseNumber")} *</label>
              <input
                className={inputCls}
                placeholder={t("clinicRegistration.licenseNumberPlaceholder")}
                value={form.licenseNumber}
                onChange={(e) => set("licenseNumber", e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>{t("clinicRegistration.registeredCompanyName")} *</label>
              <input
                className={inputCls}
                placeholder={t("clinicRegistration.registeredCompanyNamePlaceholder")}
                value={form.registeredCompanyName}
                onChange={(e) => set("registeredCompanyName", e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>{t("clinicRegistration.registeredDate")} *</label>
              <input
                className={inputCls}
                placeholder={t("clinicRegistration.registeredDatePlaceholder")}
                value={form.registeredDate}
                onChange={(e) => set("registeredDate", e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>{t("clinicRegistration.mapCoordinates")} *</label>
              <input
                className={inputCls}
                placeholder={t("clinicRegistration.mapCoordinatesPlaceholder")}
                value={form.mapCoordinates}
                onChange={(e) => set("mapCoordinates", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Owner / Medical Director */}
        <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground mb-5 flex items-center gap-1.5">
            <UserCheck className="h-4 w-4 text-primary" />{" "}
            {t("clinicRegistration.sectionOwnerInfo")}
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className={labelCls}>{t("clinicRegistration.ownerName")} *</label>
              <input
                className={inputCls}
                placeholder={t("clinicRegistration.ownerNamePlaceholder")}
                value={form.ownerName}
                onChange={(e) => set("ownerName", e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>{t("clinicRegistration.ownerPhone")} *</label>
              <input
                className={inputCls}
                placeholder={t("clinicRegistration.ownerPhonePlaceholder")}
                value={form.ownerPhone}
                onChange={(e) => set("ownerPhone", e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>{t("clinicRegistration.ownerEmail")} *</label>
              <input
                className={inputCls}
                type="email"
                placeholder={t("clinicRegistration.ownerEmailPlaceholder")}
                value={form.ownerEmail}
                onChange={(e) => set("ownerEmail", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            size="lg"
            onClick={handleSubmit}
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-bold text-sm px-8 py-6 rounded-2xl shadow-glow transition duration-300"
          >
            <Send className="mr-2 h-5 w-5" /> {t("clinicRegistration.btnSubmit")}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   PENDING APPROVAL STATUS PAGE
   Shown when a Clinic Manager has submitted registration
   and is waiting for Admin verification.
   ───────────────────────────────────────────────────────── */

function PendingApprovalStatus({
  registration,
}: {
  registration: {
    name: string;
    category: string;
    location: string;
    submittedAt: string;
    licenseNumber: string;
    ownerName: string;
    ownerEmail: string;
    description: string;
  };
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Status Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-card to-card p-8 shadow-sm">
        <div className="absolute top-0 right-0 h-48 w-48 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-500/10 text-amber-500">
            <Clock4 className="h-10 w-10 animate-pulse" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground md:text-3xl">
            {t("clinicRegistration.pendingTitle")}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground max-w-lg leading-relaxed">
            {t("clinicRegistration.pendingSubtitle")}
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-4">
            <div className="flex items-center gap-2 rounded-2xl border border-amber-500/20 bg-amber-500/5 px-4 py-2">
              <CalendarDays className="h-4 w-4 text-amber-500" />
              <span className="text-xs font-bold text-foreground">
                {t("clinicRegistration.pendingSubmittedOn")}: {registration.submittedAt}
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-amber-500/20 bg-amber-500/5 px-4 py-2">
              <ShieldAlert className="h-4 w-4 text-amber-500" />
              <span className="text-xs font-bold text-amber-600">
                {t("clinicRegistration.pendingStatusValue")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Submitted Information Summary */}
      <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm">
        <h3 className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground mb-5 flex items-center gap-1.5">
          <ClipboardCheck className="h-4 w-4 text-primary" /> {t("clinicRegistration.summaryTitle")}
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <SummaryItem label={t("clinicRegistration.clinicName")} value={registration.name} />
          <SummaryItem label={t("clinicRegistration.category")} value={registration.category} />
          <SummaryItem label={t("clinicRegistration.location")} value={registration.location} />
          <SummaryItem
            label={t("clinicRegistration.licenseNumber")}
            value={registration.licenseNumber}
          />
          <SummaryItem label={t("clinicRegistration.ownerName")} value={registration.ownerName} />
          <SummaryItem label={t("clinicRegistration.ownerEmail")} value={registration.ownerEmail} />
          <div className="md:col-span-2">
            <SummaryItem
              label={t("clinicRegistration.description")}
              value={registration.description}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
      <p className="text-sm font-semibold text-foreground mt-1 break-words">{value}</p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   REJECTED REGISTRATION STATUS
   Shown when Admin has rejected the registration.
   Offers the ability to resubmit.
   ───────────────────────────────────────────────────────── */

function RejectedRegistrationStatus({
  userId,
  registration,
}: {
  userId: string;
  registration: {
    name: string;
    category: string;
    location: string;
    submittedAt: string;
    licenseNumber: string;
    ownerName: string;
    ownerEmail: string;
    description: string;
  };
}) {
  const { t } = useTranslation();

  const handleResubmit = () => {
    clearRejectedRegistration(userId);
    // The component tree will re-render showing the registration form
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Rejection Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-destructive/20 bg-gradient-to-br from-destructive/5 via-card to-card p-8 shadow-sm">
        <div className="absolute top-0 right-0 h-48 w-48 bg-destructive/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-destructive/10 text-destructive">
            <AlertTriangle className="h-10 w-10" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground md:text-3xl">
            {t("clinicRegistration.rejectedTitle")}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground max-w-lg leading-relaxed">
            {t("clinicRegistration.rejectedSubtitle")}
          </p>
          <Button
            onClick={handleResubmit}
            className="mt-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-bold text-sm px-6 py-5 rounded-2xl shadow-glow transition duration-300"
          >
            <FileCheck2 className="mr-2 h-5 w-5" /> {t("clinicRegistration.btnResubmit")}
          </Button>
        </div>
      </div>

      {/* Previously Submitted Information */}
      <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm opacity-60">
        <h3 className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground mb-5 flex items-center gap-1.5">
          <ClipboardCheck className="h-4 w-4 text-muted-foreground" />{" "}
          {t("clinicRegistration.summaryTitle")}
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <SummaryItem label={t("clinicRegistration.clinicName")} value={registration.name} />
          <SummaryItem label={t("clinicRegistration.category")} value={registration.category} />
          <SummaryItem label={t("clinicRegistration.location")} value={registration.location} />
          <SummaryItem
            label={t("clinicRegistration.licenseNumber")}
            value={registration.licenseNumber}
          />
          <SummaryItem label={t("clinicRegistration.ownerName")} value={registration.ownerName} />
          <SummaryItem label={t("clinicRegistration.ownerEmail")} value={registration.ownerEmail} />
        </div>
      </div>
    </div>
  );
}
