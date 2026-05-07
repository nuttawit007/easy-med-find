import { useState } from "react";
import { Sparkles, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const QUICK_REPLIES = ["Acne", "Laser", "Dental", "Facial Adjustment", "Hair Loss"];

type Msg = { role: "agent" | "user"; text: string };

const replyFor = (topic: string): string => {
  const t = topic.toLowerCase();
  if (t.includes("acne")) return "Got it — for acne, I recommend ClearDerm Acne Specialists. Want me to show top-rated options near you?";
  if (t.includes("laser")) return "Perfect — Aura Skin & Laser Clinic has a 30% off promo right now. Should I open it?";
  if (t.includes("dental")) return "For dental, Bright Smile Dental Studio is highly rated and offers free whitening with cleaning.";
  if (t.includes("facial")) return "Glow Up Aesthetic Center has a buy-1-get-1 50% facial promo this week.";
  if (t.includes("hair")) return "Velvet Hair & Scalp Clinic specializes in PRP and regrowth therapy.";
  return "I can help you find the right clinic. Tell me what you'd like to improve and I'll match you with the best-rated options.";
};

export function AIChatHero() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "agent", text: "Hi! I'm your clinic assistant. What are you looking to improve today?" },
  ]);
  const [input, setInput] = useState("");

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: "user", text }, { role: "agent", text: replyFor(text) }]);
    setInput("");
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-glow sm:p-6">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-primary">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-soft">
          <Sparkles className="h-4 w-4" />
        </div>
        AI Clinic Assistant
      </div>

      <div className="mb-4 max-h-64 space-y-2 overflow-y-auto pr-1">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
              m.role === "agent"
                ? "bg-muted text-foreground"
                : "ml-auto bg-primary text-primary-foreground"
            }`}
          >
            {m.text}
          </div>
        ))}
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {QUICK_REPLIES.map((q) => (
          <button
            key={q}
            onClick={() => send(q)}
            className="rounded-full border border-border bg-accent/40 px-3 py-1 text-xs font-medium text-accent-foreground transition hover:bg-accent"
          >
            {q}
          </button>
        ))}
      </div>

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
          placeholder="Type your concern…"
          className="bg-background"
        />
        <Button type="submit" size="icon" aria-label="Send">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
