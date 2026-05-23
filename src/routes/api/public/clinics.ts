import { createFileRoute } from "@tanstack/react-router";
import { clinics } from "@/lib/mock-data";
import { CORS_HEADERS, jsonResponse } from "@/lib/cors";

export const Route = createFileRoute("/api/public/clinics")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS_HEADERS }),
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const clinicId = url.searchParams.get("clinicId");
        const category = url.searchParams.get("category");
        const q = url.searchParams.get("q")?.toLowerCase();

        // Single clinic lookup by ?clinicId=
        if (clinicId) {
          const clinic = clinics.find((c) => c.id === clinicId);
          if (!clinic) {
            return jsonResponse({ error: `Clinic not found: ${clinicId}` }, 404);
          }
          return jsonResponse({
            id: clinic.id,
            name: clinic.name,
            category: clinic.category,
            rating: clinic.rating,
            reviews: clinic.reviews,
            location: clinic.location,
            distanceKm: clinic.distanceKm,
            startingPrice: clinic.startingPrice,
            promo: clinic.promo ?? null,
            verified: clinic.verified ?? false,
            phone: clinic.phone ?? null,
            email: clinic.email ?? null,
            services: clinic.services,
            openingHours: clinic.openingHours ?? [],
          });
        }

        // List clinics with optional filters
        let list = clinics;
        if (category) list = list.filter((c) => c.category.toLowerCase() === category.toLowerCase());
        if (q) list = list.filter((c) => c.name.toLowerCase().includes(q) || c.location.toLowerCase().includes(q));

        const payload = {
          clinics: list.map((c) => ({
            id: c.id,
            name: c.name,
            category: c.category,
            rating: c.rating,
            reviews: c.reviews,
            location: c.location,
            distanceKm: c.distanceKm,
            startingPrice: c.startingPrice,
            promo: c.promo ?? null,
            verified: c.verified ?? false,
            phone: c.phone ?? null,
            email: c.email ?? null,
            services: c.services,
            openingHours: c.openingHours ?? [],
          })),
          total: list.length,
        };
        return jsonResponse(payload);
      },
    },
  },
});
