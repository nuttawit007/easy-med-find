import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const STORAGE_KEY = "medcentral_lang";

const resources = {
  en: {
    translation: {
      nav: {
        discover: "Discover",
        categories: "Categories",
        promotions: "Promotions",
        compare: "Compare",
        dashboard: "Dashboard",
      },
      auth: {
        login: "Log In",
        signup: "Sign Up",
        logout: "Log out",
        email: "Email",
        password: "Password",
        emailPlaceholder: "you@example.com",
        passwordPlaceholder: "••••••••",
        signInCta: "Sign In",
        signUpCta: "Create account",
        orContinueWith: "Or continue with",
        haveAccount: "Already have an account?",
        noAccount: "Don't have an account?",
        switchToSignUp: "Sign up",
        switchToSignIn: "Sign in",
        signInTitle: "Welcome back",
        signUpTitle: "Create your account",
        signInSubtitle: "Sign in to continue",
        signUpSubtitle: "Get started in seconds",
        checkEmail: "Check your email to confirm your account.",
      },
      common: {
        search: "Search",
        bookNow: "Book Now",
        startingFrom: "Starting from",
        compare: "Compare",
        viewDetails: "View Details",
        loading: "Loading...",
        all: "All",
        filters: "Filters",
      },
      home: {
        badge: "AI-powered clinic finder",
        heroTitle: "Find the right clinic.",
        heroAccent: "Skip the wait.",
        heroSubtitle:
          "Compare verified clinics, read real reviews, and book appointments in seconds — guided by an AI assistant that understands your needs.",
        startExploring: "Start exploring",
        compareClinics: "Compare clinics",
        searchPlaceholder: "Clinic name or procedure",
        locationPlaceholder: "Location (e.g. Sukhumvit)",
        category: "Category",
        allCategories: "All categories",
        anyPrice: "Any price",
        promotionsAll: "All clinics",
        promotionsOnly: "With promotions",
        hotPromotions: "🔥 Hot promotions",
        hotPromotionsSub: "Limited-time offers from top-rated clinics",
        recommended: "📍 Recommended near you",
        recommendedSub: "Based on your location and preferences",
        allClinics: "All clinics",
        noResults: "No clinics match your filters. Try clearing them.",
        footer: "© 2026 MedCentral · Trusted clinics, transparent pricing.",
      },
      lang: { switch: "Language" },
    },
  },
  th: {
    translation: {
      nav: {
        discover: "ค้นหาคลินิก",
        categories: "บริการ",
        promotions: "โปรโมชั่น",
        compare: "เปรียบเทียบ",
        dashboard: "แดชบอร์ด",
      },
      auth: {
        login: "เข้าสู่ระบบ",
        signup: "สมัครสมาชิก",
        logout: "ออกจากระบบ",
      },
      common: {
        search: "ค้นหา",
        bookNow: "จองเลย",
        startingFrom: "เริ่มต้นที่",
        compare: "เปรียบเทียบ",
        viewDetails: "ดูรายละเอียด",
        loading: "กำลังโหลด...",
        all: "ทั้งหมด",
        filters: "ตัวกรอง",
      },
      home: {
        badge: "ผู้ช่วย AI ค้นหาคลินิก",
        heroTitle: "ค้นหาและจองคลินิกที่ใช่",
        heroAccent: "สำหรับคุณ",
        heroSubtitle:
          "เปรียบเทียบคลินิกที่ผ่านการตรวจสอบ อ่านรีวิวจริง และจองนัดได้ในไม่กี่วินาที พร้อมผู้ช่วย AI ที่เข้าใจความต้องการของคุณ",
        startExploring: "เริ่มค้นหา",
        compareClinics: "เปรียบเทียบคลินิก",
        searchPlaceholder: "ชื่อคลินิกหรือบริการ",
        locationPlaceholder: "พื้นที่ (เช่น สุขุมวิท)",
        category: "หมวดหมู่",
        allCategories: "ทุกหมวดหมู่",
        anyPrice: "ทุกช่วงราคา",
        promotionsAll: "คลินิกทั้งหมด",
        promotionsOnly: "เฉพาะมีโปรโมชั่น",
        hotPromotions: "🔥 โปรโมชั่นเด็ด",
        hotPromotionsSub: "ข้อเสนอจำกัดเวลา จากคลินิกชั้นนำ",
        recommended: "📍 แนะนำใกล้คุณ",
        recommendedSub: "อิงตามตำแหน่งและความต้องการของคุณ",
        allClinics: "คลินิกทั้งหมด",
        noResults: "ไม่พบคลินิกที่ตรงกับตัวกรอง ลองล้างตัวกรอง",
        footer: "© 2026 MedCentral · คลินิกที่เชื่อถือได้ ราคาโปร่งใส",
      },
      lang: { switch: "ภาษา" },
    },
  },
} as const;

const initialLang =
  typeof window !== "undefined"
    ? window.localStorage.getItem(STORAGE_KEY) || "th"
    : "th";

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: initialLang,
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });
}

export const setLanguage = (lng: "th" | "en") => {
  i18n.changeLanguage(lng);
  if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, lng);
};

export default i18n;
