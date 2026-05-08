import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { ClinicCard } from "@/components/clinic-card";
import { clinics } from "@/lib/mock-data";

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
  const promos = clinics.filter((c) => c.promo);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold md:text-4xl">🔥 Hot promotions</h1>
        <p className="mt-1 text-muted-foreground">Limited-time offers from top-rated clinics.</p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {promos.map((c) => <ClinicCard key={c.id} clinic={c} />)}
        </div>
      </section>
    </div>
  );
}
