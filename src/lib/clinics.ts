import { useSyncExternalStore } from "react";
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
      // Migration: patch ownerId onto c1 if missing (for existing localStorage data)
      let needsWrite = false;
      parsed = parsed.map((c) => {
        if (c.id === "c1" && !c.ownerId) {
          needsWrite = true;
          return { ...c, ownerId: "mock-clinic" };
        }
        return c;
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

export function addNewClinic(clinic: Clinic): void {
  const current = read();
  const next = [...current, clinic];
  write(next);
}
