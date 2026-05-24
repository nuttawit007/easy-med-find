import { Link } from "@tanstack/react-router";
import { MapPin, Star, Tag, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Clinic } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";

export function ClinicCard({ clinic }: { clinic: Clinic }) {
  const { t } = useTranslation();

  return (
    <Link
      to="/clinic/$clinicId"
      params={{ clinicId: clinic.id }}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-3xl border border-border/70 bg-card shadow-soft
        transition-all duration-300 hover:-translate-y-2 hover:border-primary/30 hover:shadow-glow"
    >
      {/* Hover accent bar */}
      <span className="absolute inset-x-0 top-0 z-10 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Image */}
      <div className="relative aspect-4/3 overflow-hidden bg-muted">
        <img
          src={clinic.thumbnail}
          alt={clinic.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        {/* Gradient scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

        {/* Promo badge */}
        {clinic.promo && (
          <Badge className="absolute left-3 top-3 border-0 bg-secondary/90 text-secondary-foreground shadow-soft backdrop-blur-sm">
            <Tag className="mr-1 h-3 w-3" /> {clinic.promo}
          </Badge>
        )}

        {/* Verified pill */}
        {clinic.verified && (
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-primary/85 px-2 py-0.5 backdrop-blur-sm">
            <ShieldCheck className="h-3 w-3 text-primary-foreground" />
            <span className="text-[10px] font-bold text-primary-foreground">
              {t("common.verified")}
            </span>
          </div>
        )}

        {/* Rating pill */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 backdrop-blur-sm">
          <Star className="h-3.5 w-3.5 fill-warning text-warning" />
          <span className="text-xs font-bold text-white">{clinic.rating}</span>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="inline-flex w-fit items-center rounded-full bg-primary-soft px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
          {t(`cat.${clinic.category}`)}
        </span>

        {/* Name */}
        <h3 className="line-clamp-1 text-[15px] font-bold leading-snug text-foreground transition-colors duration-200 group-hover:text-primary">
          {clinic.name}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0 text-primary/60" />
          <span className="truncate">{clinic.location}</span>
          <span className="mx-0.5">·</span>
          <span>{clinic.distanceKm} km</span>
        </div>

        {/* Footer */}
        <div className="mt-auto flex items-end justify-between border-t border-border/50 pt-3">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {t("common.startingFrom")}
            </p>
            <p className="mt-0.5 text-xl font-extrabold leading-none text-primary">
              ฿{clinic.startingPrice.toLocaleString()}
            </p>
          </div>
          <span className="rounded-full border border-border bg-muted/50 px-2.5 py-1 text-[10px] text-muted-foreground">
            {clinic.reviews.toLocaleString()} {t("common.reviews")}
          </span>
        </div>
      </div>
    </Link>
  );
}
