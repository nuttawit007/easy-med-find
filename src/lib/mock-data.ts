export type OpeningHoursEntry = {
  day: string;
  isOpen: boolean;
  open: string; // "09:00"
  close: string; // "18:00"
};

export type Clinic = {
  id: string;
  ownerId?: string;
  name: string;
  category: string;
  rating: number;
  reviews: number;
  startingPrice: number;
  location: string;
  distanceKm: number;
  promo?: string;
  promoEn?: string; // English version of the promo text
  thumbnail: string;
  banner: string;
  description: string;
  descriptionEn?: string; // English version of the description
  services: { name: string; nameEn?: string; price: number; durationMin: number }[];
  gallery: string[];
  reviewList: { user: string; rating: number; comment: string; date: string }[];
  verified?: boolean;
  // Contact & hours (optional — backward compatible)
  phone?: string;
  email?: string;
  website?: string;
  openingHours?: OpeningHoursEntry[];
};

const img = (seed: string, w = 800, h = 500) =>
  `https://images.unsplash.com/photo-${seed}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

export const CATEGORIES = ["Acne", "Laser", "Dental", "Facial", "Skin", "Hair"] as const;

export const clinics: Clinic[] = [
  {
    id: "c1",
    ownerId: "mock-clinic",
    name: "Aura Skin & Laser Clinic",
    category: "Laser",
    rating: 4.8,
    reviews: 1284,
    startingPrice: 990,
    location: "Sukhumvit, Bangkok",
    distanceKm: 1.2,
    promo: "ลด 30% สำหรับเลเซอร์ครั้งแรก",
    promoEn: "30% off your first laser treatment",
    thumbnail: img("1629909613654-28e377c37b09"),
    banner: img("1629909613654-28e377c37b09", 1600, 600),
    description:
      "คลินิกความงามรางวัลเลิศ เชี่ยวชาญด้านเลเซอร์กำจัดขน รักษาจุดด่างดำ และฟื้นฟูผิวด้วยเครื่องมือที่ผ่านการรับรอง FDA",
    descriptionEn:
      "Award-winning aesthetic clinic specializing in laser hair removal, dark spot treatment, and skin rejuvenation with FDA-approved equipment.",
    services: [
      {
        name: "กำจัดขนด้วยเลเซอร์ (รักแร้)",
        nameEn: "Laser Hair Removal (Underarms)",
        price: 990,
        durationMin: 30,
      },
      {
        name: "Pico Laser เต็มใบหน้า",
        nameEn: "Pico Laser Full Face",
        price: 3500,
        durationMin: 45,
      },
      { name: "รักษาสิวด้วยเลเซอร์", nameEn: "Acne Laser Treatment", price: 2200, durationMin: 40 },
    ],
    gallery: [
      img("1576091160550-2173dba999ef"),
      img("1612349317150-e413f6a5b16d"),
      img("1581093588401-fbb62a02f120"),
    ],
    reviewList: [
      {
        user: "Mint P.",
        rating: 5,
        comment: "Skin glowed after just 2 sessions!",
        date: "2 weeks ago",
      },
      {
        user: "Joon W.",
        rating: 5,
        comment: "Friendly staff, modern equipment.",
        date: "1 month ago",
      },
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
    promo: "ฟอกสีฟันฟรีเมื่อขูดหินปูน",
    promoEn: "Free whitening with scaling",
    thumbnail: img("1606811841689-23dfddce3e95"),
    banner: img("1606811841689-23dfddce3e95", 1600, 600),
    description:
      "คลินิกทันตกรรมสมัยใหม่ บริการครบวงจรทั้งทันตกรรมป้องกัน เสริมความงาม และจัดฟัน โดยทันตแพทย์ผู้เชี่ยวชาญ",
    descriptionEn:
      "Modern dental clinic offering comprehensive preventive, cosmetic, and orthodontic treatments by specialist dentists.",
    services: [
      { name: "ขูดหินปูน", nameEn: "Teeth Scaling & Cleaning", price: 800, durationMin: 45 },
      { name: "ฟอกสีฟัน", nameEn: "Teeth Whitening", price: 4500, durationMin: 60 },
      { name: "อุดฟัน", nameEn: "Dental Filling", price: 1200, durationMin: 30 },
    ],
    gallery: [
      img("1588776814546-1ffcf47267a5"),
      img("1629909613654-28e377c37b09"),
      img("1609840114035-3c981b782dfe"),
    ],
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
    promo: "ซื้อ 1 Facial รับส่วนลด 50% ครั้งที่ 2",
    promoEn: "Buy 1 Facial, get 50% off the 2nd",
    thumbnail: img("1570172619644-dfd03ed5d881"),
    banner: img("1570172619644-dfd03ed5d881", 1600, 600),
    description:
      "ศูนย์ความงามบูทีค ขึ้นชื่อด้าน Hydrafacial สูตรพิเศษ และการรักษาเพื่อผิวกระจ่างใส",
    descriptionEn:
      "Boutique aesthetic center known for its signature Hydrafacial and brightening skin treatments.",
    services: [
      {
        name: "Hydrafacial สูตรพิเศษ",
        nameEn: "Signature Hydrafacial",
        price: 2500,
        durationMin: 60,
      },
      { name: "มาสก์ผิวกระจ่างใส", nameEn: "Brightening Skin Mask", price: 1200, durationMin: 45 },
    ],
    gallery: [img("1522337360788-8b13dee7a37e"), img("1556228720-195a672e8a03")],
    reviewList: [
      {
        user: "Som K.",
        rating: 4,
        comment: "Loved the facial, room was a bit small.",
        date: "1 week ago",
      },
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
    promo: "ปรึกษาฟรีตลอดเดือนนี้",
    promoEn: "Free consultation all month",
    thumbnail: img("1612349317150-e413f6a5b16d"),
    banner: img("1612349317150-e413f6a5b16d", 1600, 600),
    description:
      "คลินิกนำโดยแพทย์ผิวหนัง เชี่ยวชาญด้านสิว รอยแผลเป็น และโปรแกรมดูแลสุขภาพผิวระยะยาว",
    descriptionEn:
      "Dermatologist-led clinic specializing in acne, scarring, and long-term skin health programs.",
    services: [
      {
        name: "ปรึกษาและวางแผนรักษาสิว",
        nameEn: "Acne Consultation & Treatment Plan",
        price: 700,
        durationMin: 30,
      },
      { name: "Chemical Peel", nameEn: "Chemical Peel", price: 1800, durationMin: 40 },
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
    description: "ผู้เชี่ยวชาญด้านสุขภาพหนังศีรษะ การรักษาผมร่วง และการบำบัดด้วย PRP",
    descriptionEn: "Scalp health specialists offering hair loss treatments and PRP therapy.",
    services: [
      {
        name: "บำบัดหนังศีรษะ Detox",
        nameEn: "Scalp Detox Treatment",
        price: 1500,
        durationMin: 45,
      },
      { name: "การรักษาผมด้วย PRP", nameEn: "PRP Hair Restoration", price: 6500, durationMin: 60 },
    ],
    gallery: [img("1522337094846-8a818192de1f")],
    reviewList: [
      {
        user: "Ken T.",
        rating: 5,
        comment: "Noticeable regrowth in 3 months.",
        date: "5 months ago",
      },
    ],
  },
];

export function getClinic(id: string) {
  return clinics.find((c) => c.id === id);
}

// Maps JS Date.getDay() (0=Sun, 1=Mon, ... 6=Sat) to the full day names used in openingHours
const JS_DAY_TO_NAME = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

/**
 * Returns available time slots for a given date.
 * If the clinic has openingHours and the day is closed, returns [].
 */
/** Parse "HH:MM" string into total minutes from midnight. */
function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

/** Format total minutes as "HH:MM". */
function fromMinutes(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function getTimeSlots(clinicId: string, date: Date, openingHours?: OpeningHoursEntry[]) {
  // Default slot list (used when no openingHours are set)
  let slotTimes: string[] = [
    "09:00",
    "10:00",
    "11:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
  ];

  if (openingHours && openingHours.length > 0) {
    const dayName = JS_DAY_TO_NAME[date.getDay()];
    const entry = openingHours.find((h) => h.day === dayName);

    // Closed this day → no slots
    if (entry && !entry.isOpen) return [];

    // Generate hourly slots within [open, close) — exclusive end
    if (entry && entry.open && entry.close) {
      const openMin = toMinutes(entry.open);
      const closeMin = toMinutes(entry.close);
      const generated: string[] = [];
      for (let m = openMin; m < closeMin; m += 60) {
        generated.push(fromMinutes(m));
      }
      if (generated.length > 0) slotTimes = generated;
    }
  }

  const seed = (clinicId.charCodeAt(1) + date.getDate()) % slotTimes.length;
  return slotTimes.map((t, i) => ({
    time: t,
    available: (i + seed) % 3 !== 0,
  }));
}

export type Appointment = {
  id: string;
  clinicId?: string;
  clinicName: string;
  service: string;
  date: string;
  time?: string;
  status?: string;
};

export const upcomingAppointments: Appointment[] = [];
export const bookingHistory: Appointment[] = [];

export const pendingClinics = [
  {
    id: "pc1",
    name: "Lumina Aesthetic Clinic",
    category: "Facial",
    submitted: "May 5, 2026",
    location: "Phrom Phong",
  },
  {
    id: "pc2",
    name: "DentaPro Smile Center",
    category: "Dental",
    submitted: "May 6, 2026",
    location: "Ratchada",
  },
];

export const pendingServices = [
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
];

export const clinicAdminAppointments: Appointment[] = [
  {
    id: "ca1",
    clinicName: "Aura Skin & Laser",
    service: "Pico Laser Full Face",
    date: "May 10, 2026",
    time: "11:00",
    status: "Confirmed",
  },
  {
    id: "ca2",
    clinicName: "Aura Skin & Laser",
    service: "Laser Hair Removal",
    date: "May 10, 2026",
    time: "14:00",
    status: "Pending",
  },
  {
    id: "ca3",
    clinicName: "Aura Skin & Laser",
    service: "Acne Laser Treatment",
    date: "May 11, 2026",
    time: "09:30",
    status: "Confirmed",
  },
];
