import { useSyncExternalStore } from "react";
import { useTranslation } from "react-i18next";
import { clinics as mockClinics, type Clinic } from "./mock-data";

const STORAGE_KEY = "medcentral_clinics_v1";
const listeners = new Set<() => void>();
let cache: Clinic[] | null = null;
const ssrSnapshot = [...mockClinics];

function read(): Clinic[] {
  if (cache) return cache;
  if (typeof window === "undefined") {
    cache = ssrSnapshot;
    return cache;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      let parsed = JSON.parse(raw) as Clinic[];
      let needsWrite = false;

      parsed = parsed.map((c) => {
        let updated = { ...c };

        // Migration: patch ownerId onto c1 if missing
        if (c.id === "c1" && !c.ownerId) {
          updated = { ...updated, ownerId: "mock-clinic" };
          needsWrite = true;
        }

        // Migration: backfill EN localisation fields from mock data when missing
        const mock = mockClinics.find((m) => m.id === c.id);
        if (mock) {
          if (!c.descriptionEn && mock.descriptionEn) {
            updated = { ...updated, descriptionEn: mock.descriptionEn };
            needsWrite = true;
          }
          if (c.promoEn === undefined && mock.promoEn !== undefined) {
            updated = { ...updated, promoEn: mock.promoEn };
            needsWrite = true;
          }
          // Patch nameEn onto services that match the mock by Thai name
          const patchedServices = updated.services.map((s) => {
            if (s.nameEn) return s;
            const mockSvc = mock.services.find((ms) => ms.name === s.name);
            if (mockSvc?.nameEn) {
              needsWrite = true;
              return { ...s, nameEn: mockSvc.nameEn };
            }
            return s;
          });
          updated = { ...updated, services: patchedServices };
        }

        return updated;
      });

      if (needsWrite) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      }
      cache = parsed;
    } else {
      cache = ssrSnapshot;
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
    }
  } catch {
    cache = ssrSnapshot;
  }
  return cache;
}

function write(next: Clinic[]) {
  cache = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  listeners.forEach((l) => l());
}

export function updateClinicProfile(clinicId: string, data: Partial<Clinic>): void {
  const current = read();
  const next = current.map((c) => (c.id === clinicId ? { ...c, ...data } : c));
  write(next);
}

export function updateClinicServices(clinicId: string, services: Clinic["services"]): void {
  const current = read();
  const next = current.map((c) => (c.id === clinicId ? { ...c, services } : c));
  write(next);
}

export function useClinics(): Clinic[] {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    read,
    () => ssrSnapshot,
  );
}

/**
 * Resolves a clinic's description, promo, and service names to the current
 * language. Falls back to the Thai (default) value when no EN version exists.
 */
export function localizeClinic(clinic: Clinic, lang: string): Clinic {
  if (lang !== "en") return clinic;
  return {
    ...clinic,
    description: clinic.descriptionEn ?? clinic.description,
    promo: clinic.promoEn !== undefined ? clinic.promoEn : clinic.promo,
    services: clinic.services.map((s) => ({
      ...s,
      name: s.nameEn ?? s.name,
    })),
  };
}

/**
 * Like useClinics() but returns clinics with strings resolved to the active
 * i18n language. Use this in all patient-facing display components.
 */
export function useLocalizedClinics(): Clinic[] {
  const { i18n } = useTranslation();
  const raw = useClinics();
  return raw.map((c) => localizeClinic(c, i18n.language));
}

export function addNewClinic(clinic: Clinic): void {
  const current = read();
  const next = [...current, clinic];
  write(next);
}

export function resetClinicsToMock(): void {
  cache = null;
  write([...mockClinics]);
}
