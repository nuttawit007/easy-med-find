import { Link } from "@tanstack/react-router";
import { MapPin, Star, Tag } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Clinic } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";

export function ClinicCard({ clinic }: { clinic: Clinic }) {
  const { t } = useTranslation();
  return (
    <Link
      to="/clinic/$clinicId"
      params={{ clinicId: clinic.id }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all hover:-translate-y-1 hover:shadow-glow"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={clinic.thumbnail}
          alt={clinic.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {clinic.promo && (
          <Badge className="absolute left-3 top-3 bg-secondary text-secondary-foreground shadow-soft">
            <Tag className="mr-1 h-3 w-3" /> {clinic.promo}
          </Badge>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 font-semibold">{clinic.name}</h3>
          <div className="flex shrink-0 items-center gap-0.5 text-sm font-medium">
            <Star className="h-4 w-4 fill-warning text-warning" />
            {clinic.rating}
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" /> {clinic.location} · {clinic.distanceKm} km
        </div>
        <div className="mt-auto flex items-end justify-between pt-2">
          <span className="text-xs text-muted-foreground">{t("common.startingFrom")}</span>
          <span className="text-lg font-bold text-primary">฿{clinic.startingPrice.toLocaleString()}</span>
        </div>
      </div>
    </Link>
  );
}
