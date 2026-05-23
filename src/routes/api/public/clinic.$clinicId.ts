import { createFileRoute } from "@tanstack/react-router";
import { clinics } from "@/lib/mock-data";
import { CORS_HEADERS, jsonResponse } from "@/lib/cors";

export const Route = createFileRoute("/api/public/clinic/$clinicId")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS_HEADERS }),
      GET: async ({ params }) => {
        const clinic = clinics.find((c) => c.id === params.clinicId);
        if (!clinic) {
          return jsonResponse({ error: `Clinic not found: ${params.clinicId}` }, 404);
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
      },
    },
  },
});
