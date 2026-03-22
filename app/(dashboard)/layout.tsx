"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  FileText,
  Instagram,
  Settings,
  Sparkles,
  Wand2,
  Layers,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  MoreHorizontal,
  HelpCircle,
  ChevronRight,
  CheckCircle2,
  Circle,
  ArrowRight,
  User,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useSession, signOut } from "@/lib/auth-client";
import { QueryProvider } from "@/components/query-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TourProvider } from "@/components/tour-provider";
import { TourHelpButton } from "@/components/tour-help-button";
import { useTourStore, type TourId } from "@/lib/tour-store";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, tourId: "nav-dashboard" },
  { href: "/urunler", label: "Urunler", icon: Package, tourId: "nav-urunler" },
  { href: "/desenler", label: "Desenler", icon: Layers, tourId: "nav-desenler" },
  { href: "/kategoriler", label: "Kategoriler", icon: FolderOpen, tourId: "nav-kategoriler" },
  { href: "/blog", label: "Blog", icon: FileText, tourId: "nav-blog" },
  { href: "/gorsel-olustur", label: "Gorsel Olustur", icon: Sparkles, tourId: "nav-gorsel" },
  { href: "/tasarim-uretici", label: "Tasarim Uretici", icon: Wand2, tourId: "nav-tasarim" },
  { href: "/instagram", label: "Instagram", icon: Instagram, tourId: "nav-instagram" },
  { href: "/ayarlar", label: "Ayarlar", icon: Settings, tourId: "nav-ayarlar" },
];

// Bottom nav: 3 primary tabs + "Diger"
const bottomNavItems = [
  { href: "/", label: "Ana Sayfa", icon: LayoutDashboard, tourId: "bnav-home" },
  { href: "/gorsel-olustur", label: "Gorsel", icon: Sparkles, tourId: "bnav-gorsel" },
  { href: "/tasarim-uretici", label: "Tasarim", icon: Wand2, tourId: "bnav-tasarim" },
];

// Items shown in "Diger" drawer
const moreNavItems = [
  { href: "/urunler", label: "Urunler", icon: Package, desc: "Urun yonetimi" },
  { href: "/desenler", label: "Desenler", icon: Layers, desc: "Nakis desenleri" },
  { href: "/kategoriler", label: "Kategoriler", icon: FolderOpen, desc: "Kategori yonetimi" },
  { href: "/blog", label: "Blog", icon: FileText, desc: "Yazi yonetimi" },
  { href: "/instagram", label: "Instagram", icon: Instagram, desc: "Paylasim aktarma" },
  { href: "/ayarlar", label: "Ayarlar", icon: Settings, desc: "Site ayarlari" },
];

const tourOptions: { id: TourId; label: string; path: string }[] = [
  { id: "admin", label: "Genel Tanitim", path: "/" },
  { id: "urunler", label: "Urun Yonetimi", path: "/urunler" },
  { id: "desenler", label: "Desen Yonetimi", path: "/desenler" },
  { id: "kategoriler", label: "Kategori Yonetimi", path: "/kategoriler" },
  { id: "gorsel", label: "AI Gorsel", path: "/gorsel-olustur" },
];

function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[272px] flex-col bg-sidebar backdrop-blur-xl transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto",
          "border-r border-sidebar-border/50",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between px-6" data-tour="sidebar-logo">
          <Link href="/" className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-primary" onClick={onClose}>
            <Image src="/logo.webp" alt="Elizim" width={32} height={32} className="rounded-xl" />
            Elizim
          </Link>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-sidebar-foreground hover:bg-sidebar-accent lg:hidden"
          >
            <X className="size-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 px-3 pt-2">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                data-tour={item.tourId}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-[13px] font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary shadow-[inset_0_1px_1px_oklch(1_0_0/10%)]"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <item.icon className={cn("size-[18px] shrink-0", isActive && "text-primary")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 space-y-2">
          <TourHelpButton />
          <p className="px-3 text-[11px] text-muted-foreground/60">
            Elizim.art Admin v1.0
          </p>
        </div>
      </aside>
    </>
  );
}

function MobileHelpButton() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const {
    startTour,
    resetTour,
    completedTours,
    welcomeSeen,
    markWelcomeSeen,
    startFullOnboarding,
    _hasHydrated,
  } = useTourStore();

  const completedCount = completedTours.length;
  const totalCount = tourOptions.length;
  const showWelcome = _hasHydrated && !welcomeSeen;

  function handleStartTour(tourId: TourId, path: string) {
    setOpen(false);
    if (!welcomeSeen) markWelcomeSeen();
    resetTour(tourId);
    if (pathname === path) {
      setTimeout(() => startTour(tourId), 300);
    } else {
      router.push(path);
      setTimeout(() => startTour(tourId), 800);
    }
  }

  return (
    <div className="relative" data-tour="header-help">
      <button
        onClick={() => setOpen(!open)}
        className="relative flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
      >
        <Sparkles className="size-3.5" />
        <span className="hidden sm:inline">Oglum yardim et</span>
        <span className="sm:hidden">Yardim</span>
        {completedCount < totalCount && (
          <span className="size-1.5 rounded-full bg-primary animate-pulse" />
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => { setOpen(false); if (!welcomeSeen) markWelcomeSeen(); }} />
          <div
            className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-border/50 shadow-xl"
            style={{
              background: "var(--glass-bg-thick)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
            }}
          >
            {showWelcome ? (
              <div className="p-5 text-center">
                <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary/10">
                  <Sparkles className="size-6 text-primary" />
                </div>
                <h3 className="text-base font-semibold">Hosgeldin anne!</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">Oglun her seyi ayarladi, adim adim gostereyim!</p>
                <button
                  onClick={() => { setOpen(false); startFullOnboarding(); }}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground"
                >
                  Baslat oglum <ArrowRight className="size-4" />
                </button>
                <button
                  onClick={() => { markWelcomeSeen(); setOpen(false); }}
                  className="mt-2 w-full py-1.5 text-sm text-muted-foreground"
                >
                  Sonra
                </button>
              </div>
            ) : (
              <div className="py-3">
                {/* Progress */}
                <div className="px-4 pb-3">
                  <p className="text-xs font-medium text-muted-foreground">
                    {completedCount === totalCount
                      ? "Aferin anne, hepsini ogrendin!"
                      : `${completedCount}/${totalCount} tur tamamlandi`}
                  </p>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-border">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${(completedCount / totalCount) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Tour list */}
                <div className="px-2">
                  {tourOptions.map((tour) => {
                    const isCompleted = completedTours.includes(tour.id);
                    return (
                      <button
                        key={tour.id}
                        onClick={() => handleStartTour(tour.id, tour.path)}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-start transition-all hover:bg-muted/50"
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                        ) : (
                          <Circle className="size-4 shrink-0 text-muted-foreground/40" />
                        )}
                        <span className="flex-1 text-[13px] font-medium">{tour.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  async function handleLogout() {
    await signOut();
    router.push("/giris");
  }

  return (
    <header className="flex h-14 items-center justify-between px-4 lg:px-6">
      <button
        onClick={onMenuClick}
        data-tour="mobile-menu"
        className="rounded-xl p-2 text-foreground hover:bg-muted/70 lg:hidden hidden"
      >
        <Menu className="size-5" />
      </button>

      <Link href="/" className="flex items-center gap-2 text-base font-bold tracking-tight text-primary lg:hidden">
        <Image src="/logo.webp" alt="Elizim" width={28} height={28} className="rounded-lg" />
        Elizim
      </Link>

      <div className="ml-auto flex items-center gap-1">
        {session?.user && (
          <span className="mr-2 hidden rounded-full bg-muted/60 px-3 py-1.5 text-xs font-medium text-muted-foreground sm:inline">
            {session.user.name || session.user.email}
          </span>
        )}

        {/* Yardim butonu — header'da her zaman gorunur (mobilde ozellikle onemli) */}
        <MobileHelpButton />

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Tema degistir"
          className="hidden lg:flex"
        >
          <Sun className="size-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute size-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          aria-label="Cikis yap"
          className="hidden lg:flex"
        >
          <LogOut className="size-4" />
        </Button>
      </div>
    </header>
  );
}

function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const { resolvedTheme, setTheme } = useTheme();
  const [moreOpen, setMoreOpen] = useState(false);
  const isMoreActive = moreNavItems.some((item) =>
    item.href === "/" ? pathname === item.href : pathname.startsWith(item.href)
  );

  async function handleLogout() {
    await signOut();
    router.push("/giris");
  }

  return (
    <>
      {/* Overlay */}
      {moreOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMoreOpen(false)}
        />
      )}

      {/* "Diger" bottom sheet — full featured */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 max-h-[85dvh] overflow-y-auto rounded-t-3xl border-t border-border/50 bg-card/98 shadow-[0_-8px_40px_oklch(0_0_0/18%)] backdrop-blur-xl transition-transform duration-300 ease-out lg:hidden",
          moreOpen ? "translate-y-0" : "translate-y-full"
        )}
      >
        {/* Handle */}
        <div className="sticky top-0 z-10 flex justify-center bg-card/98 pb-2 pt-3 backdrop-blur-xl">
          <div className="h-1 w-10 rounded-full bg-muted-foreground/20" />
        </div>

        {/* User info */}
        {session?.user && (
          <div className="mx-4 mb-3 flex items-center gap-3 rounded-2xl bg-muted/40 p-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
              <User className="size-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium">{session.user.name || "Kullanici"}</p>
              <p className="truncate text-[11px] text-muted-foreground">{session.user.email}</p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="px-4 pb-2">
          <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Sayfalar
          </p>
          <div className="space-y-0.5">
            {moreNavItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-all",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-muted/50"
                  )}
                >
                  <item.icon className={cn("size-[18px] shrink-0", isActive && "text-primary")} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium">{item.label}</p>
                    <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground/40" />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="mx-4 my-2 h-px bg-border/50" />

        {/* Quick actions */}
        <div className="px-4 pb-4">
          <div className="flex gap-2">
            {/* Theme toggle */}
            <button
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-muted/40 py-3 text-sm font-medium text-foreground transition-all hover:bg-muted/60"
            >
              <Sun className="size-4 dark:hidden" />
              <Moon className="hidden size-4 dark:block" />
              <span className="text-xs dark:hidden">Koyu Tema</span>
              <span className="hidden text-xs dark:inline">Acik Tema</span>
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-red-500/10 py-3 text-sm font-medium text-red-600 transition-all hover:bg-red-500/15 dark:text-red-400"
            >
              <LogOut className="size-4" />
              <span className="text-xs">Cikis Yap</span>
            </button>
          </div>
        </div>

        {/* Safe area padding */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>

      {/* Bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border/50 bg-card backdrop-blur-xl lg:hidden" data-tour="bottom-nav">
        <div className="flex items-stretch">
          {bottomNavItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                data-tour={item.tourId}
                className={cn(
                  "flex flex-1 flex-col items-center gap-0.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                <item.icon className={cn("size-5", isActive && "text-primary")} />
                <span className={cn("text-[10px] font-medium", isActive && "text-primary")}>
                  {item.label}
                </span>
              </Link>
            );
          })}

          <button
            onClick={() => setMoreOpen(!moreOpen)}
            data-tour="bnav-diger"
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 transition-colors",
              isMoreActive || moreOpen
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            <MoreHorizontal className={cn("size-5", (isMoreActive || moreOpen) && "text-primary")} />
            <span className={cn("text-[10px] font-medium", (isMoreActive || moreOpen) && "text-primary")}>
              Diger
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <QueryProvider>
      <div className="flex h-dvh overflow-hidden">
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4 pb-20 lg:p-6 lg:pb-6">
            {children}
          </main>
        </div>
        <BottomNav />
        <TourProvider />
      </div>
    </QueryProvider>
  );
}
