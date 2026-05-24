import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Tag } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SiteHeader } from "@/components/site-header";
import { PromotionCard } from "@/components/promotion-card";
import { Button } from "@/components/ui/button";
import { useLocalizedClinics } from "@/lib/clinics";

export const Route = createFileRoute("/promotions")({
  component: PromotionsPage,
  head: () => ({
    meta: [
      { title: "Promotions — MedCentral" },
      { name: "description", content: "Limited-time deals from verified clinics." },
    ],
  }),
});

function PromotionsPage() {
  const { t } = useTranslation();
  const allClinics = useLocalizedClinics();
  const promos = allClinics.filter((c) => c.promo);
  const promoCategories = [...new Set(promos.map((c) => c.category))];
  const [active, setActive] = useState<string>("all");
  const filtered = active === "all" ? promos : promos.filter((c) => c.category === active);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold md:text-4xl">{t("promotions.title")}</h1>
        <p className="mt-1 text-muted-foreground">{t("promotions.subtitle")}</p>

        {/* Category filter */}
        <div className="mt-6 flex flex-wrap gap-2">
          <Button
            variant={active === "all" ? "default" : "outline"}
            size="sm"
            className="cursor-pointer rounded-xl"
            onClick={() => setActive("all")}
          >
            {t("common.all")}
          </Button>
          {promoCategories.map((c) => (
            <Button
              key={c}
              variant={active === c ? "default" : "outline"}
              size="sm"
              className="cursor-pointer rounded-xl"
              onClick={() => setActive(c)}
            >
              {t(`cat.${c}`)}
            </Button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-border bg-card p-12 text-center">
            <Tag className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="font-semibold text-muted-foreground">{t("promotions.noResults")}</p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => (
              <PromotionCard key={c.id} clinic={c} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
