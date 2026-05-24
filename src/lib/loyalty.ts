import { useSyncExternalStore } from "react";

const STORAGE_KEY = "medcentral_loyalty_v1";
const listeners = new Set<() => void>();
let cache: Record<string, number> | null = null;

function read(): Record<string, number> {
  if (cache) return cache;
  if (typeof window === "undefined") {
    cache = {};
    return cache;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    cache = raw ? (JSON.parse(raw) as Record<string, number>) : {};
  } catch {
    cache = {};
  }
  return cache;
}

function write(next: Record<string, number>) {
  cache = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  listeners.forEach((l) => l());
}

export function incrementLoyaltyPoints(patientId: string, by = 1): number {
  if (!patientId) return 0;
  const current = read();
  const next = { ...current, [patientId]: (current[patientId] ?? 0) + by };
  write(next);
  return next[patientId];
}

export function getLoyaltyPoints(patientId: string | undefined | null): number {
  if (!patientId) return 0;
  return read()[patientId] ?? 0;
}

export function resetLoyalty(): void {
  write({});
}

export function useLoyaltyPoints(patientId: string | undefined | null): number {
  const all = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    read,
    () => ({}) as Record<string, number>,
  );
  if (!patientId) return 0;
  return all[patientId] ?? 0;
}
