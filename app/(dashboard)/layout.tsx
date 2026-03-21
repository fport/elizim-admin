"use client";

import { useState } from "react";
import Link from "next/link";
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
} from "lucide-react";
import { useTheme } from "next-themes";
import { useSession, signOut } from "@/lib/auth-client";
import { QueryProvider } from "@/components/query-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TourProvider } from "@/components/tour-provider";
import { TourHelpButton } from "@/components/tour-help-button";

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
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[272px] flex-col bg-sidebar backdrop-blur-xl transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto",
          "border-r border-sidebar-border/50",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-6" data-tour="sidebar-logo">
          <Link href="/" className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-primary" onClick={onClose}>
            <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10">
              <span className="text-sm">E</span>
            </div>
            Elizim
          </Link>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-sidebar-foreground hover:bg-sidebar-accent lg:hidden"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Nav */}
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

        {/* Bottom */}
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
      {/* Left: hamburger */}
      <button
        onClick={onMenuClick}
        data-tour="mobile-menu"
        className="rounded-xl p-2 text-foreground hover:bg-muted/70 lg:hidden"
      >
        <Menu className="size-5" />
      </button>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-1">
        {session?.user && (
          <span className="mr-2 hidden rounded-full bg-muted/60 px-3 py-1.5 text-xs font-medium text-muted-foreground sm:inline">
            {session.user.name || session.user.email}
          </span>
        )}

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Tema degistir"
        >
          <Sun className="size-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute size-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
        </Button>

        {/* Logout */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          aria-label="Cikis yap"
        >
          <LogOut className="size-4" />
        </Button>
      </div>
    </header>
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
      <div className="flex h-screen overflow-hidden">
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            {children}
          </main>
        </div>
        <TourProvider />
      </div>
    </QueryProvider>
  );
}
