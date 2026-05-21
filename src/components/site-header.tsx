import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, LayoutDashboard } from "lucide-react";
import { useTranslation } from "react-i18next";
import { MedCentralLogo } from "@/components/medcentral-logo";
import { LanguageToggle } from "@/components/language-toggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function SiteHeader() {
  const { user, signOut } = useAuth();
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

        <nav className="hidden items-center gap-x-1 text-sm font-medium md:flex bg-muted/30 backdrop-blur-sm p-1 rounded-full border border-border/40 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
          <Link
            to="/"
            className="relative px-5 py-1.5 text-sm font-medium transition-all duration-300 rounded-full text-muted-foreground hover:text-foreground hover:bg-background/40 active:scale-95 active:translate-y-[0.5px] flex items-center justify-center [&.active]:text-primary [&.active]:bg-background [&.active]:border-border/60 [&.active]:font-semibold [&.active]:shadow-[0_2px_8px_rgba(0,0,0,0.06)] [&.active_>_span]:opacity-100 [&.active_>_span]:scale-x-100 border border-transparent"
            activeOptions={{ exact: true }}
          >
            {t("nav.discover")}
            <span className="absolute bottom-0 left-1/2 h-[2px] w-6 -translate-x-1/2 rounded-full bg-primary opacity-0 scale-x-50 transition-all duration-300 pointer-events-none" />
          </Link>
          <Link
            to="/categories"
            className="relative px-5 py-1.5 text-sm font-medium transition-all duration-300 rounded-full text-muted-foreground hover:text-foreground hover:bg-background/40 active:scale-95 active:translate-y-[0.5px] flex items-center justify-center [&.active]:text-primary [&.active]:bg-background [&.active]:border-border/60 [&.active]:font-semibold [&.active]:shadow-[0_2px_8px_rgba(0,0,0,0.06)] [&.active_>_span]:opacity-100 [&.active_>_span]:scale-x-100 border border-transparent"
          >
            {t("nav.categories")}
            <span className="absolute bottom-0 left-1/2 h-[2px] w-6 -translate-x-1/2 rounded-full bg-primary opacity-0 scale-x-50 transition-all duration-300 pointer-events-none" />
          </Link>
          <Link
            to="/promotions"
            className="relative px-5 py-1.5 text-sm font-medium transition-all duration-300 rounded-full text-muted-foreground hover:text-foreground hover:bg-background/40 active:scale-95 active:translate-y-[0.5px] flex items-center justify-center [&.active]:text-primary [&.active]:bg-background [&.active]:border-border/60 [&.active]:font-semibold [&.active]:shadow-[0_2px_8px_rgba(0,0,0,0.06)] [&.active_>_span]:opacity-100 [&.active_>_span]:scale-x-100 border border-transparent"
          >
            {t("nav.promotions")}
            <span className="absolute bottom-0 left-1/2 h-[2px] w-6 -translate-x-1/2 rounded-full bg-primary opacity-0 scale-x-50 transition-all duration-300 pointer-events-none" />
          </Link>
          <Link
            to="/compare"
            className="relative px-5 py-1.5 text-sm font-medium transition-all duration-300 rounded-full text-muted-foreground hover:text-foreground hover:bg-background/40 active:scale-95 active:translate-y-[0.5px] flex items-center justify-center [&.active]:text-primary [&.active]:bg-background [&.active]:border-border/60 [&.active]:font-semibold [&.active]:shadow-[0_2px_8px_rgba(0,0,0,0.06)] [&.active_>_span]:opacity-100 [&.active_>_span]:scale-x-100 border border-transparent"
          >
            {t("nav.compare")}
            <span className="absolute bottom-0 left-1/2 h-[2px] w-6 -translate-x-1/2 rounded-full bg-primary opacity-0 scale-x-50 transition-all duration-300 pointer-events-none" />
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
                <Link to="/auth" search={{ tab: "signup" }}>
                  {t("auth.signup")}
                </Link>
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
                      {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {user.name
                          .split(" ")
                          .map((p) => p[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="font-medium">{user.name}</span>
                      <span className="text-xs font-normal text-muted-foreground">
                        {user.email}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard">
                      <LayoutDashboard className="mr-2 h-4 w-4" /> {t("nav.dashboard")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={async () => {
                      await signOut();
                      navigate({ to: "/" });
                    }}
                  >
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
