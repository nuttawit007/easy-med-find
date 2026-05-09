import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, LayoutDashboard } from "lucide-react";
import { useTranslation } from "react-i18next";
import { MedCentralLogo } from "@/components/medcentral-logo";
import { LanguageToggle } from "@/components/language-toggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function SiteHeader() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2.5">
          <MedCentralLogo size={36} className="shadow-soft rounded-xl" />
          <span className="text-lg font-bold tracking-tight">
            Med<span className="text-primary">Central</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-x-2 text-sm font-medium md:flex">
          <Link to="/" className="inline-block min-w-[100px] text-center text-muted-foreground transition-colors hover:text-foreground" activeProps={{ className: "text-foreground" }} activeOptions={{ exact: true }}>
            {t("nav.discover")}
          </Link>
          <Link to="/categories" className="inline-block min-w-[100px] text-center text-muted-foreground transition-colors hover:text-foreground" activeProps={{ className: "text-foreground" }}>
            {t("nav.categories")}
          </Link>
          <Link to="/promotions" className="inline-block min-w-[100px] text-center text-muted-foreground transition-colors hover:text-foreground" activeProps={{ className: "text-foreground" }}>
            {t("nav.promotions")}
          </Link>
          <Link to="/compare" className="inline-block min-w-[100px] text-center text-muted-foreground transition-colors hover:text-foreground" activeProps={{ className: "text-foreground" }}>
            {t("nav.compare")}
          </Link>
        </nav>

        <div className="flex items-center gap-x-2">
          <LanguageToggle />
          {!user ? (
            <>
              <Button asChild variant="ghost" size="sm" className="w-28">
                <Link to="/auth">{t("auth.login")}</Link>
              </Button>
              <Button asChild size="sm" className="w-28 shadow-soft">
                <Link to="/auth">{t("auth.signup")}</Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link to="/dashboard">
                  <LayoutDashboard className="mr-1 h-4 w-4" /> {t("nav.dashboard")}
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {user.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="font-medium">{user.name}</span>
                      <span className="text-xs font-normal text-muted-foreground">{user.email}</span>
                      <span className="mt-1 text-xs font-normal text-primary capitalize">{user.role.replace("_", " ")}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard"><LayoutDashboard className="mr-2 h-4 w-4" /> {t("nav.dashboard")}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { logout(); navigate({ to: "/" }); }}>
                    <LogOut className="mr-2 h-4 w-4" /> {t("auth.logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
