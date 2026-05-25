import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Check,
  Star,
  X,
  Plus,
  ChevronRight,
  ChevronLeft,
  Trophy,
  Clock,
  MapPin,
  Tag,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocalizedClinics } from "@/lib/clinics";
import type { Clinic } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/compare")({
  component: ComparePage,
  head: () => ({
    meta: [
      { title: "Compare clinics — MedCentral" },
      {
        name: "description",
        content: "Compare up to 3 clinics side by side: ratings, prices, promos, distance.",
      },
    ],
  }),
});

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Returns true if all values are identical (no "best" to highlight). */
function allSame(nums: number[]) {
  return new Set(nums).size <= 1;
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
function ComparePage() {
  const { t } = useTranslation();
  const allClinics = useLocalizedClinics();

  // ── Clinic slot state — start EMPTY (no pre-selection) ──
  const [ids, setIds] = useState<(string | undefined)[]>([undefined, undefined]);

  // ── Step state ──
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // ── Service selection — use index (not name) so it survives language switches ──
  // Record<clinicId, serviceIndex>   -1 = nothing selected
  const [selectedServiceIdx, setSelectedServiceIdx] = useState<Record<string, number>>({});

  // ── Existing set helper (logic unchanged) ──
  const set = (i: number, val: string) => {
    setIds((arr) => {
      const next = [...arr];
      next[i] = val;
      return next;
    });
  };

  // ── Slot management ──
  const addSlot = () => {
    if (ids.length >= 3) return;
    setIds((arr) => [...arr, undefined]); // open empty slot, no auto-fill
  };

  const removeSlot = (i: number) => {
    setIds((arr) => arr.filter((_, idx) => idx !== i));
  };

  // ── Derived ──
  const selected = useMemo(
    () => ids.map((id) => allClinics.find((c) => c.id === id)).filter((c): c is Clinic => !!c),
    [ids, allClinics],
  );

  const canContinue = step === 1 ? selected.length >= 2 : true;

  // ── Best-value computations (all numeric — language-independent) ──
  const ratings = useMemo(() => selected.map((c) => c.rating), [selected]);
  const prices = useMemo(() => selected.map((c) => c.startingPrice), [selected]);
  const distances = useMemo(() => selected.map((c) => c.distanceKm), [selected]);

  const maxRating = useMemo(() => Math.max(...ratings), [ratings]);
  const minPrice = useMemo(() => Math.min(...prices), [prices]);
  const minDistance = useMemo(() => Math.min(...distances), [distances]);

  // ── Service entries — resolved by INDEX for language safety ──
  const serviceEntries = useMemo(
    () =>
      selected.map((c) => {
        const idx = selectedServiceIdx[c.id];
        const service = idx !== undefined && idx >= 0 ? (c.services[idx] ?? null) : null;
        return { clinic: c, service };
      }),
    [selected, selectedServiceIdx],
  );

  const hasServiceComparison = serviceEntries.some((e) => e.service !== null);

  const svcPrices = useMemo(
    () => serviceEntries.filter((e) => e.service).map((e) => e.service!.price),
    [serviceEntries],
  );
  const svcDurations = useMemo(
    () => serviceEntries.filter((e) => e.service).map((e) => e.service!.durationMin),
    [serviceEntries],
  );

  const minSvcPrice = useMemo(
    () => (svcPrices.length ? Math.min(...svcPrices) : Infinity),
    [svcPrices],
  );
  const minSvcDuration = useMemo(
    () => (svcDurations.length ? Math.min(...svcDurations) : Infinity),
    [svcDurations],
  );

  // ── Step metadata ──
  const STEPS: { n: 1 | 2 | 3; labelKey: string; descKey: string }[] = [
    { n: 1, labelKey: "compare.stepClinics", descKey: "compare.step1Desc" },
    { n: 2, labelKey: "compare.stepServices", descKey: "compare.step2Desc" },
    { n: 3, labelKey: "compare.stepCompare", descKey: "compare.step3Desc" },
  ];

  const currentStepMeta = STEPS[step - 1];

  // ── Navigation ──
  const goBack = () => setStep((s) => Math.max(1, s - 1) as 1 | 2 | 3);
  const goNext = () => setStep((s) => Math.min(3, s + 1) as 1 | 2 | 3);

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <section className="container mx-auto flex flex-1 flex-col px-4 py-8">
        {/* ── Page title ── */}
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">{t("compare.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("compare.subtitle")}</p>
        </div>

        {/* ══ Navigation bar: [Back] [Step indicator] [Next/Compare] ══ */}
        <div className="mt-6 flex items-center gap-3">
          {/* Back button — invisible on step 1 to preserve layout */}
          <Button
            variant="outline"
            size="sm"
            onClick={goBack}
            className={cn(
              "shrink-0 cursor-pointer rounded-xl",
              step === 1 && "invisible pointer-events-none",
            )}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            {t("compare.back")}
          </Button>

          {/* Step pills */}
          <div className="flex flex-1 items-center justify-center gap-0 overflow-x-auto">
            {STEPS.map((s, i) => (
              <div key={s.n} className="flex shrink-0 items-center">
                <button
                  disabled={s.n >= step}
                  onClick={() => s.n < step && setStep(s.n)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200",
                    step === s.n &&
                      "pointer-events-none bg-primary text-primary-foreground shadow-soft",
                    s.n < step && "cursor-pointer bg-primary/10 text-primary hover:bg-primary/20",
                    s.n > step && "pointer-events-none bg-muted text-muted-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                      step === s.n && "bg-white/25 text-white",
                      s.n < step && "bg-primary text-white",
                      s.n > step && "bg-muted-foreground/25 text-muted-foreground",
                    )}
                  >
                    {s.n < step ? <Check className="h-2.5 w-2.5" /> : s.n}
                  </span>
                  <span className="hidden sm:block">{t(s.labelKey)}</span>
                </button>

                {i < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "mx-1 h-px w-6 shrink-0 transition-colors duration-300",
                      step > s.n ? "bg-primary" : "bg-border",
                    )}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Next / Compare button — hidden on step 3 with spacer */}
          {step < 3 ? (
            <Button
              size="sm"
              disabled={!canContinue}
              onClick={goNext}
              className="shrink-0 cursor-pointer rounded-xl shadow-soft disabled:cursor-not-allowed"
            >
              {step === 2 ? t("compare.compareBtn") : t("compare.next")}
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            /* Spacer so step indicator stays centered */
            <div className="invisible shrink-0 px-3 py-1.5 text-xs">placeholder</div>
          )}
        </div>

        {/* ── Step description ── */}
        <p className="mt-2 text-xs text-muted-foreground">{t(currentStepMeta.descKey)}</p>

        {/* ══════════════════════════════════════════════════
            Step 1 — Choose Clinics
        ══════════════════════════════════════════════════ */}
        {step === 1 && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {ids.map((id, slotIdx) => {
              const clinic = id ? allClinics.find((c) => c.id === id) : undefined;
              // IDs selected in OTHER slots — used to disable duplicates
              const takenByOthers = new Set(ids.filter((d, di) => d && di !== slotIdx));

              return (
                <div key={slotIdx} className="relative">
                  {/* Remove button — only when 3 slots exist */}
                  {ids.length > 2 && (
                    <button
                      onClick={() => removeSlot(slotIdx)}
                      className="absolute -right-2 -top-2 z-10 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-destructive text-white shadow-soft transition-opacity hover:opacity-80"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}

                  <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-soft transition-all duration-200 hover:border-primary/30">
                    {/* Preview image / empty state */}
                    {clinic ? (
                      <div className="relative h-28 overflow-hidden">
                        <img
                          src={clinic.thumbnail}
                          alt={clinic.name}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
                        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                          <span className="rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                            {t(`cat.${clinic.category}`)}
                          </span>
                          <span className="flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                            <Star className="h-2.5 w-2.5 fill-warning text-warning" />
                            {clinic.rating}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex h-28 flex-col items-center justify-center gap-1 bg-muted/25">
                        <MapPin className="h-5 w-5 text-muted-foreground/40" />
                        <p className="text-[11px] text-muted-foreground">
                          {t("compare.selectClinic")}
                        </p>
                      </div>
                    )}

                    {/* Clinic name + location (when selected) */}
                    {clinic && (
                      <div className="px-3 pb-1 pt-2.5">
                        <p className="truncate text-sm font-semibold">{clinic.name}</p>
                        <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <MapPin className="h-2.5 w-2.5 text-primary/60" />
                          {clinic.location} · {clinic.distanceKm} km
                        </p>
                      </div>
                    )}

                    {/* Dropdown — duplicates disabled */}
                    <div className="p-3 pt-2">
                      <Select value={id ?? ""} onValueChange={(v) => set(slotIdx, v)}>
                        <SelectTrigger className="h-8 cursor-pointer rounded-xl border-border/60 text-xs">
                          <SelectValue placeholder={t("compare.selectClinic")} />
                        </SelectTrigger>
                        <SelectContent>
                          {allClinics.map((c) => {
                            const isDuplicate = takenByOthers.has(c.id);
                            return (
                              <SelectItem
                                key={c.id}
                                value={c.id}
                                disabled={isDuplicate}
                                className={cn(
                                  "cursor-pointer text-xs",
                                  isDuplicate && "cursor-not-allowed opacity-40",
                                )}
                              >
                                {c.name}
                                {isDuplicate && (
                                  <span className="ml-1 text-[10px] text-muted-foreground">
                                    ({t("compare.alreadySelected")})
                                  </span>
                                )}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Add 3rd slot */}
            {ids.length < 3 && (
              <button
                onClick={addSlot}
                className="flex min-h-[190px] cursor-pointer flex-col items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed border-border bg-card/50 transition-colors hover:border-primary/40 hover:bg-primary/5"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Plus className="h-5 w-5" />
                </span>
                <span className="text-sm font-medium text-muted-foreground">
                  {t("compare.addClinic")}
                </span>
              </button>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            Step 2 — Choose Services
        ══════════════════════════════════════════════════ */}
        {step === 2 && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {selected.map((c) => (
              <div
                key={c.id}
                className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-soft"
              >
                {/* Clinic header */}
                <div className="flex items-center gap-3 border-b border-border/50 p-4">
                  <img
                    src={c.thumbnail}
                    alt={c.name}
                    className="h-10 w-10 shrink-0 rounded-xl object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{c.name}</p>
                    <p className="text-[11px] text-muted-foreground">{t(`cat.${c.category}`)}</p>
                  </div>
                </div>

                {/* Service buttons — selection via index (language-safe) */}
                <div className="space-y-2 p-3">
                  {c.services.map((s, sIdx) => {
                    const isSelected = selectedServiceIdx[c.id] === sIdx;
                    return (
                      <button
                        key={sIdx}
                        onClick={() =>
                          setSelectedServiceIdx((prev) => ({
                            ...prev,
                            [c.id]: isSelected ? -1 : sIdx,
                          }))
                        }
                        className={cn(
                          "flex w-full cursor-pointer items-center justify-between rounded-xl border px-3 py-2.5 text-left transition-all duration-150",
                          isSelected
                            ? "border-primary bg-primary/5 shadow-soft"
                            : "border-border/60 hover:border-primary/30 hover:bg-primary/5",
                        )}
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <p className="truncate text-xs font-semibold">{s.name}</p>
                          <p className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Clock className="h-2.5 w-2.5 shrink-0" />
                            {s.durationMin} {t("common.min")}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1.5">
                          <span className="text-sm font-extrabold text-primary">
                            ฿{s.price.toLocaleString()}
                          </span>
                          {isSelected && <Check className="h-4 w-4 text-primary" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            Step 3 — Comparison Table
            Desktop: constrained to h-screen (minus header + nav)
        ══════════════════════════════════════════════════ */}
        {step === 3 && (
          <div className="mt-6 flex flex-1 flex-col lg:min-h-0">
            {/* Scrollable wrapper — fills remaining viewport height on desktop */}
            <div className="flex-1 overflow-auto rounded-2xl border border-border bg-card shadow-soft lg:overflow-y-auto">
              <table className="w-full min-w-[600px] text-sm">
                {/* ── Sticky column headers ── */}
                <thead className="sticky top-0 z-10">
                  <tr className="border-b border-border bg-muted/80 backdrop-blur-sm">
                    <th className="w-32 p-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {t("compare.criteria")}
                    </th>
                    {selected.map((c) => (
                      <th key={c.id} className="p-4 text-left">
                        <div className="flex items-center gap-3">
                          <img
                            src={c.thumbnail}
                            alt={c.name}
                            className="h-10 w-10 shrink-0 rounded-xl object-cover"
                          />
                          <div className="min-w-0">
                            <p className="truncate font-semibold">{c.name}</p>
                            <p className="truncate text-[11px] text-muted-foreground">
                              {t(`cat.${c.category}`)}
                            </p>
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {/* ── Overall Rating — highlight highest (amber) ── */}
                  <CompareRow label={t("compare.overallRating")}>
                    {selected.map((c) => {
                      const isBest = !allSame(ratings) && c.rating === maxRating;
                      return (
                        <td
                          key={c.id}
                          className={cn(
                            "p-4 transition-colors",
                            isBest && "bg-amber-50 dark:bg-amber-950/30",
                          )}
                        >
                          <div className="flex flex-wrap items-center gap-1.5">
                            <Star
                              className={cn(
                                "h-4 w-4",
                                isBest
                                  ? "fill-amber-400 text-amber-400"
                                  : "fill-warning text-warning",
                              )}
                            />
                            <span
                              className={cn(
                                "font-bold",
                                isBest && "text-amber-700 dark:text-amber-300",
                              )}
                            >
                              {c.rating}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ({c.reviews.toLocaleString()})
                            </span>
                            {isBest && (
                              <Badge className="border-0 bg-amber-100 px-1.5 py-0 text-[9px] font-bold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                                <Trophy className="mr-0.5 h-2.5 w-2.5" />
                                {t("compare.bestRating")}
                              </Badge>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </CompareRow>

                  {/* ── Starting Price — highlight lowest (green) ── */}
                  <CompareRow label={t("compare.startingPrice")}>
                    {selected.map((c) => {
                      const isBest = !allSame(prices) && c.startingPrice === minPrice;
                      return (
                        <td
                          key={c.id}
                          className={cn(
                            "p-4 transition-colors",
                            isBest && "bg-green-50 dark:bg-green-950/30",
                          )}
                        >
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span
                              className={cn(
                                "text-base font-extrabold",
                                isBest ? "text-green-600 dark:text-green-400" : "text-primary",
                              )}
                            >
                              ฿{c.startingPrice.toLocaleString()}
                            </span>
                            {isBest && (
                              <Badge className="border-0 bg-green-100 px-1.5 py-0 text-[9px] font-bold text-green-700 dark:bg-green-900/40 dark:text-green-300">
                                {t("compare.lowestPrice")}
                              </Badge>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </CompareRow>

                  {/* ── Distance — highlight nearest (sky) ── */}
                  <CompareRow label={t("compare.locationDistance")}>
                    {selected.map((c) => {
                      const isBest = !allSame(distances) && c.distanceKm === minDistance;
                      return (
                        <td
                          key={c.id}
                          className={cn(
                            "p-4 transition-colors",
                            isBest && "bg-sky-50 dark:bg-sky-950/30",
                          )}
                        >
                          <p
                            className={cn(
                              "text-sm",
                              isBest && "font-semibold text-sky-700 dark:text-sky-300",
                            )}
                          >
                            {c.location}
                          </p>
                          <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                            <span
                              className={cn(
                                "text-xs",
                                isBest
                                  ? "font-semibold text-sky-600 dark:text-sky-400"
                                  : "text-muted-foreground",
                              )}
                            >
                              {c.distanceKm} {t("compare.kmAway")}
                            </span>
                            {isBest && (
                              <Badge className="border-0 bg-sky-100 px-1.5 py-0 text-[9px] font-bold text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">
                                {t("compare.nearestClinic")}
                              </Badge>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </CompareRow>

                  {/* ── Promo — NOT comparable, no highlight ── */}
                  <CompareRow label={t("compare.currentPromo")}>
                    {selected.map((c) => (
                      <td key={c.id} className="p-4">
                        {c.promo ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                            <Tag className="h-3 w-3" /> {c.promo}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <X className="h-3 w-3" /> {t("compare.noActivePromo")}
                          </span>
                        )}
                      </td>
                    ))}
                  </CompareRow>

                  {/* ── Key Services — NOT comparable, no highlight ── */}
                  <CompareRow label={t("compare.keyServices")}>
                    {selected.map((c) => (
                      <td key={c.id} className="p-4">
                        <ul className="space-y-1 text-xs text-muted-foreground">
                          {c.services.slice(0, 3).map((s, i) => (
                            <li key={i}>• {s.name}</li>
                          ))}
                        </ul>
                      </td>
                    ))}
                  </CompareRow>

                  {/* ── Selected-service section (only when at least one picked) ── */}
                  {hasServiceComparison && (
                    <>
                      {/* Section divider */}
                      <tr className="border-b border-border bg-muted/40">
                        <td
                          colSpan={selected.length + 1}
                          className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                        >
                          {t("compare.serviceLabel")}
                        </td>
                      </tr>

                      {/* Service name — NOT comparable, no highlight */}
                      <CompareRow label={t("compare.serviceLabel")}>
                        {serviceEntries.map(({ clinic, service }) => (
                          <td key={clinic.id} className="p-4">
                            {service ? (
                              <span className="font-medium">{service.name}</span>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                {t("compare.noService")}
                              </span>
                            )}
                          </td>
                        ))}
                      </CompareRow>

                      {/* Service price — comparable, highlight lowest */}
                      <CompareRow label={t("compare.servicePrice")}>
                        {serviceEntries.map(({ clinic, service }) => {
                          const isBest =
                            !allSame(svcPrices) &&
                            service !== null &&
                            service.price === minSvcPrice;
                          return (
                            <td
                              key={clinic.id}
                              className={cn(
                                "p-4 transition-colors",
                                isBest && "bg-green-50 dark:bg-green-950/30",
                              )}
                            >
                              {service ? (
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span
                                    className={cn(
                                      "text-base font-extrabold",
                                      isBest
                                        ? "text-green-600 dark:text-green-400"
                                        : "text-primary",
                                    )}
                                  >
                                    ฿{service.price.toLocaleString()}
                                  </span>
                                  {isBest && (
                                    <Badge className="border-0 bg-green-100 px-1.5 py-0 text-[9px] font-bold text-green-700 dark:bg-green-900/40 dark:text-green-300">
                                      {t("compare.lowestPrice")}
                                    </Badge>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </td>
                          );
                        })}
                      </CompareRow>

                      {/* Service duration — comparable, highlight shortest */}
                      <CompareRow label={t("compare.serviceDuration")}>
                        {serviceEntries.map(({ clinic, service }) => {
                          const isBest =
                            !allSame(svcDurations) &&
                            service !== null &&
                            service.durationMin === minSvcDuration;
                          return (
                            <td
                              key={clinic.id}
                              className={cn(
                                "p-4 transition-colors",
                                isBest && "bg-sky-50 dark:bg-sky-950/30",
                              )}
                            >
                              {service ? (
                                <div className="flex items-center gap-1.5">
                                  <Clock
                                    className={cn(
                                      "h-3.5 w-3.5",
                                      isBest ? "text-sky-500" : "text-muted-foreground",
                                    )}
                                  />
                                  <span
                                    className={cn(
                                      "font-semibold",
                                      isBest && "text-sky-600 dark:text-sky-400",
                                    )}
                                  >
                                    {service.durationMin} {t("common.min")}
                                  </span>
                                  {isBest && (
                                    <Badge className="border-0 bg-sky-100 px-1.5 py-0 text-[9px] font-bold text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">
                                      {t("compare.fastest")}
                                    </Badge>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </td>
                          );
                        })}
                      </CompareRow>
                    </>
                  )}

                  {/* ── Book Now — not comparable ── */}
                  <CompareRow label="">
                    {selected.map((c) => (
                      <td key={c.id} className="p-4">
                        <Button asChild size="sm" className="w-full cursor-pointer rounded-xl">
                          <Link to="/clinic/$clinicId" params={{ clinicId: c.id }}>
                            {t("common.bookNow")}
                          </Link>
                        </Button>
                      </td>
                    ))}
                  </CompareRow>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CompareRow helper (unchanged from original Row)
// ─────────────────────────────────────────────────────────────────────────────
function CompareRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <tr className="border-b border-border last:border-0">
      <td className="p-4 align-top text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </td>
      {children}
    </tr>
  );
}
