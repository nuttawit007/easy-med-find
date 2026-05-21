import { useSyncExternalStore } from "react";

const STORAGE_KEY = "medcentral_clinic_registrations_v1";

export type RegistrationStatus = "pending" | "approved" | "rejected";

export interface ClinicRegistration {
  id: string;
  submittedBy: string; // userId of the clinic manager who submitted
  status: RegistrationStatus;
  submittedAt: string; // human-readable date

  // Clinic information (matches EnhancedPendingClinic fields for admin audit)
  name: string;
  category: string;
  location: string;
  licenseNumber: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  description: string;
  mapCoordinates: string;
  registeredCompanyName: string;
  registeredDate: string;
}

export type ClinicRegistrationFormData = Omit<ClinicRegistration, "id" | "submittedBy" | "status" | "submittedAt">;

// --- Internal store ---
const listeners = new Set<() => void>();
let cache: ClinicRegistration[] | null = null;

function read(): ClinicRegistration[] {
  if (cache) return cache;
  if (typeof window === "undefined") {
    cache = [];
    return cache;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      cache = JSON.parse(raw);
    } else {
      cache = [];
    }
  } catch {
    cache = [];
  }
  return cache ?? [];
}

function write(next: ClinicRegistration[]) {
  cache = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  listeners.forEach((l) => l());
}

// --- Public API ---

/** React hook — returns all registrations (used internally). */
export function useClinicRegistrations(): ClinicRegistration[] {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    read,
    () => [] as ClinicRegistration[],
  );
}

/** React hook — returns the registration belonging to the given userId (if any). */
export function useMyClinicRegistration(userId: string | undefined): ClinicRegistration | null {
  const all = useClinicRegistrations();
  if (!userId) return null;
  // Return the most recent registration for this user
  const mine = all.filter((r) => r.submittedBy === userId);
  return mine.length > 0 ? mine[mine.length - 1]! : null;
}

/** Submit a new clinic registration. Returns the created registration. */
export function submitClinicRegistration(
  data: ClinicRegistrationFormData,
  userId: string,
): ClinicRegistration {
  const now = new Date();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const submitted = `${monthNames[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;

  const registration: ClinicRegistration = {
    id: `cr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    submittedBy: userId,
    status: "pending",
    submittedAt: submitted,
    ...data,
  };

  const current = read();
  // Remove any previous registration from this user (allow resubmit after rejection)
  const filtered = current.filter((r) => r.submittedBy !== userId);
  write([...filtered, registration]);

  return registration;
}

/** Update the status of a registration (called by admin-approvals). */
export function updateRegistrationStatus(registrationId: string, status: RegistrationStatus): void {
  const current = read();
  const next = current.map((r) =>
    r.id === registrationId ? { ...r, status } : r,
  );
  write(next);
}

/** Update registration status by userId (called when admin approves/rejects by pending clinic id). */
export function updateRegistrationStatusByUser(userId: string, status: RegistrationStatus): void {
  const current = read();
  const next = current.map((r) =>
    r.submittedBy === userId && r.status === "pending" ? { ...r, status } : r,
  );
  write(next);
}

/** Clear a rejected registration for a user (so they can resubmit). */
export function clearRejectedRegistration(userId: string): void {
  const current = read();
  const next = current.filter((r) => !(r.submittedBy === userId && r.status === "rejected"));
  write(next);
}
