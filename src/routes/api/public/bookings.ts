import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { clinics } from "@/lib/mock-data";
import { CORS_HEADERS, jsonResponse } from "@/lib/cors";

const BookingSchema = z.object({
  clinicId: z.string().min(1).max(64),
  serviceName: z.string().min(1).max(255),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "time must be HH:MM"),
  patientName: z.string().min(1).max(255),
  patientEmail: z.string().email().max(255),
  patientPhone: z.string().max(32).optional(),
  price: z.number().nonnegative().optional(),
  note: z.string().max(1000).optional(),
});

function generateBookingId(): string {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  const ts = Date.now().toString(36).slice(-4).toUpperCase();
  return `MC-${ts}${rand}`;
}

export const Route = createFileRoute("/api/public/bookings")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS_HEADERS }),
      POST: async ({ request }) => {
        let raw: unknown;
        try {
          raw = await request.json();
        } catch {
          return jsonResponse({ error: "Invalid JSON body" }, 400);
        }

        const parsed = BookingSchema.safeParse(raw);
        if (!parsed.success) {
          return jsonResponse(
            {
              error: "Validation failed",
              issues: parsed.error.issues.map((i) => ({
                path: i.path.join("."),
                message: i.message,
              })),
            },
            400,
          );
        }
        const data = parsed.data;

        const clinic = clinics.find((c) => c.id === data.clinicId);
        if (!clinic) {
          return jsonResponse({ error: `Clinic not found: ${data.clinicId}` }, 404);
        }

        const service = clinic.services.find((s) => s.name === data.serviceName);
        if (!service) {
          return jsonResponse(
            {
              error: `Service not found for clinic ${clinic.id}: ${data.serviceName}`,
              availableServices: clinic.services.map((s) => s.name),
            },
            404,
          );
        }

        const booking = {
          bookingId: generateBookingId(),
          status: "upcoming" as const,
          clinicId: clinic.id,
          clinicName: clinic.name,
          serviceName: service.name,
          date: data.date,
          time: data.time,
          price: data.price ?? service.price,
          patientName: data.patientName,
          patientEmail: data.patientEmail,
          patientPhone: data.patientPhone ?? null,
          note: data.note ?? null,
          createdAt: new Date().toISOString(),
        };

        return jsonResponse(booking, 201);
      },
    },
  },
});
