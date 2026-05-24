import { useSyncExternalStore } from "react";

export type BookingStatus = "upcoming" | "completed" | "cancelled";

export interface Booking {
  bookingId: string;
  clinicId: string;
  clinicName: string;
  serviceName: string;
  price?: number;
  date: string; // ISO yyyy-mm-dd
  time: string;
  status: BookingStatus;
  createdAt: string;
  patientId?: string;
  patientName?: string;
  patientEmail?: string;
}

const STORAGE_KEY = "medcentral_bookings_v1";
const listeners = new Set<() => void>();
let cache: Booking[] | null = null;

if (typeof window !== "undefined") {
  // Cross-tab/role sync: invalidate cache when another tab writes
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY) {
      cache = null;
      listeners.forEach((l) => l());
    }
  });
}

function read(): Booking[] {
  if (cache) return cache;
  if (typeof window === "undefined") {
    cache = [];
    return cache;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    cache = raw ? (JSON.parse(raw) as Booking[]) : [];
  } catch {
    cache = [];
  }
  return cache;
}

function write(next: Booking[]) {
  cache = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  listeners.forEach((l) => l());
}

export function generateBookingId(): string {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  const ts = Date.now().toString(36).slice(-4).toUpperCase();
  return `MC-${ts}${rand}`;
}

export class BookingConflictError extends Error {
  constructor(message = "This slot is already booked. Please pick another time.") {
    super(message);
    this.name = "BookingConflictError";
  }
}

export function findSlotConflict(
  clinicId: string,
  serviceName: string,
  date: string,
  time: string,
): Booking | undefined {
  return read().find(
    (b) =>
      b.status !== "cancelled" &&
      b.clinicId === clinicId &&
      b.serviceName === serviceName &&
      b.date === date &&
      b.time === time,
  );
}

export function addBooking(
  input: Omit<Booking, "bookingId" | "status" | "createdAt"> & { status?: BookingStatus },
): Booking {
  if (findSlotConflict(input.clinicId, input.serviceName, input.date, input.time)) {
    throw new BookingConflictError();
  }
  const booking: Booking = {
    bookingId: generateBookingId(),
    status: input.status ?? "upcoming",
    createdAt: new Date().toISOString(),
    ...input,
  };
  write([booking, ...read()]);
  return booking;
}

export function updateBookingStatus(bookingId: string, status: BookingStatus): void {
  const next = read().map((b) => (b.bookingId === bookingId ? { ...b, status } : b));
  write(next);
}

export function useBookings(): Booking[] {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    read,
    () => [],
  );
}

export function isUpcoming(b: Booking): boolean {
  if (b.status === "cancelled") return false;
  if (b.status === "completed") return false;
  // Also treat past-dated upcoming as history
  try {
    const dt = new Date(`${b.date}T${convertTo24h(b.time)}`);
    if (!isNaN(dt.getTime()) && dt.getTime() < Date.now()) return false;
  } catch {
    /* ignore */
  }
  return true;
}

function convertTo24h(time: string): string {
  // accepts "14:30" or "2:30 PM"
  const m = time.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!m) return "00:00";
  let h = parseInt(m[1], 10);
  const min = m[2];
  const ap = m[3]?.toUpperCase();
  if (ap === "PM" && h < 12) h += 12;
  if (ap === "AM" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${min}`;
}
