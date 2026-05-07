import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, MapPin, Filter, Sparkles, ArrowRight } from "lucide-react";
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
import { clinics, CATEGORIES } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "ClinicCompare — Discover & Book Clinics" },
      { name: "description", content: "Find, compare and book trusted clinics near you. AI-powered recommendations." },
    ],
  }),
});

function Index() {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [maxPrice, setMaxPrice] = useState<string>("any");
  const [promoOnly, setPromoOnly] = useState<string>("any");

  const filtered = useMemo(() => {
    return clinics.filter((c) => {
      if (query && !c.name.toLowerCase().includes(query.toLowerCase()) && !c.category.toLowerCase().includes(query.toLowerCase())) return false;
      if (location && !c.location.toLowerCase().includes(location.toLowerCase())) return false;
      if (category !== "all" && c.category !== category) return false;
      if (maxPrice !== "any" && c.startingPrice > Number(maxPrice)) return false;
      if (promoOnly === "promo" && !c.promo) return false;
      return true;
    });
  }, [query, location, category, maxPrice, promoOnly]);

  const promos = clinics.filter((c) => c.promo).slice(0, 3);
  const recommended = [...clinics].sort((a, b) => a.distanceKm - b.distanceKm).slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="bg-hero-gradient">
        <div className="container mx-auto grid gap-10 px-4 py-12 lg:grid-cols-2 lg:py-20">
          <div className="flex flex-col justify-center">
            <span className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" /> AI-powered clinic finder
            </span>
            <h1 className="text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
              Find the right clinic.{" "}
              <span className="text-gradient-primary">Skip the wait.</span>
            </h1>
            <p className="mt-4 max-w-lg text-lg text-muted-foreground">
              Compare verified clinics, read real reviews, and book appointments in seconds — guided by an AI assistant that understands your needs.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg" className="shadow-glow">
                <a href="#search">
                  Start exploring <ArrowRight className="ml-1 h-4 w-4" />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/compare">Compare clinics</Link>
              </Button>
            </div>
          </div>
          <AIChatHero />
        </div>
      </section>

      {/* Search */}
      <section id="search" className="container mx-auto px-4 py-10">
        <div className="rounded-3xl border border-border bg-card p-4 shadow-soft sm:p-6">
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Clinic name or procedure" className="pl-9" />
            </div>
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location (e.g. Sukhumvit)" className="pl-9" />
            </div>
            <Button size="lg" className="shadow-soft">
              <Search className="mr-2 h-4 w-4" /> Search
            </Button>
          </div>

          {/* Filters */}
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
            <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
              <Filter className="h-3.5 w-3.5" /> Filters
            </span>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-9 w-[140px]"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={maxPrice} onValueChange={setMaxPrice}>
              <SelectTrigger className="h-9 w-[140px]"><SelectValue placeholder="Price" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any price</SelectItem>
                <SelectItem value="1000">Under ฿1,000</SelectItem>
                <SelectItem value="2000">Under ฿2,000</SelectItem>
                <SelectItem value="5000">Under ฿5,000</SelectItem>
              </SelectContent>
            </Select>
            <Select value={promoOnly} onValueChange={setPromoOnly}>
              <SelectTrigger className="h-9 w-[160px]"><SelectValue placeholder="Promotions" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="any">All clinics</SelectItem>
                <SelectItem value="promo">With promotions</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Hot promotions */}
      <section className="container mx-auto px-4 pb-6">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold">🔥 Hot promotions</h2>
            <p className="text-sm text-muted-foreground">Limited-time offers from top-rated clinics</p>
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {promos.map((c) => <ClinicCard key={c.id} clinic={c} />)}
        </div>
      </section>

      {/* Recommended */}
      <section className="container mx-auto px-4 py-10">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold">📍 Recommended near you</h2>
            <p className="text-sm text-muted-foreground">Based on your location and preferences</p>
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {recommended.map((c) => <ClinicCard key={c.id} clinic={c} />)}
        </div>
      </section>

      {/* Filtered results */}
      <section className="container mx-auto px-4 pb-20">
        <h2 className="mb-4 text-2xl font-bold">All clinics ({filtered.length})</h2>
        {filtered.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
            No clinics match your filters. Try clearing them.
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((c) => <ClinicCard key={c.id} clinic={c} />)}
          </div>
        )}
      </section>

      <footer className="border-t border-border bg-card/50 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2026 ClinicCompare · Trusted clinics, transparent pricing.
        </div>
      </footer>
    </div>
  );
}
