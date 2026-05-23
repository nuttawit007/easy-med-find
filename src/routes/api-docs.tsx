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

const BASE_URL = "https://easy-med-find.lovable.app";

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
        className="absolute right-2 top-2 z-10 cursor-pointer rounded-md border border-white/10 bg-white/5 p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white"
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

function UrlBlock({ method, path }: { method: "GET" | "POST"; path: string }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(`${BASE_URL}${path}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="flex items-center gap-2">
      <code className="flex-1 min-w-0 rounded-lg border border-border bg-muted/50 px-4 py-2.5 text-sm font-mono">
        <span className={`font-bold ${method === "GET" ? "text-emerald-500" : "text-blue-500"}`}>
          {method}
        </span>{" "}
        <span className="text-foreground">
          {BASE_URL}
          {path}
        </span>
      </code>
      <button
        type="button"
        onClick={handleCopy}
        className="shrink-0 cursor-pointer rounded-lg border border-border bg-muted/50 p-2.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
        title={t("apiDocs.copyUrl")}
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
}

// ─── GET /api/public/clinics ──────────────────────────────────────────────────

function GetClinicsPanel() {
  const { t } = useTranslation();
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

  const queryRows = [
    ["category", "string", "–", "กรองตามหมวดหมู่ (Laser, Dental, Acne, Facial, Skin, Hair)"],
    ["q", "string", "–", "ค้นหาข้อความจากชื่อคลินิกและที่ตั้ง"],
  ];

  const responseFields = [
    ["clinics", "array", "รายการคลินิก"],
    ["clinics[].id", "string", "รหัสคลินิก (เช่น c1, c2)"],
    ["clinics[].name", "string", "ชื่อคลินิก"],
    ["clinics[].category", "string", "หมวดหมู่"],
    ["clinics[].rating", "number", "คะแนนเฉลี่ย (1–5)"],
    ["clinics[].reviews", "number", "จำนวนรีวิว"],
    ["clinics[].location", "string", "ที่ตั้ง"],
    ["clinics[].startingPrice", "number", "ราคาเริ่มต้น (THB)"],
    ["clinics[].promo", "string|null", "ข้อความโปรโมชั่น หรือ null"],
    ["clinics[].verified", "boolean", "คลินิกได้รับการยืนยันแล้ว"],
    ["clinics[].services", "array", "บริการ พร้อมชื่อ ราคา และระยะเวลา"],
    ["clinics[].openingHours", "array", "ชั่วโมงทำการแต่ละวัน"],
    ["total", "number", "จำนวนคลินิกทั้งหมดที่ได้"],
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
        <SectionLabel>{t("apiDocs.descLabel")}</SectionLabel>
        <p className="text-sm text-foreground leading-relaxed">{t("apiDocs.getClinicsDesc")}</p>
      </div>

      <div>
        <SectionLabel>{t("apiDocs.endpointLabel")}</SectionLabel>
        <UrlBlock method="GET" path={CLINICS_PATH} />
      </div>

      <div>
        <SectionLabel>{t("apiDocs.headers")}</SectionLabel>
        <p className="text-xs text-muted-foreground">{t("apiDocs.noAuthNote")}</p>
      </div>

      <div>
        <SectionLabel>{t("apiDocs.queryParamsLabel")}</SectionLabel>
        <FieldTable rows={queryRows} showRequired />
      </div>

      <div>
        <SectionLabel>{t("apiDocs.response200")}</SectionLabel>
        <FieldTable rows={responseFields} />
      </div>

      <div>
        <SectionLabel>{t("apiDocs.exampleResponseBody")}</SectionLabel>
        <CodeBlock code={exampleResponse} />
      </div>

      {/* Live test */}
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-3">
        <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
          {t("apiDocs.liveTest")}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Input
            className="h-9 text-xs flex-1 min-w-[180px]"
            placeholder={t("apiDocs.categoryOptional")}
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
                {t("apiDocs.sendingLabel")}
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
              <span className="text-xs text-muted-foreground">{t("apiDocs.responseFromServer")}</span>
            </div>
            <CodeBlock code={result} maxH="320px" />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── GET /api/public/clinics?clinicId={id} ──────────────────────────────────

function GetClinicByIdPanel() {
  const { t } = useTranslation();
  const clinics = useClinics();
  const [clinicId, setClinicId] = useState("c1");
  const [result, setResult] = useState<string | null>(null);
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const resolvedPath = `${CLINICS_PATH}?clinicId=${encodeURIComponent(clinicId)}`;
  const url = `${BASE_URL}${resolvedPath}`;

  const handleTest = async () => {
    if (!clinicId.trim()) {
      return;
    }
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

  const queryRows = [
    ["clinicId", "string", "✓", t("apiDocs.clinicIdParamDesc")],
  ];

  const responseFields = [
    ["id", "string", "รหัสคลินิก (เช่น c1, c2)"],
    ["name", "string", "ชื่อคลินิก"],
    ["category", "string", "หมวดหมู่"],
    ["rating", "number", "คะแนนเฉลี่ย (1–5)"],
    ["reviews", "number", "จำนวนรีวิว"],
    ["location", "string", "ที่ตั้ง"],
    ["startingPrice", "number", "ราคาเริ่มต้น (THB)"],
    ["promo", "string|null", "ข้อความโปรโมชั่น หรือ null"],
    ["verified", "boolean", "คลินิกได้รับการยืนยันแล้ว"],
    ["services", "array", "บริการ พร้อมชื่อ ราคา และระยะเวลา"],
    ["openingHours", "array", "ชั่วโมงทำการแต่ละวัน"],
  ];

  const exampleResponse = `{
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
}`;

  const errorRows = [
    ["404", t("apiDocs.clinicNotFound")],
    ["500", "เซิร์ฟเวอร์ error"],
  ];

  return (
    <div className="space-y-5 pt-1">
      <div>
        <SectionLabel>{t("apiDocs.descLabel")}</SectionLabel>
        <p className="text-sm text-foreground leading-relaxed">{t("apiDocs.getClinicByIdDesc")}</p>
      </div>

      <div>
        <SectionLabel>{t("apiDocs.endpointLabel")}</SectionLabel>
        <UrlBlock method="GET" path={clinicId ? resolvedPath : `${CLINICS_PATH}?clinicId={clinicId}`} />
      </div>

      <div>
        <SectionLabel>{t("apiDocs.headers")}</SectionLabel>
        <p className="text-xs text-muted-foreground">{t("apiDocs.noAuthNote")}</p>
      </div>

      <div>
        <SectionLabel>{t("apiDocs.queryParamsLabel")}</SectionLabel>
        <FieldTable rows={queryRows} showRequired />
      </div>

      <div>
        <SectionLabel>{t("apiDocs.response200")}</SectionLabel>
        <FieldTable rows={responseFields} />
      </div>

      <div>
        <SectionLabel>{t("apiDocs.exampleResponseBody")}</SectionLabel>
        <CodeBlock code={exampleResponse} />
      </div>

      <div>
        <SectionLabel>{t("apiDocs.errorResponses")}</SectionLabel>
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-2 text-left text-xs font-bold text-muted-foreground">
                  {t("apiDocs.statusCol")}
                </th>
                <th className="px-4 py-2 text-left text-xs font-bold text-muted-foreground">
                  {t("apiDocs.meaningCol")}
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
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-3">
        <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
          {t("apiDocs.liveTest")}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={clinicId} onValueChange={setClinicId}>
            <SelectTrigger className="h-9 cursor-pointer text-xs w-[220px]">
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
          <code className="min-w-0 flex-1 truncate rounded-lg border border-border bg-background px-3 py-2 text-xs font-mono text-muted-foreground">
            GET {url}
          </code>
          <Button size="sm" onClick={handleTest} disabled={loading} className="shrink-0">
            {loading ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                {t("apiDocs.sendingLabel")}
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
              <span className="text-xs text-muted-foreground">{t("apiDocs.responseFromServer")}</span>
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
      toast.error(t("apiDocs.fillAllFields"));
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
      if (res.status === 201) toast.success(t("apiDocs.bookingSuccess"));
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
  "patientName": "สมชาย ก.",
  "patientEmail": "somchai@example.com",
  "patientPhone": "+66812345678",
  "price": 990,
  "note": "ครั้งแรก"
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
  "patientName": "สมชาย ก.",
  "patientEmail": "somchai@example.com",
  "patientPhone": "+66812345678",
  "note": "ครั้งแรก",
  "createdAt": "2026-06-01T03:00:00.000Z"
}`;

  const headerRows = [
    ["Content-Type", "application/json", "✓", "จำเป็นสำหรับการส่ง JSON body"],
    ["Accept", "application/json", "–", "แนะนำ"],
  ];

  const bodyRows = [
    ["clinicId", "string", "✓", "รหัสคลินิก — ต้องตรงกับ id จาก GET /api/public/clinics"],
    ["serviceName", "string", "✓", "ต้องตรงกับ clinic.services[].name ทุกตัวอักษร"],
    ["date", "string", "✓", "วันที่นัดหมาย รูปแบบ YYYY-MM-DD"],
    ["time", "string", "✓", "เวลานัดหมาย รูปแบบ 24 ชั่วโมง HH:MM"],
    ["patientName", "string", "✓", "ชื่อ-นามสกุลผู้ป่วย (สูงสุด 255 ตัวอักษร)"],
    ["patientEmail", "string", "✓", "อีเมลที่ถูกต้อง"],
    ["patientPhone", "string", "–", "เบอร์โทรศัพท์ (ไม่บังคับ)"],
    ["price", "number", "–", "ราคา THB — ถ้าไม่ส่งจะใช้ราคาของบริการ"],
    ["note", "string", "–", "หมายเหตุให้คลินิก (ไม่บังคับ)"],
  ];

  const responseRows = [
    ["bookingId", "string", "รหัสการจอง (MC-XXXXXXXX)"],
    ["status", "string", "สถานะ: upcoming เสมอสำหรับการจองใหม่"],
    ["clinicId", "string", "รหัสคลินิกที่จอง"],
    ["clinicName", "string", "ชื่อคลินิกที่จอง"],
    ["serviceName", "string", "ชื่อบริการที่จอง"],
    ["date", "string", "วันที่นัดหมาย"],
    ["time", "string", "เวลานัดหมาย"],
    ["price", "number", "ราคา (THB)"],
    ["createdAt", "string", "เวลาสร้างการจอง (ISO 8601 UTC)"],
  ];

  const errorRows = [
    ["400", "JSON body ไม่ถูกต้อง หรือ validation ล้มเหลว ดูที่ error.issues[]"],
    ["404", "ไม่พบ clinicId หรือ serviceName ไม่ตรงกับบริการของคลินิกนั้น"],
    ["500", "เซิร์ฟเวอร์ error"],
  ];

  return (
    <div className="space-y-5 pt-1">
      <div>
        <SectionLabel>{t("apiDocs.descLabel")}</SectionLabel>
        <p className="text-sm text-foreground leading-relaxed">{t("apiDocs.postBookingDesc")}</p>
      </div>

      <div>
        <SectionLabel>{t("apiDocs.endpointLabel")}</SectionLabel>
        <UrlBlock method="POST" path={BOOKINGS_PATH} />
      </div>

      <div>
        <SectionLabel>{t("apiDocs.headers")}</SectionLabel>
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-2 text-left text-xs font-bold text-muted-foreground">
                  {t("apiDocs.headerCol")}
                </th>
                <th className="px-4 py-2 text-left text-xs font-bold text-muted-foreground">
                  {t("apiDocs.valueCol")}
                </th>
                <th className="px-4 py-2 text-left text-xs font-bold text-muted-foreground">
                  {t("apiDocs.requiredLabel")}
                </th>
                <th className="px-4 py-2 text-left text-xs font-bold text-muted-foreground">
                  {t("apiDocs.notesCol")}
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
        <SectionLabel>{t("apiDocs.requestBodyJson")}</SectionLabel>
        <FieldTable rows={bodyRows} showRequired />
      </div>

      <div>
        <SectionLabel>{t("apiDocs.exampleRequestBody")}</SectionLabel>
        <CodeBlock code={exampleRequest} />
      </div>

      <div>
        <SectionLabel>{t("apiDocs.response201")}</SectionLabel>
        <FieldTable rows={responseRows} />
      </div>

      <div>
        <SectionLabel>{t("apiDocs.exampleResponseBody")}</SectionLabel>
        <CodeBlock code={exampleResponse} />
      </div>

      <div>
        <SectionLabel>{t("apiDocs.errorResponses")}</SectionLabel>
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-2 text-left text-xs font-bold text-muted-foreground">
                  {t("apiDocs.statusCol")}
                </th>
                <th className="px-4 py-2 text-left text-xs font-bold text-muted-foreground">
                  {t("apiDocs.meaningCol")}
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
          {t("apiDocs.liveTest")}
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
              <SelectTrigger className="h-9 cursor-pointer text-xs">
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
              <SelectTrigger className="h-9 cursor-pointer text-xs">
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
              {t("apiDocs.sendingLabel")}
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
                className={`text-xs font-bold ${
                  statusCode === 201 ? "text-emerald-500" : "text-destructive"
                }`}
              >
                {statusCode ?? "ERR"} {statusCode === 201 ? "Created" : ""}
              </span>
              <span className="text-xs text-muted-foreground">{t("apiDocs.responseFromServer")}</span>
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
              {t("apiDocs.publicBadge")}
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
          <p className="mt-2 text-xs text-muted-foreground">{t("apiDocs.baseUrlNote")}</p>
        </div>

        {/* API Endpoints */}
        <Accordion type="multiple" defaultValue={[]} className="space-y-3">
          <AccordionItem
            value="get-clinics"
            className="overflow-hidden rounded-2xl border border-border bg-card px-0 shadow-sm"
          >
            <AccordionTrigger className="cursor-pointer px-5 py-4 hover:no-underline hover:bg-muted/30 transition-colors data-[state=open]:bg-muted/20">
              <div className="flex items-center gap-3 text-left">
                <MethodBadge method="GET" />
                <div>
                  <p className="font-bold text-foreground">{t("apiDocs.listClinicsTitle")}</p>
                  <p className="mt-0.5 font-mono text-xs text-muted-foreground">{CLINICS_PATH}</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-6">
              <GetClinicsPanel />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem
            value="get-clinic-by-id"
            className="overflow-hidden rounded-2xl border border-border bg-card px-0 shadow-sm"
          >
            <AccordionTrigger className="cursor-pointer px-5 py-4 hover:no-underline hover:bg-muted/30 transition-colors data-[state=open]:bg-muted/20">
              <div className="flex items-center gap-3 text-left">
                <MethodBadge method="GET" />
                <div>
                  <p className="font-bold text-foreground">{t("apiDocs.getClinicByIdTitle")}</p>
                  <p className="mt-0.5 font-mono text-xs text-muted-foreground">{CLINICS_PATH}?clinicId={"{"}clinicId{"}"}</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-6">
              <GetClinicByIdPanel />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem
            value="post-booking"
            className="overflow-hidden rounded-2xl border border-border bg-card px-0 shadow-sm"
          >
            <AccordionTrigger className="cursor-pointer px-5 py-4 hover:no-underline hover:bg-muted/30 transition-colors data-[state=open]:bg-muted/20">
              <div className="flex items-center gap-3 text-left">
                <MethodBadge method="POST" />
                <div>
                  <p className="font-bold text-foreground">{t("apiDocs.createBookingTitle")}</p>
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
