import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { setLanguage } from "@/lib/i18n";
import { Globe } from "lucide-react";

export function LanguageToggle() {
  const { i18n } = useTranslation();
  const current = (i18n.language || "th").startsWith("th") ? "th" : "en";
  const next = current === "th" ? "en" : "th";

  return (
    <Button
      variant="ghost"
      size="sm"
      className="gap-1.5 px-2 font-medium"
      onClick={() => setLanguage(next)}
      aria-label="Toggle language"
    >
      <Globe className="h-4 w-4" />
      <span>{current === "th" ? "🇹🇭 TH" : "🇬🇧 EN"}</span>
    </Button>
  );
}
