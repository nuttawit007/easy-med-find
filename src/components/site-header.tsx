import { Link } from "@tanstack/react-router";
import { Stethoscope, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-soft">
            <Stethoscope className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            Med<span className="text-primary">Central</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link to="/" className="text-muted-foreground transition-colors hover:text-foreground" activeProps={{ className: "text-foreground" }}>
            Discover
          </Link>
          <Link to="/compare" className="text-muted-foreground transition-colors hover:text-foreground" activeProps={{ className: "text-foreground" }}>
            Compare
          </Link>
          <Link to="/dashboard" className="text-muted-foreground transition-colors hover:text-foreground" activeProps={{ className: "text-foreground" }}>
            My bookings
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/auth">Sign in</Link>
          </Button>
          <Button asChild size="sm" className="shadow-soft">
            <Link to="/dashboard">
              <User className="mr-1 h-4 w-4" /> Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
