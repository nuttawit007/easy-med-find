import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { ClinicCard } from "@/components/clinic-card";
import { clinics, CATEGORIES } from "@/lib/mock-data";
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
  const [active, setActive] = useState<string>("all");
  const list = active === "all" ? clinics : clinics.filter((c) => c.category === active);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold md:text-4xl">Browse by category</h1>
        <p className="mt-1 text-muted-foreground">Explore clinics by the treatment you need.</p>

        <div className="mt-6 flex flex-wrap gap-2">
          <Button variant={active === "all" ? "default" : "outline"} size="sm" onClick={() => setActive("all")}>All</Button>
          {CATEGORIES.map((c) => (
            <Button key={c} variant={active === c ? "default" : "outline"} size="sm" onClick={() => setActive(c)}>{c}</Button>
          ))}
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((c) => <ClinicCard key={c.id} clinic={c} />)}
        </div>

        <div className="mt-10 text-sm text-muted-foreground">
          Looking for something specific? <Link to="/" className="text-primary underline">Use AI search</Link>.
        </div>
      </section>
    </div>
  );
}
