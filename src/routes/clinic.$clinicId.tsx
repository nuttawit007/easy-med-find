import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Star, MapPin, ArrowLeft, Calendar as CalendarIcon, Check, Phone, Mail, Globe, Clock, ImagePlus, UploadCloud } from "lucide-react";
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
  DialogTrigger
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
import { useClinics } from "@/lib/clinics";
import { addBooking } from "@/lib/bookings";
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
  const isPatient = user?.role === 'patient';
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const allClinics = useClinics();
  const clinic = allClinics.find((c) => c.id === clinicId);

  // Helper: returns true if the clinic is closed on a given JS Date
  const isClosedDay = (d: Date): boolean => {
    if (!clinic?.openingHours || clinic.openingHours.length === 0) return false;
    const JS_DAY_TO_NAME = [
      "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
    ] as const;
    const dayName = JS_DAY_TO_NAME[d.getDay()];
    const entry = clinic.openingHours.find((h) => h.day === dayName);
    return entry ? !entry.isOpen : false;
  };

  // Find the next open day starting from today (used for initial date)
  const findNextOpenDay = (): Date => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    for (let i = 0; i < 14; i++) {
      if (!isClosedDay(d)) return d;
      d.setDate(d.getDate() + 1);
    }
    return d; // fallback: return 14 days out
  };

  const [date, setDate] = useState<Date>(findNextOpenDay);
  const [selectedService, setSelectedService] = useState<string>(clinic?.services[0]?.name ?? "");
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const slots = useMemo(
    () => (clinic ? getTimeSlots(clinic.id, date, clinic.openingHours) : []),
    [clinic, date],
  );

  // Reset selected slot if it no longer exists in the current slot list
  // (e.g. date changed, or clinic admin narrowed the opening hours)
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
          <p>Clinic not found.</p>
          <Button asChild variant="link">
            <Link to="/">Back home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const service = clinic.services.find((s) => s.name === selectedService);

  const confirmBooking = () => {
    if (!clinic || !selectedSlot || !selectedService) return;
    const svc = clinic.services.find((s) => s.name === selectedService);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const localDateString = `${year}-${month}-${day}`;
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
    toast.success("Appointment confirmed!", {
      description: `${booking.bookingId} · ${selectedService} · ${date.toDateString()} ${selectedSlot}`,
    });
    setSelectedSlot(null);
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Banner */}
      <div className="relative h-56 w-full overflow-hidden md:h-72">
        <img src={clinic.banner} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <div className="container mx-auto px-4">
          <Button
            asChild
            variant="secondary"
            size="sm"
            className="absolute left-4 top-4 shadow-soft"
          >
            <Link to="/">
              <ArrowLeft className="mr-1 h-4 w-4" /> Back
            </Link>
          </Button>
        </div>
      </div>

      <div className="container mx-auto grid gap-8 px-4 pb-20 lg:grid-cols-[1fr_380px]">
        {/* Left: profile */}
        <div className="-mt-10">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <Badge variant="secondary" className="mb-2">
                  {clinic.category}
                </Badge>
                <h1 className="text-3xl font-bold">{clinic.name}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-warning text-warning" />{" "}
                    <strong className="text-foreground">{clinic.rating}</strong> ({clinic.reviews}{" "}
                    reviews)
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" /> {clinic.location} · {clinic.distanceKm} km
                  </span>
                </div>
              </div>
              {clinic.promo && (
                <Badge className="bg-secondary text-secondary-foreground">🎉 {clinic.promo}</Badge>
              )}
            </div>
            <p className="mt-4 leading-relaxed text-muted-foreground">{clinic.description}</p>
          </div>

          {/* Gallery */}
          <div className="mt-6">
            <h2 className="mb-3 text-lg font-semibold">Gallery</h2>
            <div className="grid grid-cols-3 gap-3">
              {clinic.gallery.map((g, i) => (
                <img
                  key={i}
                  src={g}
                  alt=""
                  className="aspect-square rounded-xl object-cover"
                  loading="lazy"
                />
              ))}
            </div>
          </div>

          {/* Services */}
          <div className="mt-6">
            <h2 className="mb-3 text-lg font-semibold">Services & pricing</h2>
            <div className="space-y-2">
              {clinic.services.map((s) => (
                <div
                  key={s.name}
                  className="flex items-center justify-between rounded-xl border border-border bg-card p-4"
                >
                  <div>
                    <p className="font-medium">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.durationMin} min</p>
                  </div>
                  <p className="font-semibold text-primary">฿{s.price.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">{t('clinic.reviews', 'Reviews')}</h2>
            
            {isPatient && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="shadow-soft">
                    <Star className="mr-2 h-4 w-4" />
                    {t('clinic.writeReview', 'Write a Review')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>{t('clinic.reviewModalTitle', 'Rate your experience')}</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    
                    {/* Star Rating */}
                    <div className="flex justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-8 w-8 cursor-pointer transition-colors ${rating >= star ? 'fill-primary text-primary' : 'text-muted-foreground'}`}
                          onClick={() => setRating(star)}
                        />
                      ))}
                    </div>

                    {/* Tags */}
                    <div className="space-y-2">
                      <Label>{t('clinic.reviewTags', 'What stood out?')}</Label>
                      <ToggleGroup type="multiple" value={selectedTags} onValueChange={setSelectedTags} className="flex flex-wrap justify-start gap-2">
                        <ToggleGroupItem value="clean" className="border">✨ Cleanliness</ToggleGroupItem>
                        <ToggleGroupItem value="friendly" className="border">👋 Friendly Staff</ToggleGroupItem>
                        <ToggleGroupItem value="professional" className="border">👩‍⚕️ Professional</ToggleGroupItem>
                        <ToggleGroupItem value="fast" className="border">⚡ Short Wait</ToggleGroupItem>
                      </ToggleGroup>
                    </div>

                    {/* Text Description */}
                    <div className="space-y-2">
                      <Label>{t('clinic.reviewComment', 'Your Comment')}</Label>
                      <Textarea 
                        placeholder={t('clinic.reviewPlaceholder', 'Tell us about your visit...')}
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                      />
                    </div>

                    {/* Image Upload Placeholder */}
                    <div className="space-y-2">
                      <Label>{t('clinic.reviewImages', 'Attach Photos (Optional)')}</Label>
                      <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-muted-foreground cursor-pointer hover:bg-muted/50 transition-colors">
                        <ImagePlus className="h-8 w-8 mb-2" />
                        <span className="text-sm">Click to upload images</span>
                        <Input type="file" className="hidden" multiple accept="image/*" />
                      </div>
                    </div>
                    
                  </div>
                  <Button className="w-full" onClick={() => console.log('Submit to Supabase:', {rating, selectedTags, reviewText})}>
                    {t('common.submit', 'Submit Review')}
                  </Button>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Contact & Hours — only shown when clinic has set this info */}
          {(clinic.phone || clinic.email || clinic.website || clinic.openingHours) && (
            <div className="mt-6">
              <h2 className="mb-3 text-lg font-semibold">Contact &amp; Hours</h2>
              <div className="rounded-xl border border-border bg-card p-4 space-y-4">
                {/* Contact details */}
                {(clinic.phone || clinic.email || clinic.website) && (
                  <div className="space-y-2">
                    {clinic.phone && (
                      <a
                        href={`tel:${clinic.phone}`}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Phone className="h-4 w-4 shrink-0 text-primary" />
                        {clinic.phone}
                      </a>
                    )}
                    {clinic.email && (
                      <a
                        href={`mailto:${clinic.email}`}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Mail className="h-4 w-4 shrink-0 text-primary" />
                        {clinic.email}
                      </a>
                    )}
                    {clinic.website && (
                      <a
                        href={clinic.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Globe className="h-4 w-4 shrink-0 text-primary" />
                        {clinic.website.replace(/^https?:\/\//, "")}
                      </a>
                    )}
                  </div>
                )}

                {/* Opening hours */}
                {clinic.openingHours && clinic.openingHours.length > 0 && (
                  <div>
                    {(clinic.phone || clinic.email || clinic.website) && (
                      <div className="my-3 border-t border-border" />
                    )}
                    <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" /> Opening Hours
                    </div>
                    <div className="space-y-1">
                      {clinic.openingHours.map((entry) => (
                        <div key={entry.day} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground w-24">{entry.day}</span>
                          {entry.isOpen ? (
                            <span className="font-medium">{entry.open} – {entry.close}</span>
                          ) : (
                            <span className="text-muted-foreground">Closed</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right: booking widget */}
        <aside className="lg:sticky lg:top-20 lg:-mt-10 lg:self-start">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-glow">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <CalendarIcon className="h-5 w-5 text-primary" /> Book appointment
            </h3>

            <div className="mt-4">
              <label className="text-xs font-medium text-muted-foreground">
                {t("booking.selectService")}
              </label>
              <Select value={selectedService} onValueChange={setSelectedService}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {clinic.services.map((s) => (
                    <SelectItem key={s.name} value={s.name}>
                      {s.name} — ฿{s.price.toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="mt-4">
              <label className="text-xs font-medium text-muted-foreground">
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
                disabled={(d) =>
                  d < new Date(new Date().setHours(0, 0, 0, 0)) || isClosedDay(d)
                }
                className={cn("mt-1 rounded-lg border border-border p-2 pointer-events-auto")}
              />
            </div>

            <div className="mt-4">
              <label className="text-xs font-medium text-muted-foreground">
                {t("booking.selectTime")}
              </label>
              {isClosed ? (
                <div className="mt-2 flex items-center justify-center rounded-xl border border-border bg-muted/50 py-6 text-sm text-muted-foreground">
                  <Clock className="mr-2 h-4 w-4" />
                  Clinic is closed on this day
                </div>
              ) : (
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {slots.map((s) => (
                    <button
                      key={s.time}
                      disabled={!s.available}
                      onClick={() => setSelectedSlot(s.time)}
                      className={cn(
                        "rounded-lg border px-2 py-2 text-sm font-medium transition",
                        !s.available &&
                          "cursor-not-allowed border-border bg-muted text-muted-foreground line-through opacity-60",
                        s.available &&
                          selectedSlot === s.time &&
                          "border-primary bg-primary text-primary-foreground shadow-soft",
                        s.available &&
                          selectedSlot !== s.time &&
                          "border-border bg-background hover:border-primary hover:text-primary",
                      )}
                    >
                      {s.time}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Button
              size="lg"
              className="mt-5 w-full shadow-soft"
              disabled={!selectedSlot}
              onClick={() => setConfirmOpen(true)}
            >
              {t("booking.bookNow")}
            </Button>
          </div>
        </aside>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm your booking</DialogTitle>
            <DialogDescription>
              Please review your appointment details before confirming.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 rounded-xl bg-muted p-4 text-sm">
            <Row k="Clinic" v={clinic.name} />
            <Row k="Service" v={selectedService} />
            <Row k="Date" v={date.toDateString()} />
            <Row k="Time" v={selectedSlot ?? ""} />
            <Row k="Price" v={service ? `฿${service.price.toLocaleString()}` : ""} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmBooking}>
              <Check className="mr-1 h-4 w-4" /> Confirm booking
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
    <div className="flex justify-between">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium">{v}</span>
    </div>
  );
}
