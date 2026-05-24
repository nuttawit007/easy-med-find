import { Link } from "@tanstack/react-router";
import { MapPin, Star, Tag, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Clinic } from "@/lib/mock-data";

export function PromotionCard({ clinic }: { clinic: Clinic }) {
  const { t } = useTranslation();

  return (
    <Link
      to="/clinic/$clinicId"
      params={{ clinicId: clinic.id }}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border/60 bg-card
        transition-all duration-200 hover:border-amber-400/50 hover:shadow-soft"
    >
      {/* ── Promo Banner ── */}
      <div
        className="relative overflow-hidden bg-linear-to-br from-amber-50 via-orange-50 to-yellow-50
        px-5 py-5 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-yellow-950/30"
      >
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-amber-300/30 blur-2xl dark:bg-amber-500/20" />
        <div className="pointer-events-none absolute bottom-0 right-10 h-16 w-16 rounded-full bg-orange-300/25 blur-xl dark:bg-orange-500/15" />

        {/* "Special Offer" chip */}
        <div className="mb-3 flex items-center gap-1.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-amber-500/20 dark:bg-amber-400/20">
            <Tag className="h-3 w-3 text-amber-600 dark:text-amber-400" />
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
            Special Offer
          </span>
        </div>

        {/* ★ BIG promo text ★ */}
        <p
          className="relative text-xl font-extrabold leading-snug tracking-tight text-amber-900
          transition-colors duration-200 group-hover:text-amber-700
          dark:text-amber-100 dark:group-hover:text-amber-300"
        >
          {clinic.promo}
        </p>

        {/* Verified pill — top-right */}
        {clinic.verified && (
          <div
            className="absolute right-4 top-4 flex items-center gap-1 rounded-full
            bg-primary/10 px-2 py-0.5 dark:bg-primary/20"
          >
            <ShieldCheck className="h-3 w-3 text-primary" />
            <span className="text-[10px] font-bold text-primary">{t("common.verified")}</span>
          </div>
        )}
      </div>

      {/* ── Clinic Info Row ── */}
      <div className="flex items-center gap-3 border-t border-border/50 p-4">
        {/* Thumbnail */}
        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl">
          <img
            src={clinic.thumbnail}
            alt={clinic.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </div>

        {/* Name + location */}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="truncate text-sm font-semibold leading-tight transition-colors duration-200 group-hover:text-primary">
            {clinic.name}
          </p>
          <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0 text-primary/60" />
            <span className="truncate">{clinic.location}</span>
            <span className="mx-0.5">·</span>
            <span className="shrink-0">{clinic.distanceKm} km</span>
          </p>
        </div>

        {/* Price + rating */}
        <div className="flex shrink-0 flex-col items-end gap-0.5">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {t("common.startingFrom")}
          </p>
          <p className="text-base font-extrabold leading-none text-primary">
            ฿{clinic.startingPrice.toLocaleString()}
          </p>
          <div className="flex items-center gap-1 pt-0.5">
            <Star className="h-3 w-3 fill-warning text-warning" />
            <span className="text-xs font-bold text-foreground">{clinic.rating}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
