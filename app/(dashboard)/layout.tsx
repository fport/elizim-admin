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
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-6" data-tour="sidebar-logo">
          <Link href="/" className="text-xl font-bold text-primary" onClick={onClose}>
            Elizim Admin
          </Link>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-sidebar-foreground hover:bg-sidebar-accent lg:hidden"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 p-4">
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
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="size-5 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="border-t border-sidebar-border p-4 space-y-2">
          <TourHelpButton />
          <p className="text-xs text-muted-foreground">
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
    <header className="flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-sm lg:px-6">
      {/* Left: hamburger */}
      <button
        onClick={onMenuClick}
        data-tour="mobile-menu"
        className="rounded-lg p-2 text-foreground hover:bg-muted lg:hidden"
      >
        <Menu className="size-5" />
      </button>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-2">
        {session?.user && (
          <span className="hidden text-sm text-muted-foreground sm:inline">
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
