import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, MapPin, Filter, Sparkles, ArrowRight, TrendingUp, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SiteHeader } from "@/components/site-header";
import { AIChatHero } from "@/components/ai-chat-hero";
import { ClinicCard } from "@/components/clinic-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES } from "@/lib/mock-data";
import { useLocalizedClinics } from "@/lib/clinics";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "MedCentral — Discover & Book Clinics" },
      {
        name: "description",
        content: "Find, compare and book trusted clinics near you. AI-powered recommendations.",
      },
    ],
  }),
});

function Index() {
  const { t } = useTranslation();
  const clinics = useLocalizedClinics();
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [maxPrice, setMaxPrice] = useState<string>("any");
  const [promoOnly, setPromoOnly] = useState<string>("any");

  const filtered = useMemo(() => {
    return clinics.filter((c) => {
      if (
        query &&
        !c.name.toLowerCase().includes(query.toLowerCase()) &&
        !c.category.toLowerCase().includes(query.toLowerCase())
      )
        return false;
      if (location && !c.location.toLowerCase().includes(location.toLowerCase())) return false;
      if (category !== "all" && c.category !== category) return false;
      if (maxPrice !== "any" && c.startingPrice > Number(maxPrice)) return false;
      if (promoOnly === "promo" && !c.promo) return false;
      return true;
    });
  }, [query, location, category, maxPrice, promoOnly, clinics]);

  const promos = clinics.filter((c) => c.promo).slice(0, 3);
  const recommended = [...clinics].sort((a, b) => a.distanceKm - b.distanceKm).slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-hero-gradient">
        <div className="pointer-events-none absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-primary/8 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-10 h-64 w-64 rounded-full bg-secondary/15 blur-3xl" />

        <div className="container relative mx-auto grid gap-10 px-4 py-14 lg:grid-cols-2 lg:py-24">
          <div className="flex flex-col justify-center">
            {/* Badge */}
            <span className="mb-5 inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/20 bg-primary-soft px-3.5 py-1.5 text-xs font-semibold text-primary shadow-soft">
              <Sparkles className="h-3.5 w-3.5" />
              {t("home.badge")}
            </span>

            {/* Headline */}
            <h1 className="text-4xl font-extrabold leading-[1.12] tracking-tight md:text-5xl lg:text-6xl">
              {t("home.heroTitle")}{" "}
              <span className="text-gradient-primary">{t("home.heroAccent")}</span>
            </h1>

            <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground">
              {t("home.heroSubtitle")}
            </p>

            {/* Trust stats */}
            <div className="mt-5 flex flex-wrap gap-4">
              {[
                { label: t("home.statVerifiedClinics"), value: `${clinics.length}+` },
                { label: t("home.statAvgRating"), value: "4.8 ★" },
                { label: t("home.statHappyPatients"), value: "12K+" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex items-center gap-2 rounded-2xl border border-border/60 bg-card/80 px-3.5 py-2 shadow-soft backdrop-blur-sm"
                >
                  <span className="text-base font-bold text-primary">{s.value}</span>
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="mt-7 flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="cursor-pointer rounded-2xl px-6 font-bold shadow-glow"
              >
                <a href="#search">
                  {t("home.startExploring")} <ArrowRight className="ml-1.5 h-4 w-4" />
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="cursor-pointer rounded-2xl px-6 font-bold transition-colors hover:border-primary/40 hover:bg-primary/5"
              >
                <Link to="/compare">{t("home.compareClinics")}</Link>
              </Button>
            </div>
          </div>

          <AIChatHero />
        </div>
      </section>

      {/* ── Search & Filters ── */}
      <section id="search" className="container mx-auto px-4 py-10">
        <div className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-soft">
          <div className="h-1 bg-gradient-to-r from-primary via-secondary to-primary/40" />

          <div className="p-5 sm:p-6">
            <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("home.searchPlaceholder")}
                  className="cursor-text rounded-xl border-border/60 bg-background/70 pl-10 transition-colors focus:border-primary"
                />
              </div>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={t("home.locationPlaceholder")}
                  className="cursor-text rounded-xl border-border/60 bg-background/70 pl-10 transition-colors focus:border-primary"
                />
              </div>
              <Button size="lg" className="cursor-pointer rounded-xl font-semibold shadow-soft">
                <Search className="mr-2 h-4 w-4" /> {t("common.search")}
              </Button>
            </div>

            {/* Filters */}
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/50 pt-4">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <Filter className="h-3.5 w-3.5" /> {t("common.filters")}
              </span>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-9 w-[145px] cursor-pointer rounded-xl border-border/60 text-xs">
                  <SelectValue placeholder={t("home.category")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("home.allCategories")}</SelectItem>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {t(`cat.${c}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={maxPrice} onValueChange={setMaxPrice}>
                <SelectTrigger className="h-9 w-[145px] cursor-pointer rounded-xl border-border/60 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">{t("home.anyPrice")}</SelectItem>
                  <SelectItem value="1000">{"< ฿1,000"}</SelectItem>
                  <SelectItem value="2000">{"< ฿2,000"}</SelectItem>
                  <SelectItem value="5000">{"< ฿5,000"}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={promoOnly} onValueChange={setPromoOnly}>
                <SelectTrigger className="h-9 w-[165px] cursor-pointer rounded-xl border-border/60 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">{t("home.promotionsAll")}</SelectItem>
                  <SelectItem value="promo">{t("home.promotionsOnly")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* ── Hot Promotions ── */}
      <section className="container mx-auto px-4 pb-8">
        <SectionHeader
          icon={<TrendingUp className="h-5 w-5 text-secondary-foreground" />}
          iconBg="bg-secondary"
          title={t("home.hotPromotions")}
          subtitle={t("home.hotPromotionsSub")}
        />
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {promos.map((c) => (
            <ClinicCard key={c.id} clinic={c} />
          ))}
        </div>
      </section>

      {/* ── Recommended ── */}
      <section className="container mx-auto px-4 py-8">
        <SectionHeader
          icon={<Star className="h-5 w-5 text-primary-foreground" />}
          iconBg="bg-primary"
          title={t("home.recommended")}
          subtitle={t("home.recommendedSub")}
        />
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {recommended.map((c) => (
            <ClinicCard key={c.id} clinic={c} />
          ))}
        </div>
      </section>

      {/* ── All Clinics ── */}
      <section className="container mx-auto px-4 pb-24">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {t("home.allClinics")}{" "}
            <span className="ml-1.5 rounded-full bg-primary-soft px-2.5 py-0.5 text-sm font-bold text-primary">
              {filtered.length}
            </span>
          </h2>
        </div>
        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center">
            <Search className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="font-semibold text-muted-foreground">{t("home.noResults")}</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((c) => (
              <ClinicCard key={c.id} clinic={c} />
            ))}
          </div>
        )}
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border/60 bg-card/60 py-10 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm font-medium text-muted-foreground">{t("home.footer")}</p>
        </div>
      </footer>
    </div>
  );
}

function SectionHeader({
  icon,
  iconBg,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ${iconBg} shadow-soft`}
      >
        {icon}
      </div>
      <div>
        <h2 className="text-2xl font-bold leading-snug">{title}</h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}
