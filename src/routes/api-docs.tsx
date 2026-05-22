import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Code2,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useClinics } from "@/lib/clinics";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

// Stable production URL — safe for Postman / Botnoi / cron / webhooks.
// The preview URL also works during development but may change.
const BASE_URL =
  typeof window !== "undefined" && window.location.origin
    ? window.location.origin
    : "https://easy-med-find.lovable.app";

const CLINICS_PATH = "/api/public/clinics";
const BOOKINGS_PATH = "/api/public/bookings";

export const Route = createFileRoute("/api-docs")({
  component: ApiDocs,
  head: () => ({
    meta: [{ title: "API Documentation — MedCentral" }],
  }),
});

// ─── Shared UI helpers ────────────────────────────────────────────────────────

function CodeBlock({ code, maxH = "400px" }: { code: string; maxH?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleCopy}
        className="absolute right-2 top-2 z-10 rounded-md border border-white/10 bg-white/5 p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white"
        title="Copy"
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
      <pre
        className="overflow-auto rounded-xl bg-zinc-900 p-4 pr-10 text-xs text-emerald-400 font-mono leading-relaxed"
        style={{ maxHeight: maxH }}
      >
        {code}
      </pre>
    </div>
  );
}

function MethodBadge({ method }: { method: "GET" | "POST" }) {
  if (method === "GET")
    return (
      <span className="shrink-0 rounded-md border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-1 text-xs font-bold text-emerald-500">
        GET
      </span>
    );
  return (
    <span className="shrink-0 rounded-md border border-blue-500/30 bg-blue-500/15 px-2.5 py-1 text-xs font-bold text-blue-500">
      POST
    </span>
  );
}

function FieldTable({ rows, showRequired = false }: { rows: string[][]; showRequired?: boolean }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th className="px-4 py-2 text-left text-xs font-bold text-muted-foreground">Field</th>
            <th className="px-4 py-2 text-left text-xs font-bold text-muted-foreground">Type</th>
            {showRequired && (
              <th className="px-4 py-2 text-left text-xs font-bold text-muted-foreground">
                Required
              </th>
            )}
            <th className="px-4 py-2 text-left text-xs font-bold text-muted-foreground">
              Description
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[0]} className="border-b border-border/60 last:border-0 hover:bg-muted/20">
              <td className="px-4 py-2.5 font-mono text-xs text-primary">{row[0]}</td>
              <td className="px-4 py-2.5 text-xs text-amber-500">{row[1]}</td>
              {showRequired && (
                <td className="px-4 py-2.5 text-xs font-bold text-emerald-500">{row[2]}</td>
              )}
              <td className="px-4 py-2.5 text-xs text-muted-foreground">
                {showRequired ? row[3] : row[2]}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
      {children}
    </p>
  );
}

// ─── GET /api/public/clinics ──────────────────────────────────────────────────

function GetClinicsPanel() {
  const [result, setResult] = useState<string | null>(null);
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("");

  const url = `${BASE_URL}${CLINICS_PATH}${category ? `?category=${encodeURIComponent(category)}` : ""}`;

  const handleTest = async () => {
    setLoading(true);
    setResult(null);
    setStatusCode(null);
    try {
      const res = await fetch(url, { method: "GET", headers: { Accept: "application/json" } });
      setStatusCode(res.status);
      const text = await res.text();
      try {
        setResult(JSON.stringify(JSON.parse(text), null, 2));
      } catch {
        setResult(text);
      }
    } catch (err) {
      setStatusCode(0);
      setResult(JSON.stringify({ error: String(err) }, null, 2));
    }
    setLoading(false);
  };

  const curlExample = `curl -X GET "${BASE_URL}${CLINICS_PATH}" \\
  -H "Accept: application/json"`;

  const queryRows = [
    ["category", "string", "–", "Filter by category (Laser, Dental, Acne, Facial, Skin, Hair)"],
    ["q", "string", "–", "Free-text search across clinic name and location"],
  ];

  const responseFields = [
    ["clinics", "array", "List of clinics"],
    ["clinics[].id", "string", "Clinic ID (e.g. c1, c2)"],
    ["clinics[].name", "string", "Clinic name"],
    ["clinics[].category", "string", "Category"],
    ["clinics[].rating", "number", "Average rating (1–5)"],
    ["clinics[].reviews", "number", "Number of reviews"],
    ["clinics[].location", "string", "Location text"],
    ["clinics[].startingPrice", "number", "Starting price (THB)"],
    ["clinics[].promo", "string|null", "Promotion text, or null"],
    ["clinics[].verified", "boolean", "Whether the clinic is verified"],
    ["clinics[].services", "array", "Services with name, price, durationMin"],
    ["clinics[].openingHours", "array", "Opening hours per day"],
    ["total", "number", "Total clinics returned"],
  ];

  const exampleResponse = `{
  "clinics": [
    {
      "id": "c1",
      "name": "Aura Skin & Laser Clinic",
      "category": "Laser",
      "rating": 4.8,
      "reviews": 1284,
      "location": "Sukhumvit, Bangkok",
      "distanceKm": 1.2,
      "startingPrice": 990,
      "promo": "30% off first laser session",
      "verified": true,
      "phone": null,
      "email": null,
      "services": [
        { "name": "Laser Hair Removal (Underarm)", "price": 990, "durationMin": 30 },
        { "name": "Pico Laser Full Face", "price": 3500, "durationMin": 45 }
      ],
      "openingHours": [
        { "day": "Monday", "isOpen": true, "open": "09:00", "close": "18:00" }
      ]
    }
  ],
  "total": 5
}`;

  return (
    <div className="space-y-5 pt-1">
      <div>
        <SectionLabel>Description</SectionLabel>
        <p className="text-sm text-foreground leading-relaxed">
          Returns the list of clinics available on MedCentral. Public endpoint — no
          authentication required. Safe to call from Postman, Botnoi.ai, n8n, Zapier, or
          any HTTP client.
        </p>
      </div>

      <div>
        <SectionLabel>Endpoint</SectionLabel>
        <code className="block rounded-lg border border-border bg-muted/50 px-4 py-2.5 text-sm font-mono">
          <span className="font-bold text-emerald-500">GET</span>{" "}
          <span className="text-foreground">{BASE_URL}{CLINICS_PATH}</span>
        </code>
      </div>

      <div>
        <SectionLabel>Headers</SectionLabel>
        <p className="text-xs text-muted-foreground mb-2">
          No authentication required. <code className="font-mono">Accept: application/json</code> is
          recommended but optional.
        </p>
      </div>

      <div>
        <SectionLabel>Query Parameters (optional)</SectionLabel>
        <FieldTable rows={queryRows} showRequired />
      </div>

      <div>
        <SectionLabel>cURL example (Postman → Import → Raw text)</SectionLabel>
        <CodeBlock code={curlExample} />
      </div>

      <div>
        <SectionLabel>Response (200 OK)</SectionLabel>
        <FieldTable rows={responseFields} />
      </div>

      <div>
        <SectionLabel>Example response body</SectionLabel>
        <CodeBlock code={exampleResponse} />
      </div>

      {/* Live test */}
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-3">
        <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
          Live test (real request)
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Input
            className="h-9 text-xs flex-1 min-w-[180px]"
            placeholder="category (optional)"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
          <code className="min-w-0 flex-1 truncate rounded-lg border border-border bg-background px-3 py-2 text-xs font-mono text-muted-foreground">
            GET {url}
          </code>
          <Button size="sm" onClick={handleTest} disabled={loading} className="shrink-0">
            {loading ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Sending…
              </>
            ) : (
              <>
                <Send className="mr-1.5 h-3.5 w-3.5" />
                Send request
              </>
            )}
          </Button>
        </div>
        {result && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {statusCode && statusCode >= 200 && statusCode < 300 ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-destructive" />
              )}
              <span
                className={`text-xs font-bold ${
                  statusCode && statusCode >= 200 && statusCode < 300
                    ? "text-emerald-500"
                    : "text-destructive"
                }`}
              >
                {statusCode ?? "ERR"}
              </span>
              <span className="text-xs text-muted-foreground">— response from server</span>
            </div>
            <CodeBlock code={result} maxH="320px" />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── POST /api/public/bookings ────────────────────────────────────────────────

function PostBookingPanel() {
  const clinics = useClinics();
  const { user } = useAuth();

  const [selectedClinicId, setSelectedClinicId] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [date, setDate] = useState("2026-06-01");
  const [time, setTime] = useState("10:00");
  const [patientName, setPatientName] = useState(user?.name ?? "");
  const [patientEmail, setPatientEmail] = useState(user?.email ?? "");

  const [result, setResult] = useState<string | null>(null);
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const selectedClinic = clinics.find((c) => c.id === selectedClinicId);

  const handleTest = async () => {
    if (!selectedClinicId || !selectedService || !date || !time || !patientName || !patientEmail) {
      toast.error("Please fill in all required fields");
      return;
    }
    setLoading(true);
    setResult(null);
    setStatusCode(null);
    try {
      const service = selectedClinic?.services.find((s) => s.name === selectedService);
      const body = {
        clinicId: selectedClinicId,
        serviceName: selectedService,
        date,
        time,
        patientName,
        patientEmail,
        price: service?.price,
      };
      const res = await fetch(`${BASE_URL}${BOOKINGS_PATH}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(body),
      });
      setStatusCode(res.status);
      const text = await res.text();
      try {
        setResult(JSON.stringify(JSON.parse(text), null, 2));
      } catch {
        setResult(text);
      }
      if (res.status === 201) toast.success("Booking created!");
      else toast.error(`Request failed: ${res.status}`);
    } catch (err) {
      setStatusCode(0);
      setResult(JSON.stringify({ error: String(err) }, null, 2));
    }
    setLoading(false);
  };

  const exampleRequest = `{
  "clinicId": "c1",
  "serviceName": "Laser Hair Removal (Underarm)",
  "date": "2026-06-01",
  "time": "10:00",
  "patientName": "Somchai K.",
  "patientEmail": "somchai@example.com",
  "patientPhone": "+66812345678",
  "price": 990,
  "note": "First visit"
}`;

  const exampleResponse = `{
  "bookingId": "MC-A1B2C3D4",
  "status": "upcoming",
  "clinicId": "c1",
  "clinicName": "Aura Skin & Laser Clinic",
  "serviceName": "Laser Hair Removal (Underarm)",
  "date": "2026-06-01",
  "time": "10:00",
  "price": 990,
  "patientName": "Somchai K.",
  "patientEmail": "somchai@example.com",
  "patientPhone": "+66812345678",
  "note": "First visit",
  "createdAt": "2026-06-01T03:00:00.000Z"
}`;

  const curlExample = `curl -X POST "${BASE_URL}${BOOKINGS_PATH}" \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json" \\
  -d '${exampleRequest.replace(/\n/g, "")}'`;

  const headerRows = [
    ["Content-Type", "application/json", "✓", "Required for the JSON body to be parsed"],
    ["Accept", "application/json", "–", "Recommended"],
  ];

  const bodyRows = [
    ["clinicId", "string", "✓", "Clinic ID — must match one returned by GET /api/public/clinics"],
    ["serviceName", "string", "✓", "Must match an entry in clinic.services[].name exactly"],
    ["date", "string", "✓", "Appointment date in YYYY-MM-DD"],
    ["time", "string", "✓", "Appointment time in 24h HH:MM"],
    ["patientName", "string", "✓", "Patient full name (max 255)"],
    ["patientEmail", "string", "✓", "Valid email address"],
    ["patientPhone", "string", "–", "Optional phone number (max 32 chars)"],
    ["price", "number", "–", "Override price in THB. Defaults to the service price."],
    ["note", "string", "–", "Optional note for the clinic (max 1000 chars)"],
  ];

  const responseRows = [
    ["bookingId", "string", "Generated booking reference (MC-XXXXXXXX)"],
    ["status", "string", "Always 'upcoming' for new bookings"],
    ["clinicId", "string", "Echo of clinic ID"],
    ["clinicName", "string", "Resolved clinic name"],
    ["serviceName", "string", "Resolved service name"],
    ["date", "string", "Echo of date"],
    ["time", "string", "Echo of time"],
    ["price", "number", "Resolved price in THB"],
    ["createdAt", "string", "Creation timestamp (ISO 8601 UTC)"],
  ];

  const errorRows = [
    ["400", "Invalid JSON body, or Zod validation failed. Response: { error, issues[] }"],
    ["404", "Unknown clinicId, or serviceName not offered by that clinic"],
    ["500", "Server error"],
  ];

  return (
    <div className="space-y-5 pt-1">
      <div>
        <SectionLabel>Description</SectionLabel>
        <p className="text-sm text-foreground leading-relaxed">
          Create a new appointment booking. Public endpoint — no authentication required.
          Validates the clinic and service against the live MedCentral catalog and returns the
          generated booking reference.
        </p>
      </div>

      <div>
        <SectionLabel>Endpoint</SectionLabel>
        <code className="block rounded-lg border border-border bg-muted/50 px-4 py-2.5 text-sm font-mono">
          <span className="font-bold text-blue-500">POST</span>{" "}
          <span className="text-foreground">{BASE_URL}{BOOKINGS_PATH}</span>
        </code>
      </div>

      <div>
        <SectionLabel>Headers</SectionLabel>
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-2 text-left text-xs font-bold text-muted-foreground">
                  Header
                </th>
                <th className="px-4 py-2 text-left text-xs font-bold text-muted-foreground">
                  Value
                </th>
                <th className="px-4 py-2 text-left text-xs font-bold text-muted-foreground">
                  Required
                </th>
                <th className="px-4 py-2 text-left text-xs font-bold text-muted-foreground">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody>
              {headerRows.map(([h, v, req, note]) => (
                <tr key={h} className="border-b border-border/60 last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-2.5 font-mono text-xs text-primary">{h}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{v}</td>
                  <td className="px-4 py-2.5 text-xs font-bold text-emerald-500">{req}</td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">{note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <SectionLabel>Request body (JSON)</SectionLabel>
        <FieldTable rows={bodyRows} showRequired />
      </div>

      <div>
        <SectionLabel>Example request body</SectionLabel>
        <CodeBlock code={exampleRequest} />
      </div>

      <div>
        <SectionLabel>cURL example (Postman → Import → Raw text)</SectionLabel>
        <CodeBlock code={curlExample} />
      </div>

      <div>
        <SectionLabel>Response (201 Created)</SectionLabel>
        <FieldTable rows={responseRows} />
      </div>

      <div>
        <SectionLabel>Example response body</SectionLabel>
        <CodeBlock code={exampleResponse} />
      </div>

      <div>
        <SectionLabel>Error responses</SectionLabel>
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-2 text-left text-xs font-bold text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-2 text-left text-xs font-bold text-muted-foreground">
                  Meaning
                </th>
              </tr>
            </thead>
            <tbody>
              {errorRows.map(([code, msg]) => (
                <tr key={code} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-2.5 font-mono text-xs text-destructive font-bold">{code}</td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">{msg}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live test */}
      <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 space-y-4">
        <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
          Live test (real request)
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">clinicId *</Label>
            <Select
              value={selectedClinicId}
              onValueChange={(v) => {
                setSelectedClinicId(v);
                setSelectedService("");
              }}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Select a clinic" />
              </SelectTrigger>
              <SelectContent>
                {clinics.map((c) => (
                  <SelectItem key={c.id} value={c.id} className="text-xs">
                    [{c.id}] {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">serviceName *</Label>
            <Select
              value={selectedService}
              onValueChange={setSelectedService}
              disabled={!selectedClinicId}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
              <SelectContent>
                {selectedClinic?.services.map((s) => (
                  <SelectItem key={s.name} value={s.name} className="text-xs">
                    {s.name} · ฿{s.price.toLocaleString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">date *</Label>
            <Input
              type="date"
              className="h-9 text-xs"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">time *</Label>
            <Input
              type="time"
              className="h-9 text-xs"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">patientName *</Label>
            <Input
              className="h-9 text-xs"
              placeholder="e.g. Somchai K."
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">patientEmail *</Label>
            <Input
              type="email"
              className="h-9 text-xs"
              placeholder="e.g. somchai@example.com"
              value={patientEmail}
              onChange={(e) => setPatientEmail(e.target.value)}
            />
          </div>
        </div>

        <Button
          size="sm"
          onClick={handleTest}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white border-none"
        >
          {loading ? (
            <>
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              Sending…
            </>
          ) : (
            <>
              <Send className="mr-1.5 h-3.5 w-3.5" />
              Send request
            </>
          )}
        </Button>

        {result && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {statusCode === 201 ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-destructive" />
              )}
              <span
                className={`text-xs font-bold ${
                  statusCode === 201 ? "text-emerald-500" : "text-destructive"
                }`}
              >
                {statusCode ?? "ERR"} {statusCode === 201 ? "Created" : ""}
              </span>
              <span className="text-xs text-muted-foreground">— response from server</span>
            </div>
            <CodeBlock code={result} maxH="280px" />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function ApiDocs() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <section className="container mx-auto max-w-4xl px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/auth"
            className="mb-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {t("apiDocs.backToLogin")}
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Code2 className="h-5 w-5" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-foreground">
              API Documentation
            </h1>
            <Badge className="border-none bg-primary/10 text-primary hover:bg-primary/15 font-bold text-xs">
              Public · No auth
            </Badge>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Real, externally-callable REST endpoints. Tested with Postman and Botnoi.ai. CORS is
            enabled (<code className="font-mono">*</code>) so requests work from any origin.
          </p>
        </div>

        {/* Base URL */}
        <div className="mb-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Base URL
          </p>
          <code className="block rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm font-mono text-foreground">
            {BASE_URL}
          </code>
          <p className="mt-2 text-xs text-muted-foreground">
            For production integrations (Postman collections, Botnoi.ai webhooks, cron) use the
            stable URL: <code className="font-mono">https://easy-med-find.lovable.app</code>
          </p>
        </div>

        {/* Quick-start for Botnoi / Postman */}
        <div className="mb-8 rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Quick start
          </p>
          <ol className="list-decimal pl-5 text-sm text-foreground space-y-1.5">
            <li>
              <strong>Postman:</strong> New → HTTP Request → paste the cURL example below into
              Import → Raw text.
            </li>
            <li>
              <strong>Botnoi.ai:</strong> Add an <em>HTTP Request</em> action. Method = POST,
              URL = <code className="font-mono">{BASE_URL}{BOOKINGS_PATH}</code>, Header
              <code className="font-mono"> Content-Type: application/json</code>, paste the JSON
              body, map dynamic values to chatbot variables.
            </li>
            <li>
              No API key, no bearer token, no signature required for these public endpoints.
            </li>
          </ol>
        </div>

        {/* API Endpoints */}
        <Accordion type="multiple" defaultValue={["get-clinics", "post-booking"]} className="space-y-3">
          <AccordionItem
            value="get-clinics"
            className="overflow-hidden rounded-2xl border border-border bg-card px-0 shadow-sm"
          >
            <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/30 transition-colors data-[state=open]:bg-muted/20">
              <div className="flex items-center gap-3 text-left">
                <MethodBadge method="GET" />
                <div>
                  <p className="font-bold text-foreground">List clinics</p>
                  <p className="mt-0.5 font-mono text-xs text-muted-foreground">{CLINICS_PATH}</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-6">
              <GetClinicsPanel />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem
            value="post-booking"
            className="overflow-hidden rounded-2xl border border-border bg-card px-0 shadow-sm"
          >
            <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/30 transition-colors data-[state=open]:bg-muted/20">
              <div className="flex items-center gap-3 text-left">
                <MethodBadge method="POST" />
                <div>
                  <p className="font-bold text-foreground">Create booking</p>
                  <p className="mt-0.5 font-mono text-xs text-muted-foreground">{BOOKINGS_PATH}</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-6">
              <PostBookingPanel />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
    </div>
  );
}
