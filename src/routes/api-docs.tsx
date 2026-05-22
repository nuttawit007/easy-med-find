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
import { addBooking } from "@/lib/bookings";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

const BASE_URL = "https://easy-med-find.lovable.app";

export const Route = createFileRoute("/api-docs")({
  component: ApiDocs,
  head: () => ({
    meta: [{ title: "API Document — MedCentral" }],
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
  const { t } = useTranslation();
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th className="px-4 py-2 text-left text-xs font-bold text-muted-foreground">
              {t("apiDocs.fieldLabel")}
            </th>
            <th className="px-4 py-2 text-left text-xs font-bold text-muted-foreground">
              {t("apiDocs.typeLabel")}
            </th>
            {showRequired && (
              <th className="px-4 py-2 text-left text-xs font-bold text-muted-foreground">
                {t("apiDocs.requiredLabel")}
              </th>
            )}
            <th className="px-4 py-2 text-left text-xs font-bold text-muted-foreground">
              {t("apiDocs.descriptionCol")}
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

// ─── GET /api/clinics ─────────────────────────────────────────────────────────

function GetClinicsPanel() {
  const { t } = useTranslation();
  const clinics = useClinics();
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTest = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 650));
    const payload = {
      clinics: clinics.map((c) => ({
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
      total: clinics.length,
    };
    setResult(JSON.stringify(payload, null, 2));
    setLoading(false);
  };

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
        { "day": "Monday", "isOpen": true, "open": "09:00", "close": "18:00" },
        { "day": "Sunday", "isOpen": false, "open": "09:00", "close": "18:00" }
      ]
    }
  ],
  "total": 5
}`;

  const responseFields = [
    ["clinics", "array", "รายการคลินิกทั้งหมด"],
    ["clinics[].id", "string", "รหัสคลินิก"],
    ["clinics[].name", "string", "ชื่อคลินิก"],
    ["clinics[].category", "string", "หมวดหมู่ (Laser, Dental, Acne ฯลฯ)"],
    ["clinics[].rating", "number", "คะแนนเฉลี่ย (1–5)"],
    ["clinics[].startingPrice", "number", "ราคาเริ่มต้น (THB)"],
    ["clinics[].promo", "string|null", "ข้อความโปรโมชั่น (ถ้ามี)"],
    ["clinics[].services", "array", "รายการบริการพร้อมราคาและระยะเวลา"],
    ["clinics[].openingHours", "array", "วันและช่วงเวลาเปิดทำการ"],
    ["total", "number", "จำนวนคลินิกทั้งหมด"],
  ];

  return (
    <div className="space-y-5 pt-1">
      <div>
        <SectionLabel>{t("apiDocs.descLabel")}</SectionLabel>
        <p className="text-sm text-foreground leading-relaxed">{t("apiDocs.getClinicsDesc")}</p>
      </div>

      <div>
        <SectionLabel>{t("apiDocs.urlPath")}</SectionLabel>
        <code className="block rounded-lg border border-border bg-muted/50 px-4 py-2.5 text-sm font-mono">
          <span className="font-bold text-emerald-500">GET</span>{" "}
          <span className="text-foreground">{BASE_URL}/api/clinics</span>
        </code>
      </div>

      <div>
        <SectionLabel>{t("apiDocs.responseBody")}</SectionLabel>
        <FieldTable rows={responseFields} />
      </div>

      <div>
        <SectionLabel>ตัวอย่าง Response</SectionLabel>
        <CodeBlock code={exampleResponse} />
      </div>

      {/* Test panel */}
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-3">
        <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">ทดสอบ API</p>
        <div className="flex items-center gap-3">
          <code className="min-w-0 flex-1 truncate rounded-lg border border-border bg-background px-3 py-2 text-xs font-mono text-muted-foreground">
            GET {BASE_URL}/api/clinics
          </code>
          <Button size="sm" onClick={handleTest} disabled={loading} className="shrink-0">
            {loading ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                {t("apiDocs.testingLabel")}
              </>
            ) : (
              <>
                <Send className="mr-1.5 h-3.5 w-3.5" />
                {t("apiDocs.sendRequest")}
              </>
            )}
          </Button>
        </div>
        {result && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span className="text-xs font-bold text-emerald-500">200 OK</span>
              <span className="text-xs text-muted-foreground">
                — {t("apiDocs.testResultLabel")}
              </span>
            </div>
            <CodeBlock code={result} maxH="320px" />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── POST /api/bookings ───────────────────────────────────────────────────────

function PostBookingPanel() {
  const { t } = useTranslation();
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
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    try {
      const service = selectedClinic?.services.find((s) => s.name === selectedService);
      const booking = addBooking({
        clinicId: selectedClinicId,
        clinicName: selectedClinic?.name ?? "",
        serviceName: selectedService,
        date,
        time,
        price: service?.price,
        patientId: user?.id ?? "guest",
        patientName,
        patientEmail,
      });
      setResult(
        JSON.stringify(
          {
            bookingId: booking.bookingId,
            status: booking.status,
            clinicId: booking.clinicId,
            clinicName: booking.clinicName,
            serviceName: booking.serviceName,
            date: booking.date,
            time: booking.time,
            price: booking.price,
            patientName: booking.patientName,
            patientEmail: booking.patientEmail,
            createdAt: booking.createdAt,
          },
          null,
          2,
        ),
      );
      setStatusCode(201);
      toast.success("การจองสำเร็จ!");
    } catch {
      setResult(JSON.stringify({ error: "Internal server error" }, null, 2));
      setStatusCode(500);
    }
    setLoading(false);
  };

  const exampleRequest = `{
  "clinicId": "c1",
  "serviceName": "Laser Hair Removal (Underarm)",
  "date": "2026-06-01",
  "time": "10:00",
  "patientName": "สมชาย ก.",
  "patientEmail": "somchai@example.com",
  "price": 990
}`;

  const exampleResponse = `{
  "bookingId": "MC-A1B2C3",
  "status": "upcoming",
  "clinicId": "c1",
  "clinicName": "Aura Skin & Laser Clinic",
  "serviceName": "Laser Hair Removal (Underarm)",
  "date": "2026-06-01",
  "time": "10:00",
  "price": 990,
  "patientName": "สมชาย ก.",
  "patientEmail": "somchai@example.com",
  "createdAt": "2026-06-01T03:00:00.000Z"
}`;

  const headerRows = [
    ["Content-Type", "application/json", "✓", ""],
    ["Authorization", "Bearer <token>", "✓", ""],
  ];

  const bodyRows = [
    ["clinicId", "string", "✓", "รหัสคลินิก (เช่น c1, c2)"],
    ["serviceName", "string", "✓", "ชื่อบริการที่ต้องการจอง"],
    ["date", "string", "✓", "วันที่นัดหมาย (รูปแบบ YYYY-MM-DD)"],
    ["time", "string", "✓", "เวลานัดหมาย (รูปแบบ HH:MM)"],
    ["patientName", "string", "✓", "ชื่อ-นามสกุลผู้ป่วย"],
    ["patientEmail", "string", "✓", "อีเมลผู้ป่วย"],
    ["price", "number", "–", "ราคาบริการ (THB) — เติมเองได้"],
  ];

  const responseRows = [
    ["bookingId", "string", "รหัสการจอง (เช่น MC-XXXXXX)"],
    ["status", "string", "สถานะ: upcoming | completed | cancelled"],
    ["clinicName", "string", "ชื่อคลินิก"],
    ["serviceName", "string", "ชื่อบริการที่จอง"],
    ["date", "string", "วันที่นัดหมาย"],
    ["time", "string", "เวลานัดหมาย"],
    ["price", "number", "ราคา (THB)"],
    ["createdAt", "string", "วันเวลาที่สร้างการจอง (ISO 8601)"],
  ];

  return (
    <div className="space-y-5 pt-1">
      <div>
        <SectionLabel>{t("apiDocs.descLabel")}</SectionLabel>
        <p className="text-sm text-foreground leading-relaxed">{t("apiDocs.postBookingDesc")}</p>
      </div>

      <div>
        <SectionLabel>{t("apiDocs.urlPath")}</SectionLabel>
        <code className="block rounded-lg border border-border bg-muted/50 px-4 py-2.5 text-sm font-mono">
          <span className="font-bold text-blue-500">POST</span>{" "}
          <span className="text-foreground">{BASE_URL}/api/bookings</span>
        </code>
      </div>

      <div>
        <SectionLabel>{t("apiDocs.headers")}</SectionLabel>
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
                  {t("apiDocs.requiredLabel")}
                </th>
              </tr>
            </thead>
            <tbody>
              {headerRows.map(([h, v, req]) => (
                <tr key={h} className="border-b border-border/60 last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-2.5 font-mono text-xs text-primary">{h}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{v}</td>
                  <td className="px-4 py-2.5 text-xs font-bold text-emerald-500">{req}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <SectionLabel>{t("apiDocs.requestBody")}</SectionLabel>
        <FieldTable rows={bodyRows} showRequired />
      </div>

      <div>
        <SectionLabel>ตัวอย่าง Request Body</SectionLabel>
        <CodeBlock code={exampleRequest} />
      </div>

      <div>
        <SectionLabel>{t("apiDocs.responseBody")} (201 Created)</SectionLabel>
        <FieldTable rows={responseRows} />
      </div>

      <div>
        <SectionLabel>ตัวอย่าง Response Body</SectionLabel>
        <CodeBlock code={exampleResponse} />
      </div>

      {/* Test panel */}
      <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 space-y-4">
        <p className="text-xs font-bold uppercase tracking-wider text-blue-600">ทดสอบ API</p>
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
                <SelectValue placeholder={t("apiDocs.selectClinic")} />
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
                <SelectValue placeholder={t("apiDocs.selectService")} />
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
              placeholder="เช่น สมชาย ก."
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">patientEmail *</Label>
            <Input
              type="email"
              className="h-9 text-xs"
              placeholder="เช่น somchai@example.com"
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
              {t("apiDocs.testingLabel")}
            </>
          ) : (
            <>
              <Send className="mr-1.5 h-3.5 w-3.5" />
              {t("apiDocs.sendRequest")}
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
                className={`text-xs font-bold ${statusCode === 201 ? "text-emerald-500" : "text-destructive"}`}
              >
                {statusCode} {statusCode === 201 ? "Created" : "Error"}
              </span>
              <span className="text-xs text-muted-foreground">
                — {t("apiDocs.testResultLabel")}
              </span>
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
              {t("apiDocs.title")}
            </h1>
            <Badge className="border-none bg-primary/10 text-primary hover:bg-primary/15 font-bold text-xs">
              {t("apiDocs.patientBadge")}
            </Badge>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{t("apiDocs.subtitle")}</p>
        </div>

        {/* Base URL */}
        <div className="mb-8 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t("apiDocs.baseUrlLabel")}
          </p>
          <code className="block rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm font-mono text-foreground">
            {BASE_URL}
          </code>
        </div>

        {/* API Endpoints */}
        <Accordion type="multiple" className="space-y-3">
          {/* GET /api/clinics */}
          <AccordionItem
            value="get-clinics"
            className="overflow-hidden rounded-2xl border border-border bg-card px-0 shadow-sm"
          >
            <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/30 transition-colors data-[state=open]:bg-muted/20">
              <div className="flex items-center gap-3 text-left">
                <MethodBadge method="GET" />
                <div>
                  <p className="font-bold text-foreground">{t("apiDocs.getClinicsTitle")}</p>
                  <p className="mt-0.5 font-mono text-xs text-muted-foreground">/api/clinics</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-6">
              <GetClinicsPanel />
            </AccordionContent>
          </AccordionItem>

          {/* POST /api/bookings */}
          <AccordionItem
            value="post-booking"
            className="overflow-hidden rounded-2xl border border-border bg-card px-0 shadow-sm"
          >
            <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/30 transition-colors data-[state=open]:bg-muted/20">
              <div className="flex items-center gap-3 text-left">
                <MethodBadge method="POST" />
                <div>
                  <p className="font-bold text-foreground">{t("apiDocs.postBookingTitle")}</p>
                  <p className="mt-0.5 font-mono text-xs text-muted-foreground">/api/bookings</p>
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
