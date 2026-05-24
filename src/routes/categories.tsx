import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { SiteHeader } from "@/components/site-header";
import { ClinicCard } from "@/components/clinic-card";
import { CATEGORIES } from "@/lib/mock-data";
import { useLocalizedClinics } from "@/lib/clinics";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/categories")({
  component: CategoriesPage,
  head: () => ({
    meta: [
      { title: "Categories — MedCentral" },
      { name: "description", content: "Browse clinics by treatment category." },
    ],
  }),
});

function CategoriesPage() {
  const { t } = useTranslation();
  const clinics = useLocalizedClinics();
  const [active, setActive] = useState<string>("all");
  const list = active === "all" ? clinics : clinics.filter((c) => c.category === active);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold md:text-4xl">{t("categories.title")}</h1>
        <p className="mt-1 text-muted-foreground">{t("categories.subtitle")}</p>

        <div className="mt-6 flex flex-wrap gap-2">
          <Button
            variant={active === "all" ? "default" : "outline"}
            size="sm"
            className="cursor-pointer rounded-xl"
            onClick={() => setActive("all")}
          >
            {t("common.all")}
          </Button>
          {CATEGORIES.map((c) => (
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

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((c) => (
            <ClinicCard key={c.id} clinic={c} />
          ))}
        </div>

        <div className="mt-10 text-sm text-muted-foreground">
          {t("categories.lookingFor")}{" "}
          <Link to="/" className="cursor-pointer text-primary underline">
            {t("categories.useAiSearch")}
          </Link>
          .
        </div>
      </section>
    </div>
  );
}
