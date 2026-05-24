import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Star,
  MapPin,
  ArrowLeft,
  Calendar as CalendarIcon,
  Check,
  Phone,
  Mail,
  Globe,
  Clock,
  ImagePlus,
  ShieldCheck,
  Tag,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { ClinicChatWidget } from "@/components/clinic-chat-widget";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { getClinic, getTimeSlots } from "@/lib/mock-data";
import { useLocalizedClinics } from "@/lib/clinics";
import { addBooking, BookingConflictError, useBookings } from "@/lib/bookings";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/clinic/$clinicId")({
  component: ClinicDetail,
  head: ({ params }) => {
    const c = getClinic(params.clinicId);
    return {
      meta: [
        { title: c ? `${c.name} — MedCentral` : "Clinic — MedCentral" },
        { name: "description", content: c?.description ?? "Clinic details and booking." },
        ...(c ? [{ property: "og:image", content: c.banner }] : []),
      ],
    };
  },
});

function ClinicDetail() {
  const { clinicId } = Route.useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const isPatient = user?.role === "patient";
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const allClinics = useLocalizedClinics();
  const clinic = allClinics.find((c) => c.id === clinicId);

  const isClosedDay = (d: Date): boolean => {
    if (!clinic?.openingHours || clinic.openingHours.length === 0) return false;
    const JS_DAY_TO_NAME = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ] as const;
    const dayName = JS_DAY_TO_NAME[d.getDay()];
    const entry = clinic.openingHours.find((h) => h.day === dayName);
    return entry ? !entry.isOpen : false;
  };

  const findNextOpenDay = (): Date => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    for (let i = 0; i < 14; i++) {
      if (!isClosedDay(d)) return d;
      d.setDate(d.getDate() + 1);
    }
    return d;
  };

  const [date, setDate] = useState<Date>(findNextOpenDay);
  const [selectedService, setSelectedService] = useState<string>(clinic?.services[0]?.name ?? "");
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const slots = useMemo(
    () => (clinic ? getTimeSlots(clinic.id, date, clinic.openingHours) : []),
    [clinic, date],
  );

  const allBookings = useBookings();

  // ISO date string for the currently selected date (used for conflict checks)
  const localDateString = useMemo(() => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, [date]);

  // Set of times already booked for this clinic + service + date
  const bookedTimes = useMemo(
    () =>
      new Set(
        allBookings
          .filter(
            (b) =>
              b.status !== "cancelled" &&
              b.clinicId === clinicId &&
              b.serviceName === selectedService &&
              b.date === localDateString,
          )
          .map((b) => b.time),
      ),
    [allBookings, clinicId, selectedService, localDateString],
  );

  useEffect(() => {
    if (selectedSlot && !slots.some((s) => s.time === selectedSlot)) {
      setSelectedSlot(null);
    }
  }, [slots, selectedSlot]);

  const isClosed = slots.length === 0 && !!clinic?.openingHours;

  if (!clinic) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="container mx-auto p-10 text-center">
          <p>{t("clinic.notFound")}</p>
          <Button asChild variant="link">
            <Link to="/">{t("common.backHome")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  const service = clinic.services.find((s) => s.name === selectedService);

  const confirmBooking = () => {
    if (!clinic || !selectedSlot || !selectedService) return;
    const svc = clinic.services.find((s) => s.name === selectedService);
    try {
      const booking = addBooking({
        clinicId: clinic.id,
        clinicName: clinic.name,
        serviceName: selectedService,
        price: svc?.price,
        date: localDateString,
        time: selectedSlot,
        patientId: user?.id,
        patientName: user?.name,
        patientEmail: user?.email,
      });
      setConfirmOpen(false);
      toast.success(t("booking.toastSuccess"), {
        description: `${booking.bookingId} · ${selectedService} · ${date.toDateString()} ${selectedSlot}`,
      });
      setSelectedSlot(null);
      navigate({ to: "/dashboard" });
    } catch (err) {
      if (err instanceof BookingConflictError) {
        toast.error(t("booking.errorConflict"));
        setSelectedSlot(null);
        setConfirmOpen(false);
      } else {
        toast.error(err instanceof Error ? err.message : t("booking.toastError"));
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* ── Banner ── */}
      <div className="relative h-64 w-full overflow-hidden md:h-80">
        <img src={clinic.banner} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <Button
          asChild
          variant="secondary"
          size="sm"
          className="absolute left-4 top-4 cursor-pointer rounded-xl border border-border/60 bg-background/70 shadow-soft backdrop-blur-sm transition-colors hover:bg-background"
        >
          <Link to="/">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> {t("clinic.back")}
          </Link>
        </Button>
      </div>

      <div className="relative z-10 container mx-auto grid gap-8 px-4 pb-24 lg:grid-cols-[1fr_380px]">
        {/* ── Left ── */}
        <div className="-mt-12">
          {/* Profile card */}
          <div className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-soft">
            <div className="h-1 bg-gradient-to-r from-primary via-secondary to-primary/30" />
            <div className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <Badge variant="secondary" className="font-semibold">
                      {t(`cat.${clinic.category}`)}
                    </Badge>
                    {clinic.verified && (
                      <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                        <ShieldCheck className="h-3 w-3" /> {t("common.verified")}
                      </span>
                    )}
                  </div>
                  <h1 className="text-3xl font-extrabold tracking-tight">{clinic.name}</h1>
                  <div className="mt-2.5 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Star className="h-4 w-4 fill-warning text-warning" />
                      <strong className="font-bold text-foreground">{clinic.rating}</strong>
                      <span className="text-muted-foreground">
                        ({clinic.reviews} {t("common.reviews")})
                      </span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-primary/70" />
                      {clinic.location} · {clinic.distanceKm} km
                    </span>
                  </div>
                </div>
                {clinic.promo && (
                  <Badge className="bg-secondary px-3 py-1 text-sm font-semibold text-secondary-foreground">
                    <Tag className="mr-1.5 h-3.5 w-3.5" /> {clinic.promo}
                  </Badge>
                )}
              </div>
              <p className="mt-4 leading-relaxed text-muted-foreground">{clinic.description}</p>
            </div>
          </div>

          {/* ── Gallery ── */}
          <div className="mt-6">
            <h2 className="mb-3 text-lg font-bold">{t("clinic.gallery")}</h2>
            <div className="grid grid-cols-3 gap-3">
              {clinic.gallery.map((g, i) => (
                <div
                  key={i}
                  className="group cursor-pointer overflow-hidden rounded-2xl border border-border/50"
                >
                  <img
                    src={g}
                    alt=""
                    className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ── Services ── */}
          <div className="mt-6">
            <h2 className="mb-3 text-lg font-bold">{t("clinic.servicesAndPricing")}</h2>
            <div className="space-y-2">
              {clinic.services.map((s) => (
                <div
                  key={s.name}
                  className="group flex cursor-pointer items-center justify-between rounded-2xl border border-border/60 bg-card p-4
                    transition-all duration-200 hover:border-primary/30 hover:bg-primary/5 hover:shadow-soft"
                >
                  <div>
                    <p className="font-semibold transition-colors group-hover:text-primary">
                      {s.name}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" /> {s.durationMin} {t("common.min")}
                    </p>
                  </div>
                  <p className="text-lg font-extrabold text-primary">฿{s.price.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Reviews ── */}
          <div className="mt-6 flex items-center justify-between">
            <h2 className="text-xl font-bold">{t("clinic.reviews")}</h2>
            {isPatient && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="cursor-pointer rounded-xl font-semibold shadow-soft">
                    <Star className="mr-2 h-4 w-4" />
                    {t("clinic.writeReview")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-3xl sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>{t("clinic.reviewModalTitle")}</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    {/* Star Rating */}
                    <div className="flex justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-8 w-8 cursor-pointer transition-all duration-150 hover:scale-110 ${
                            rating >= star ? "fill-primary text-primary" : "text-muted-foreground"
                          }`}
                          onClick={() => setRating(star)}
                        />
                      ))}
                    </div>
                    {/* Tags */}
                    <div className="space-y-2">
                      <Label>{t("clinic.reviewTags")}</Label>
                      <ToggleGroup
                        type="multiple"
                        value={selectedTags}
                        onValueChange={setSelectedTags}
                        className="flex flex-wrap justify-start gap-2"
                      >
                        <ToggleGroupItem
                          value="clean"
                          className="cursor-pointer rounded-full border text-xs"
                        >
                          {t("clinic.reviewTagClean")}
                        </ToggleGroupItem>
                        <ToggleGroupItem
                          value="friendly"
                          className="cursor-pointer rounded-full border text-xs"
                        >
                          {t("clinic.reviewTagFriendly")}
                        </ToggleGroupItem>
                        <ToggleGroupItem
                          value="professional"
                          className="cursor-pointer rounded-full border text-xs"
                        >
                          {t("clinic.reviewTagProfessional")}
                        </ToggleGroupItem>
                        <ToggleGroupItem
                          value="fast"
                          className="cursor-pointer rounded-full border text-xs"
                        >
                          {t("clinic.reviewTagFast")}
                        </ToggleGroupItem>
                      </ToggleGroup>
                    </div>
                    {/* Comment */}
                    <div className="space-y-2">
                      <Label>{t("clinic.reviewComment")}</Label>
                      <Textarea
                        placeholder={t("clinic.reviewPlaceholder")}
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                    {/* Image Upload */}
                    <div className="space-y-2">
                      <Label>{t("clinic.reviewImages")}</Label>
                      <div className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border p-6 text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5">
                        <ImagePlus className="mb-2 h-8 w-8" />
                        <span className="text-sm">{t("clinic.uploadImages")}</span>
                        <Input type="file" className="hidden" multiple accept="image/*" />
                      </div>
                    </div>
                  </div>
                  <Button
                    className="w-full cursor-pointer rounded-xl shadow-soft"
                    onClick={() =>
                      console.log("Submit to Supabase:", { rating, selectedTags, reviewText })
                    }
                  >
                    {t("common.submit")}
                  </Button>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Existing reviews */}
          {clinic.reviewList && clinic.reviewList.length > 0 && (
            <div className="mt-4 space-y-3">
              {clinic.reviewList.map((r, i) => (
                <div key={i} className="rounded-2xl border border-border/60 bg-card p-4">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-sm font-semibold">{r.user}</span>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: r.rating }).map((_, j) => (
                        <Star key={j} className="h-3.5 w-3.5 fill-warning text-warning" />
                      ))}
                      <span className="ml-1.5 text-xs text-muted-foreground">{r.date}</span>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">{r.comment}</p>
                </div>
              ))}
            </div>
          )}

          {/* ── Contact & Hours ── */}
          {(clinic.phone || clinic.email || clinic.website || clinic.openingHours) && (
            <div className="mt-6">
              <h2 className="mb-3 text-lg font-bold">{t("clinic.contactAndHours")}</h2>
              <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-soft">
                <div className="h-0.5 bg-gradient-to-r from-primary/40 via-secondary/40 to-transparent" />
                <div className="space-y-4 p-5">
                  {(clinic.phone || clinic.email || clinic.website) && (
                    <div className="space-y-2.5">
                      {clinic.phone && (
                        <a
                          href={`tel:${clinic.phone}`}
                          className="group flex cursor-pointer items-center gap-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary-soft transition-colors group-hover:bg-primary/20">
                            <Phone className="h-3.5 w-3.5 text-primary" />
                          </span>
                          {clinic.phone}
                        </a>
                      )}
                      {clinic.email && (
                        <a
                          href={`mailto:${clinic.email}`}
                          className="group flex cursor-pointer items-center gap-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary-soft transition-colors group-hover:bg-primary/20">
                            <Mail className="h-3.5 w-3.5 text-primary" />
                          </span>
                          {clinic.email}
                        </a>
                      )}
                      {clinic.website && (
                        <a
                          href={clinic.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex cursor-pointer items-center gap-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary-soft transition-colors group-hover:bg-primary/20">
                            <Globe className="h-3.5 w-3.5 text-primary" />
                          </span>
                          {clinic.website.replace(/^https?:\/\//, "")}
                        </a>
                      )}
                    </div>
                  )}

                  {clinic.openingHours && clinic.openingHours.length > 0 && (
                    <div>
                      {(clinic.phone || clinic.email || clinic.website) && (
                        <div className="my-3 border-t border-border/50" />
                      )}
                      <div className="mb-2.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" /> {t("clinic.openingHours")}
                      </div>
                      <div className="space-y-1.5">
                        {clinic.openingHours.map((entry) => (
                          <div
                            key={entry.day}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="w-28 text-muted-foreground">
                              {t(`days.${entry.day}`)}
                            </span>
                            {entry.isOpen ? (
                              <span className="font-semibold">
                                {entry.open} – {entry.close}
                              </span>
                            ) : (
                              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                                {t("clinic.closed")}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Booking Widget ── */}
        <aside className="lg:sticky lg:top-20 lg:-mt-12 lg:self-start">
          <div className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-glow">
            <div className="h-1.5 bg-gradient-to-r from-primary via-secondary to-primary/50" />
            <div className="p-5">
              <h3 className="flex items-center gap-2 text-lg font-bold">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary shadow-soft">
                  <CalendarIcon className="h-4 w-4 text-primary-foreground" />
                </span>
                {t("booking.bookAppointment")}
              </h3>

              {/* Service */}
              <div className="mt-5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("booking.selectService")}
                </label>
                <Select value={selectedService} onValueChange={setSelectedService}>
                  <SelectTrigger className="mt-1.5 cursor-pointer rounded-xl border-border/60">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {clinic.services.map((s) => (
                      <SelectItem key={s.name} value={s.name} className="cursor-pointer">
                        {s.name} — ฿{s.price.toLocaleString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date */}
              <div className="mt-5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("booking.selectDate")}
                </label>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => {
                    if (!d) return;
                    setDate(d);
                    setSelectedSlot(null);
                  }}
                  disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0)) || isClosedDay(d)}
                  className={cn(
                    "pointer-events-auto mt-1.5 rounded-2xl border border-border/60 p-2",
                  )}
                />
              </div>

              {/* Time slots */}
              <div className="mt-5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("booking.selectTime")}
                </label>
                {isClosed ? (
                  <div className="mt-2 flex items-center justify-center rounded-2xl border border-border bg-muted/50 py-6 text-sm text-muted-foreground">
                    <Clock className="mr-2 h-4 w-4" /> {t("booking.closedOnDay")}
                  </div>
                ) : (
                  <div className="mt-2 grid grid-cols-4 gap-2">
                    {slots.map((s) => {
                      const isBooked = bookedTimes.has(s.time);
                      const isUnavailable = !s.available;
                      const isSelected = selectedSlot === s.time;
                      return (
                        <button
                          key={s.time}
                          disabled={isUnavailable}
                          onClick={() => {
                            if (isBooked) {
                              toast.error(t("booking.slotBooked"));
                              return;
                            }
                            setSelectedSlot(s.time);
                          }}
                          className={cn(
                            "rounded-xl border px-2 py-2 text-xs font-semibold transition-all duration-150",
                            // Already booked by a patient
                            isBooked &&
                              "cursor-not-allowed border-destructive/40 bg-destructive/8 text-destructive/60",
                            // Clinic's own unavailable slots (random schedule)
                            isUnavailable &&
                              !isBooked &&
                              "cursor-not-allowed border-border bg-muted text-muted-foreground line-through opacity-50",
                            // Selected
                            !isBooked &&
                              !isUnavailable &&
                              isSelected &&
                              "cursor-pointer border-primary bg-primary text-primary-foreground shadow-soft",
                            // Available, not selected
                            !isBooked &&
                              !isUnavailable &&
                              !isSelected &&
                              "cursor-pointer border-border/60 bg-background hover:border-primary hover:bg-primary/8 hover:text-primary",
                          )}
                        >
                          {s.time}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Price preview */}
              {service && selectedSlot && (
                <div className="mt-4 flex items-center justify-between rounded-2xl bg-primary-soft px-4 py-3">
                  <span className="text-xs font-semibold text-muted-foreground">
                    {t("booking.total")}
                  </span>
                  <span className="text-xl font-extrabold text-primary">
                    ฿{service.price.toLocaleString()}
                  </span>
                </div>
              )}

              <Button
                size="lg"
                className="mt-4 w-full cursor-pointer rounded-2xl text-base font-bold shadow-glow"
                disabled={!selectedSlot}
                onClick={() => setConfirmOpen(true)}
              >
                {t("booking.bookNow")}
              </Button>
            </div>
          </div>
        </aside>
      </div>

      {/* ── Confirm dialog ── */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>{t("booking.confirmTitle")}</DialogTitle>
            <DialogDescription>{t("booking.confirmDesc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 overflow-hidden rounded-2xl border border-border/60 bg-muted/40 p-5 text-sm">
            <Row k={t("booking.clinic")} v={clinic.name} />
            <Row k={t("booking.service")} v={selectedService} />
            <Row k={t("booking.date")} v={date.toDateString()} />
            <Row k={t("booking.time")} v={selectedSlot ?? ""} />
            <Row k={t("booking.price")} v={service ? `฿${service.price.toLocaleString()}` : ""} />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="cursor-pointer rounded-xl"
              onClick={() => setConfirmOpen(false)}
            >
              {t("booking.cancel")}
            </Button>
            <Button className="cursor-pointer rounded-xl shadow-soft" onClick={confirmBooking}>
              <Check className="mr-1.5 h-4 w-4" /> {t("booking.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ClinicChatWidget clinicName={clinic.name} />
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between py-0.5">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-semibold">{v}</span>
    </div>
  );
}
