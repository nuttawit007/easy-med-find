import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, LayoutDashboard, Menu } from "lucide-react";
import { useState } from "react";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";

export function SiteHeader() {
  const { user, signOut } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Centralized nav links to keep the desktop and mobile menus perfectly in sync
  const navLinks = [
    { to: "/", label: t("nav.discover"), exact: true },
    { to: "/categories", label: t("nav.categories") },
    { to: "/promotions", label: t("nav.promotions") },
    { to: "/compare", label: t("nav.compare") },
  ] as const;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <MedCentralLogo size={36} className="shadow-soft rounded-xl" />
          <span className="text-lg font-bold tracking-tight">
            Med<span className="text-primary">Central</span>
          </span>
        </Link>

        {/* Desktop Nav - Retains the beautiful animated styles from snippet 1 */}
        <nav className="hidden items-center gap-x-1 text-sm font-medium md:flex bg-muted/30 backdrop-blur-sm p-1 rounded-full border border-border/40 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="relative px-5 py-1.5 text-sm font-medium transition-all duration-300 rounded-full text-muted-foreground hover:text-foreground hover:bg-background/40 active:scale-95 active:translate-y-[0.5px] flex items-center justify-center [&.active]:text-primary [&.active]:bg-background [&.active]:border-border/60 [&.active]:font-semibold [&.active]:shadow-[0_2px_8px_rgba(0,0,0,0.06)] [&.active_>_span]:opacity-100 [&.active_>_span]:scale-x-100 border border-transparent"
              activeOptions={"exact" in link ? { exact: true } : undefined}
            >
              {link.label}
              <span className="absolute bottom-0 left-1/2 h-[2px] w-6 -translate-x-1/2 rounded-full bg-primary opacity-0 scale-x-50 transition-all duration-300 pointer-events-none" />
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-x-2">
          <LanguageToggle />

          {/* Desktop Auth / User Menu - Hidden on mobile screens */}
          {!user ? (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden w-28 md:inline-flex">
                <Link to="/auth">{t("auth.login")}</Link>
              </Button>
              <Button asChild size="sm" className="hidden w-28 shadow-soft md:inline-flex">
                <Link to="/auth" search={{ tab: "signup" }}>
                  {t("auth.signup")}
                </Link>
              </Button>
            </>
          ) : (
            <div className="hidden md:flex items-center gap-x-2">
              <Button asChild variant="ghost" size="sm">
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
            </div>
          )}

          {/* Mobile Hamburger Menu Trigger */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile Drawer (Sheet) - Retains full mobile functionality from snippet 2 */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="right" className="flex w-72 flex-col p-0">
          <SheetHeader className="border-b border-border/60 px-6 pb-4 pt-6">
            <SheetTitle className="flex items-center gap-2.5">
              <MedCentralLogo size={30} className="shadow-soft rounded-xl" />
              <span className="text-base font-bold tracking-tight">
                Med<span className="text-primary">Central</span>
              </span>
            </SheetTitle>
          </SheetHeader>

          <nav className="flex flex-1 flex-col gap-1 px-4 py-4">
            {navLinks.map((link) => (
              <SheetClose key={link.to} asChild>
                <Link
                  to={link.to}
                  className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  activeProps={{
                    className:
                      "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary",
                  }}
                  activeOptions={"exact" in link ? { exact: true } : undefined}
                >
                  {link.label}
                </Link>
              </SheetClose>
            ))}

            <div className="my-3 border-t border-border/60" />

            {/* Mobile Auth section */}
            {!user ? (
              <div className="flex flex-col gap-2">
                <SheetClose asChild>
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link to="/auth">{t("auth.login")}</Link>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button asChild className="w-full justify-start shadow-soft">
                    <Link to="/auth" search={{ tab: "signup" }}>
                      {t("auth.signup")}
                    </Link>
                  </Button>
                </SheetClose>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <div className="mb-1 flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2">
                  <Avatar className="h-8 w-8 shrink-0">
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
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{user.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <SheetClose asChild>
                  <Link
                    to="/dashboard"
                    className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" /> {t("nav.dashboard")}
                  </Link>
                </SheetClose>
                <button
                  className="flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  onClick={async () => {
                    setMobileOpen(false);
                    await signOut();
                    navigate({ to: "/" });
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" /> {t("auth.logout")}
                </button>
              </div>
            )}
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
}