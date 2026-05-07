import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Star, MapPin, ArrowLeft, Calendar as CalendarIcon, Check } from "lucide-react";
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
import { toast } from "sonner";

export const Route = createFileRoute("/clinic/$clinicId")({
  component: ClinicDetail,
  head: ({ params }) => {
    const c = getClinic(params.clinicId);
    return {
      meta: [
        { title: c ? `${c.name} — ClinicCompare` : "Clinic — ClinicCompare" },
        { name: "description", content: c?.description ?? "Clinic details and booking." },
        ...(c ? [{ property: "og:image", content: c.banner }] : []),
      ],
    };
  },
});

function ClinicDetail() {
  const { clinicId } = Route.useParams();
  const navigate = useNavigate();
  const clinic = getClinic(clinicId);

  const [date, setDate] = useState<Date>(new Date());
  const [selectedService, setSelectedService] = useState<string>(clinic?.services[0]?.name ?? "");
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const slots = useMemo(() => (clinic ? getTimeSlots(clinic.id, date) : []), [clinic, date]);

  if (!clinic) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="container mx-auto p-10 text-center">
          <p>Clinic not found.</p>
          <Button asChild variant="link"><Link to="/">Back home</Link></Button>
        </div>
      </div>
    );
  }

  const service = clinic.services.find((s) => s.name === selectedService);

  const confirmBooking = () => {
    setConfirmOpen(false);
    toast.success("Appointment confirmed!", {
      description: `${selectedService} on ${date.toDateString()} at ${selectedSlot}`,
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
          <Button asChild variant="secondary" size="sm" className="absolute left-4 top-4 shadow-soft">
            <Link to="/"><ArrowLeft className="mr-1 h-4 w-4" /> Back</Link>
          </Button>
        </div>
      </div>

      <div className="container mx-auto grid gap-8 px-4 pb-20 lg:grid-cols-[1fr_380px]">
        {/* Left: profile */}
        <div className="-mt-10">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <Badge variant="secondary" className="mb-2">{clinic.category}</Badge>
                <h1 className="text-3xl font-bold">{clinic.name}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-warning text-warning" /> <strong className="text-foreground">{clinic.rating}</strong> ({clinic.reviews} reviews)</span>
                  <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {clinic.location} · {clinic.distanceKm} km</span>
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
                <img key={i} src={g} alt="" className="aspect-square rounded-xl object-cover" loading="lazy" />
              ))}
            </div>
          </div>

          {/* Services */}
          <div className="mt-6">
            <h2 className="mb-3 text-lg font-semibold">Services & pricing</h2>
            <div className="space-y-2">
              {clinic.services.map((s) => (
                <div key={s.name} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
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
          <div className="mt-6">
            <h2 className="mb-3 text-lg font-semibold">Recent reviews</h2>
            <div className="space-y-3">
              {clinic.reviewList.map((r, i) => (
                <div key={i} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{r.user}</p>
                    <span className="text-xs text-muted-foreground">{r.date}</span>
                  </div>
                  <div className="mt-1 flex">
                    {Array.from({ length: r.rating }).map((_, j) => (
                      <Star key={j} className="h-3.5 w-3.5 fill-warning text-warning" />
                    ))}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: booking widget */}
        <aside className="lg:sticky lg:top-20 lg:-mt-10 lg:self-start">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-glow">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <CalendarIcon className="h-5 w-5 text-primary" /> Book appointment
            </h3>

            <div className="mt-4">
              <label className="text-xs font-medium text-muted-foreground">Service</label>
              <Select value={selectedService} onValueChange={setSelectedService}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {clinic.services.map((s) => (
                    <SelectItem key={s.name} value={s.name}>{s.name} — ฿{s.price.toLocaleString()}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="mt-4">
              <label className="text-xs font-medium text-muted-foreground">Pick a date</label>
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => d && (setDate(d), setSelectedSlot(null))}
                disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                className={cn("mt-1 rounded-lg border border-border p-2 pointer-events-auto")}
              />
            </div>

            <div className="mt-4">
              <label className="text-xs font-medium text-muted-foreground">Available time slots</label>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {slots.map((s) => (
                  <button
                    key={s.time}
                    disabled={!s.available}
                    onClick={() => setSelectedSlot(s.time)}
                    className={cn(
                      "rounded-lg border px-2 py-2 text-sm font-medium transition",
                      !s.available && "cursor-not-allowed border-border bg-muted text-muted-foreground line-through opacity-60",
                      s.available && selectedSlot === s.time && "border-primary bg-primary text-primary-foreground shadow-soft",
                      s.available && selectedSlot !== s.time && "border-border bg-background hover:border-primary hover:text-primary",
                    )}
                  >
                    {s.time}
                  </button>
                ))}
              </div>
            </div>

            <Button
              size="lg"
              className="mt-5 w-full shadow-soft"
              disabled={!selectedSlot}
              onClick={() => setConfirmOpen(true)}
            >
              Book Now
            </Button>
          </div>
        </aside>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm your booking</DialogTitle>
            <DialogDescription>Please review your appointment details before confirming.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 rounded-xl bg-muted p-4 text-sm">
            <Row k="Clinic" v={clinic.name} />
            <Row k="Service" v={selectedService} />
            <Row k="Date" v={date.toDateString()} />
            <Row k="Time" v={selectedSlot ?? ""} />
            <Row k="Price" v={service ? `฿${service.price.toLocaleString()}` : ""} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button onClick={confirmBooking}><Check className="mr-1 h-4 w-4" /> Confirm booking</Button>
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
