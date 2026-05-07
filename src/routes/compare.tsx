import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Star, X } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { clinics, getClinic } from "@/lib/mock-data";

export const Route = createFileRoute("/compare")({
  component: ComparePage,
  head: () => ({
    meta: [
      { title: "Compare clinics — ClinicCompare" },
      { name: "description", content: "Compare up to 3 clinics side by side: ratings, prices, promos, distance." },
    ],
  }),
});

function ComparePage() {
  const [ids, setIds] = useState<string[]>([clinics[0].id, clinics[1].id, clinics[3].id]);

  const set = (i: number, val: string) => {
    setIds((arr) => {
      const next = [...arr];
      next[i] = val;
      return next;
    });
  };

  const selected = ids.map((id) => getClinic(id)).filter(Boolean);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold md:text-4xl">Compare clinics side-by-side</h1>
        <p className="mt-2 text-muted-foreground">Pick up to 3 clinics to compare ratings, pricing and services.</p>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Select key={i} value={ids[i]} onValueChange={(v) => set(i, v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {clinics.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          ))}
        </div>

        <div className="mt-8 overflow-x-auto rounded-2xl border border-border bg-card shadow-soft">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="p-4 text-left font-medium text-muted-foreground">Criteria</th>
                {selected.map((c) => (
                  <th key={c!.id} className="p-4 text-left">
                    <div className="flex items-center gap-3">
                      <img src={c!.thumbnail} alt={c!.name} className="h-12 w-12 rounded-lg object-cover" />
                      <div>
                        <p className="font-semibold">{c!.name}</p>
                        <p className="text-xs text-muted-foreground">{c!.category}</p>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <Row label="Overall rating">
                {selected.map((c) => (
                  <td key={c!.id} className="p-4">
                    <div className="flex items-center gap-1 font-medium">
                      <Star className="h-4 w-4 fill-warning text-warning" /> {c!.rating}
                      <span className="ml-1 text-xs text-muted-foreground">({c!.reviews})</span>
                    </div>
                  </td>
                ))}
              </Row>
              <Row label="Current promo">
                {selected.map((c) => (
                  <td key={c!.id} className="p-4">
                    {c!.promo ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                        <Check className="h-3 w-3" /> {c!.promo}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><X className="h-3 w-3" /> No active promo</span>
                    )}
                  </td>
                ))}
              </Row>
              <Row label="Starting price">
                {selected.map((c) => (
                  <td key={c!.id} className="p-4 font-semibold text-primary">฿{c!.startingPrice.toLocaleString()}</td>
                ))}
              </Row>
              <Row label="Location / Distance">
                {selected.map((c) => (
                  <td key={c!.id} className="p-4">
                    <p>{c!.location}</p>
                    <p className="text-xs text-muted-foreground">{c!.distanceKm} km away</p>
                  </td>
                ))}
              </Row>
              <Row label="Key services">
                {selected.map((c) => (
                  <td key={c!.id} className="p-4">
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      {c!.services.slice(0, 3).map((s) => (
                        <li key={s.name}>• {s.name}</li>
                      ))}
                    </ul>
                  </td>
                ))}
              </Row>
              <Row label="">
                {selected.map((c) => (
                  <td key={c!.id} className="p-4">
                    <Button asChild size="sm" className="w-full">
                      <Link to="/clinic/$clinicId" params={{ clinicId: c!.id }}>Book now</Link>
                    </Button>
                  </td>
                ))}
              </Row>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <tr className="border-b border-border last:border-0">
      <td className="p-4 align-top font-medium text-muted-foreground">{label}</td>
      {children}
    </tr>
  );
}
