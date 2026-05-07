export type Clinic = {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviews: number;
  startingPrice: number;
  location: string;
  distanceKm: number;
  promo?: string;
  thumbnail: string;
  banner: string;
  description: string;
  services: { name: string; price: number; durationMin: number }[];
  gallery: string[];
  reviewList: { user: string; rating: number; comment: string; date: string }[];
};

const img = (seed: string, w = 800, h = 500) =>
  `https://images.unsplash.com/photo-${seed}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

export const CATEGORIES = ["Acne", "Laser", "Dental", "Facial", "Skin", "Hair"] as const;

export const clinics: Clinic[] = [
  {
    id: "c1",
    name: "Aura Skin & Laser Clinic",
    category: "Laser",
    rating: 4.8,
    reviews: 1284,
    startingPrice: 990,
    location: "Sukhumvit, Bangkok",
    distanceKm: 1.2,
    promo: "30% off first laser session",
    thumbnail: img("1629909613654-28e377c37b09"),
    banner: img("1629909613654-28e377c37b09", 1600, 600),
    description:
      "Award-winning aesthetic clinic specializing in laser hair removal, pigmentation treatments, and rejuvenation with FDA-approved devices.",
    services: [
      { name: "Laser Hair Removal (Underarm)", price: 990, durationMin: 30 },
      { name: "Pico Laser Full Face", price: 3500, durationMin: 45 },
      { name: "Acne Laser Treatment", price: 2200, durationMin: 40 },
    ],
    gallery: [img("1576091160550-2173dba999ef"), img("1612349317150-e413f6a5b16d"), img("1581093588401-fbb62a02f120")],
    reviewList: [
      { user: "Mint P.", rating: 5, comment: "Skin glowed after just 2 sessions!", date: "2 weeks ago" },
      { user: "Joon W.", rating: 5, comment: "Friendly staff, modern equipment.", date: "1 month ago" },
    ],
  },
  {
    id: "c2",
    name: "Bright Smile Dental Studio",
    category: "Dental",
    rating: 4.9,
    reviews: 952,
    startingPrice: 500,
    location: "Silom, Bangkok",
    distanceKm: 2.8,
    promo: "Free whitening with cleaning",
    thumbnail: img("1606811841689-23dfddce3e95"),
    banner: img("1606811841689-23dfddce3e95", 1600, 600),
    description:
      "Modern dental studio offering preventive, cosmetic and orthodontic care with English-speaking dentists.",
    services: [
      { name: "Dental Cleaning", price: 800, durationMin: 45 },
      { name: "Teeth Whitening", price: 4500, durationMin: 60 },
      { name: "Cavity Filling", price: 1200, durationMin: 30 },
    ],
    gallery: [img("1588776814546-1ffcf47267a5"), img("1629909613654-28e377c37b09"), img("1609840114035-3c981b782dfe")],
    reviewList: [
      { user: "Alex R.", rating: 5, comment: "Painless and fast cleaning.", date: "3 days ago" },
    ],
  },
  {
    id: "c3",
    name: "Glow Up Aesthetic Center",
    category: "Facial",
    rating: 4.6,
    reviews: 612,
    startingPrice: 1200,
    location: "Thonglor, Bangkok",
    distanceKm: 3.4,
    promo: "Buy 1 facial, get 1 50%",
    thumbnail: img("1570172619644-dfd03ed5d881"),
    banner: img("1570172619644-dfd03ed5d881", 1600, 600),
    description:
      "Boutique aesthetic center known for signature hydrating facials and brightening treatments.",
    services: [
      { name: "Signature Hydrafacial", price: 2500, durationMin: 60 },
      { name: "Brightening Mask", price: 1200, durationMin: 45 },
    ],
    gallery: [img("1522337360788-8b13dee7a37e"), img("1556228720-195a672e8a03")],
    reviewList: [
      { user: "Som K.", rating: 4, comment: "Loved the facial, room was a bit small.", date: "1 week ago" },
    ],
  },
  {
    id: "c4",
    name: "ClearDerm Acne Specialists",
    category: "Acne",
    rating: 4.7,
    reviews: 845,
    startingPrice: 700,
    location: "Asoke, Bangkok",
    distanceKm: 1.9,
    promo: "Free consult this month",
    thumbnail: img("1612349317150-e413f6a5b16d"),
    banner: img("1612349317150-e413f6a5b16d", 1600, 600),
    description:
      "Dermatologist-led clinic focused on acne, scarring and long-term skin health programs.",
    services: [
      { name: "Acne Consult + Plan", price: 700, durationMin: 30 },
      { name: "Chemical Peel", price: 1800, durationMin: 40 },
    ],
    gallery: [img("1559757148-5c350d0d3c56"), img("1556228453-efd6c1ff04f6")],
    reviewList: [
      { user: "Pim L.", rating: 5, comment: "My acne cleared in 6 weeks.", date: "2 months ago" },
    ],
  },
  {
    id: "c5",
    name: "Velvet Hair & Scalp Clinic",
    category: "Hair",
    rating: 4.5,
    reviews: 421,
    startingPrice: 1500,
    location: "Ari, Bangkok",
    distanceKm: 5.1,
    thumbnail: img("1559599101-f09722fb4948"),
    banner: img("1559599101-f09722fb4948", 1600, 600),
    description: "Specialists in scalp health, hair regrowth therapy and PRP treatments.",
    services: [
      { name: "Scalp Detox Treatment", price: 1500, durationMin: 45 },
      { name: "PRP Hair Therapy", price: 6500, durationMin: 60 },
    ],
    gallery: [img("1522337094846-8a818192de1f")],
    reviewList: [
      { user: "Ken T.", rating: 5, comment: "Noticeable regrowth in 3 months.", date: "5 months ago" },
    ],
  },
];

export function getClinic(id: string) {
  return clinics.find((c) => c.id === id);
}

// Mock available time slots for a given date (deterministic by date string)
export function getTimeSlots(clinicId: string, date: Date) {
  const slots = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
  const seed = (clinicId.charCodeAt(1) + date.getDate()) % slots.length;
  return slots.map((t, i) => ({
    time: t,
    available: (i + seed) % 3 !== 0,
  }));
}

export const upcomingAppointments = [
  {
    id: "b1",
    clinicId: "c1",
    clinicName: "Aura Skin & Laser Clinic",
    service: "Pico Laser Full Face",
    date: "May 15, 2026",
    time: "14:00",
  },
  {
    id: "b2",
    clinicId: "c2",
    clinicName: "Bright Smile Dental Studio",
    service: "Dental Cleaning",
    date: "May 22, 2026",
    time: "10:00",
  },
];

export const bookingHistory = [
  {
    id: "h1",
    clinicName: "Glow Up Aesthetic Center",
    service: "Signature Hydrafacial",
    date: "Apr 12, 2026",
    status: "Completed",
  },
  {
    id: "h2",
    clinicName: "ClearDerm Acne Specialists",
    service: "Chemical Peel",
    date: "Mar 03, 2026",
    status: "Completed",
  },
];
