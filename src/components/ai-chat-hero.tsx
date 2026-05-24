import { useState } from "react";
import { Sparkles, Send, Bot } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Quick-reply values must stay in English — they are matched by replyFor() via .includes()
// They are also medical category names (technical terms kept as-is per project rule)
const QUICK_REPLIES = ["Acne", "Laser", "Dental", "Facial Adjustment", "Hair Loss"];

type Msg = { role: "agent" | "user"; text: string };

const replyFor = (topic: string): string => {
  const t = topic.toLowerCase();
  if (t.includes("acne"))
    return "Got it — for acne, I recommend ClearDerm Acne Specialists. Want me to show top-rated options near you?";
  if (t.includes("laser"))
    return "Perfect — Aura Skin & Laser Clinic has a 30% off promo right now. Should I open it?";
  if (t.includes("dental"))
    return "For dental, Bright Smile Dental Studio is highly rated and offers free whitening with cleaning.";
  if (t.includes("facial"))
    return "Glow Up Aesthetic Center has a buy-1-get-1 50% facial promo this week.";
  if (t.includes("hair"))
    return "Velvet Hair & Scalp Clinic specializes in PRP and regrowth therapy.";
  return "I can help you find the right clinic. Tell me what you'd like to improve and I'll match you with the best-rated options.";
};

export function AIChatHero() {
  const { t } = useTranslation();

  const [messages, setMessages] = useState<Msg[]>([
    { role: "agent", text: t("aiChat.initialMessage") },
  ]);
  const [input, setInput] = useState("");

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: "user", text }, { role: "agent", text: replyFor(text) }]);
    setInput("");
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card p-5 shadow-glow sm:p-6">
      {/* Subtle background glow */}
      <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-secondary/10 blur-2xl" />

      {/* Header */}
      <div className="relative mb-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary shadow-soft">
          <Bot className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <p className="text-sm font-bold leading-none text-foreground">{t("aiChat.title")}</p>
          <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
            {t("aiChat.status")}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1 rounded-full border border-border bg-primary-soft px-2.5 py-1">
          <Sparkles className="h-3 w-3 text-primary" />
          {/* "AI Powered" is a technical badge — kept as-is */}
          <span className="text-[10px] font-semibold text-primary">{t("aiChat.aiPowered")}</span>
        </div>
      </div>

      {/* Messages */}
      <div className="relative mb-4 max-h-56 space-y-2.5 overflow-y-auto pr-1">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                m.role === "agent"
                  ? "rounded-tl-sm bg-muted text-foreground"
                  : "rounded-tr-sm bg-primary text-primary-foreground shadow-soft"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {/* Quick replies — medical category terms, kept in English */}
      <div className="mb-3 flex flex-wrap gap-2">
        {QUICK_REPLIES.map((q) => (
          <button
            key={q}
            onClick={() => send(q)}
            className="cursor-pointer rounded-full border border-border bg-accent/30 px-3 py-1 text-xs font-medium text-accent-foreground
              transition-all duration-200 hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-soft"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex gap-2"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("aiChat.placeholder")}
          className="cursor-text rounded-xl border-border/60 bg-background/80 backdrop-blur-sm transition-colors focus:border-primary"
        />
        <Button
          type="submit"
          size="icon"
          className="shrink-0 cursor-pointer rounded-xl shadow-soft"
          aria-label="Send"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
