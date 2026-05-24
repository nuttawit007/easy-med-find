import { Calendar, Clock, MapPin, QrCode, CheckCircle2, CalendarClock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Booking } from "@/lib/bookings";

export function BookingTicketCard({ booking }: { booking: Booking }) {
  const { t } = useTranslation();
  const isUpcoming = booking.status === "upcoming";

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card shadow-soft transition-all duration-300 hover:shadow-glow hover:-translate-y-0.5">
      {/* Top accent strip */}
      <div
        className={cn(
          "h-1.5 w-full",
          isUpcoming
            ? "bg-gradient-to-r from-primary via-secondary to-primary/40"
            : "bg-gradient-to-r from-muted via-border to-muted",
        )}
      />

      {/* Notch decorations */}
      <span className="absolute -left-3.5 top-1/2 hidden h-7 w-7 -translate-y-1/2 rounded-full border border-border/40 bg-background sm:block" />
      <span className="absolute -right-3.5 top-1/2 hidden h-7 w-7 -translate-y-1/2 rounded-full border border-border/40 bg-background sm:block" />

      <div className="flex flex-col sm:flex-row">
        {/* ── Main section ── */}
        <div className="flex-1 p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {t("ticket.eTicket")}
              </p>
              <h3 className="mt-1 text-lg font-extrabold leading-tight tracking-tight">
                {booking.clinicName}
              </h3>
            </div>
            <Badge
              className={cn(
                "shrink-0 rounded-full px-3 font-semibold",
                isUpcoming
                  ? "bg-success text-success-foreground hover:bg-success"
                  : "bg-muted text-muted-foreground hover:bg-muted",
              )}
            >
              {isUpcoming ? (
                <>
                  <CalendarClock className="mr-1 h-3 w-3" />
                  {t("ticket.statusUpcoming")}
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  {t("ticket.statusCompleted")}
                </>
              )}
            </Badge>
          </div>

          {/* Service */}
          <div className="mb-4 rounded-xl bg-muted/40 px-3.5 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t("ticket.service")}
            </p>
            <p className="mt-0.5 font-bold text-foreground">{booking.serviceName}</p>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border/50 bg-background/60 px-3 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {t("ticket.date")}
              </p>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm font-bold">
                <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                {booking.date}
              </p>
            </div>
            <div className="rounded-xl border border-border/50 bg-background/60 px-3 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {t("ticket.time")}
              </p>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm font-bold">
                <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                {booking.time}
              </p>
            </div>
          </div>
        </div>

        {/* ── Dashed perforation ── */}
        <div className="relative border-t-2 border-dashed border-border/40 sm:border-l-2 sm:border-t-0">
          <span className="absolute -top-3 left-1/2 hidden h-6 w-6 -translate-x-1/2 rounded-full bg-background sm:hidden" />
        </div>

        {/* ── Stub ── */}
        <div className="flex flex-col items-center justify-center gap-3 bg-muted/30 p-5 sm:w-44">
          <div className="flex h-[72px] w-[72px] items-center justify-center rounded-2xl border-2 border-border/60 bg-background shadow-soft">
            <QrCode className="h-12 w-12 text-foreground/80" />
          </div>
          <div className="text-center">
            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
              {t("ticket.ref")}
            </p>
            <p className="mt-0.5 font-mono text-xs font-bold tracking-wider">{booking.bookingId}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function EmptyTicketState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/60 bg-card p-14 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft text-primary shadow-soft">
        <MapPin className="h-8 w-8" />
      </div>
      <p className="font-bold text-foreground">{title}</p>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground leading-relaxed">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
