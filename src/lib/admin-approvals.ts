import { useSyncExternalStore } from "react";
import { pendingClinics as mockPendingClinics, pendingServices as mockPendingServices, type Clinic } from "./mock-data";
import { addNewClinic, updateClinicServices } from "./clinics";

const CLINICS_KEY = "medcentral_pending_clinics_v1";
const SERVICES_KEY = "medcentral_pending_services_v1";

export interface EnhancedPendingClinic {
  id: string;
  name: string;
  category: string;
  submitted: string;
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

export interface EnhancedPendingService {
  id: string;
  clinicName: string;
  service: string;
  price: number;
  submitted: string;
}

// Enhance standard mock data with verification metadata
const initialPendingClinics: EnhancedPendingClinic[] = [
  {
    id: "pc1",
    name: "Lumina Aesthetic Clinic",
    category: "Facial",
    submitted: "May 5, 2026",
    location: "Phrom Phong, Bangkok",
    licenseNumber: "LIC-2026-90412",
    ownerName: "Dr. Kanya Srisuk",
    ownerPhone: "+66 82 456 7890",
    ownerEmail: "kanya.s@lumina-clinic.com",
    description: "Premium boutique clinic specializing in non-invasive skin rejuvenation, facial contouring, and advanced hydration treatments.",
    mapCoordinates: "13.7302° N, 100.5694° E",
    registeredCompanyName: "Lumina Aesthetics (Thailand) Co., Ltd.",
    registeredDate: "March 15, 2025"
  },
  {
    id: "pc2",
    name: "DentaPro Smile Center",
    category: "Dental",
    submitted: "May 6, 2026",
    location: "Ratchada, Bangkok",
    licenseNumber: "LIC-2026-89104",
    ownerName: "Dr. Tanakorn Wong",
    ownerPhone: "+66 89 777 1234",
    ownerEmail: "tanakorn.w@dentapro.com",
    description: "Family-focused modern dentistry clinic providing painless cleaning, root canals, and standard teeth-whitening services with expert care.",
    mapCoordinates: "13.7761° N, 100.5742° E",
    registeredCompanyName: "DentaPro Group Co., Ltd.",
    registeredDate: "June 20, 2024"
  },
  {
    id: "pc3",
    name: "Apex Wellness & IV Center",
    category: "Wellness",
    submitted: "May 8, 2026",
    location: "Thonglor, Bangkok",
    licenseNumber: "LIC-2026-77891",
    ownerName: "Dr. Cholathit Pipat",
    ownerPhone: "+66 81 999 5678",
    ownerEmail: "cholathit.p@apexwellness.com",
    description: "Premium holistic anti-aging clinic providing customized NAD+ infusions, medical-grade IV vitamin drips, and lifestyle biohacking diagnostics.",
    mapCoordinates: "13.7335° N, 100.5812° E",
    registeredCompanyName: "Apex Life Wellness Thailand Co., Ltd.",
    registeredDate: "August 12, 2023"
  },
  {
    id: "pc4",
    name: "Absolute OrthoDental Hub",
    category: "Dental",
    submitted: "May 10, 2026",
    location: "Siam Square, Bangkok",
    licenseNumber: "LIC-2026-44512",
    ownerName: "Dr. Nattaporn Siri",
    ownerPhone: "+66 85 111 2233",
    ownerEmail: "nattaporn.s@absoluteortho.com",
    description: "Advanced cosmetic dentistry and digital orthodontic center specialized in Invisalign treatments, surgical veneers, and total smile reconstructions.",
    mapCoordinates: "13.7456° N, 100.5302° E",
    registeredCompanyName: "Absolute Orthodontic & Aesthetic Dental Co., Ltd.",
    registeredDate: "January 08, 2024"
  },
  {
    id: "pc5",
    name: "Radiance DermaCare Lab",
    category: "Facial",
    submitted: "May 12, 2026",
    location: "Ari, Bangkok",
    licenseNumber: "LIC-2026-66701",
    ownerName: "Dr. Peerada Chot",
    ownerPhone: "+66 83 222 9988",
    ownerEmail: "peerada.c@radiance-derma.com",
    description: "Scientific skincare and laser therapy clinic focused on high-tech skin barrier repair, acne scar remodeling, and organic chemical peels.",
    mapCoordinates: "13.7798° N, 100.5447° E",
    registeredCompanyName: "Radiance Dermatological Research Center Group",
    registeredDate: "November 21, 2025"
  }
];

const initialPendingServices: EnhancedPendingService[] = [
  {
    id: "ps1",
    clinicName: "Aura Skin & Laser Clinic",
    service: "Fraxel Laser Resurfacing",
    price: 4200,
    submitted: "May 7, 2026",
  },
  {
    id: "ps2",
    clinicName: "Velvet Hair & Scalp Clinic",
    service: "Microneedling Scalp",
    price: 3500,
    submitted: "May 7, 2026",
  },
  {
    id: "ps3",
    clinicName: "Lumina Aesthetic Clinic",
    service: "Ultraformer III Full Face & Neck",
    price: 12500,
    submitted: "May 8, 2026",
  },
  {
    id: "ps4",
    clinicName: "DentaPro Smile Center",
    service: "Invisalign First Comprehensive Assessment",
    price: 8500,
    submitted: "May 8, 2026",
  },
  {
    id: "ps5",
    clinicName: "Aura Skin & Laser Clinic",
    service: "Thermage FLX 900 Shots Face Lifting",
    price: 68000,
    submitted: "May 9, 2026",
  }
];

const clinicListeners = new Set<() => void>();
const serviceListeners = new Set<() => void>();

let clinicsCache: EnhancedPendingClinic[] | null = null;
let servicesCache: EnhancedPendingService[] | null = null;

function readClinics(): EnhancedPendingClinic[] {
  if (clinicsCache) return clinicsCache;
  if (typeof window === "undefined") {
    clinicsCache = initialPendingClinics;
    return clinicsCache;
  }
  try {
    const raw = window.localStorage.getItem(CLINICS_KEY);
    if (raw) {
      clinicsCache = JSON.parse(raw);
    } else {
      clinicsCache = initialPendingClinics;
      window.localStorage.setItem(CLINICS_KEY, JSON.stringify(clinicsCache));
    }
  } catch {
    clinicsCache = initialPendingClinics;
  }
  return clinicsCache ?? [];
}

function writeClinics(next: EnhancedPendingClinic[]) {
  clinicsCache = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(CLINICS_KEY, JSON.stringify(next));
  }
  clinicListeners.forEach((l) => l());
}

function readServices(): EnhancedPendingService[] {
  if (servicesCache) return servicesCache;
  if (typeof window === "undefined") {
    servicesCache = initialPendingServices;
    return servicesCache;
  }
  try {
    const raw = window.localStorage.getItem(SERVICES_KEY);
    if (raw) {
      servicesCache = JSON.parse(raw);
    } else {
      servicesCache = initialPendingServices;
      window.localStorage.setItem(SERVICES_KEY, JSON.stringify(servicesCache));
    }
  } catch {
    servicesCache = initialPendingServices;
  }
  return servicesCache ?? [];
}

function writeServices(next: EnhancedPendingService[]) {
  servicesCache = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(SERVICES_KEY, JSON.stringify(next));
  }
  serviceListeners.forEach((l) => l());
}

// React hooks for state synchronization
export function usePendingClinics(): EnhancedPendingClinic[] {
  return useSyncExternalStore(
    (cb) => {
      clinicListeners.add(cb);
      return () => clinicListeners.delete(cb);
    },
    readClinics,
    () => initialPendingClinics
  );
}

export function usePendingServices(): EnhancedPendingService[] {
  return useSyncExternalStore(
    (cb) => {
      serviceListeners.add(cb);
      return () => serviceListeners.delete(cb);
    },
    readServices,
    () => initialPendingServices
  );
}

const img = (seed: string, w = 800, h = 500) =>
  `https://images.unsplash.com/photo-${seed}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

// Approve a clinic: Removes from pending, creates a real clinic in clinics store
export function approveClinic(id: string): void {
  const pending = readClinics();
  const target = pending.find((c) => c.id === id);
  if (!target) return;

  // 1. Remove from pending
  writeClinics(pending.filter((c) => c.id !== id));

  // 2. Map to a real Clinic object and save to main clinics store
  const newClinicId = `c_approved_${Date.now()}`;
  const mockImageSeed = target.category === "Dental" ? "1588776814546-1ffcf47267a5" : "1576091160550-2173dba999ef";

  const newClinic: Clinic = {
    id: newClinicId,
    name: target.name,
    category: target.category,
    rating: 5.0, // New approved clinic starts with a perfect 5.0
    reviews: 1, // Single initial verified review
    startingPrice: target.category === "Dental" ? 600 : 1500,
    location: target.location,
    distanceKm: parseFloat((Math.random() * 5 + 1).toFixed(1)),
    promo: "15% off Grand Opening Special!",
    thumbnail: img(mockImageSeed),
    banner: img(mockImageSeed, 1600, 600),
    description: target.description,
    services: [
      { name: "Initial Consultation", price: 500, durationMin: 30 },
      { name: "Premium Assessment & Plan", price: 1000, durationMin: 45 }
    ],
    gallery: [
      img("1612349317150-e413f6a5b16d"),
      img("1581093588401-fbb62a02f120")
    ],
    reviewList: [
      {
        user: "System Verified",
        rating: 5,
        comment: "This clinic is officially verified by MedCentral Admin. Credentials checked successfully.",
        date: "Today"
      }
    ],
    verified: true, // Marked as verified!
    phone: target.ownerPhone,
    email: target.ownerEmail,
    website: `https://${target.name.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`
  };

  addNewClinic(newClinic);
}

// Reject a clinic: Simply removes it from pending list
export function rejectClinic(id: string): void {
  const pending = readClinics();
  writeClinics(pending.filter((c) => c.id !== id));
}

// Approve a service: Finds target clinic by name, adds service to its service list, removes pending
export function approveService(id: string, allClinics: Clinic[]): boolean {
  const pending = readServices();
  const target = pending.find((s) => s.id === id);
  if (!target) return false;

  // Find the clinic that has this name
  const clinic = allClinics.find((c) => c.name.toLowerCase() === target.clinicName.toLowerCase());
  if (clinic) {
    const updatedServices = [...clinic.services, { name: target.service, price: target.price, durationMin: 45 }];
    updateClinicServices(clinic.id, updatedServices);
    // Remove from pending
    writeServices(pending.filter((s) => s.id !== id));
    return true;
  }
  return false;
}

// Reject a service: Removes from pending list
export function rejectService(id: string): void {
  const pending = readServices();
  writeServices(pending.filter((s) => s.id !== id));
}

// Reset both queues back to full mock initial arrays
export function resetPendingData(): void {
  writeClinics(initialPendingClinics);
  writeServices(initialPendingServices);
}
