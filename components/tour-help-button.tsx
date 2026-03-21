"use client";

import { useEffect, useState, useRef } from "react";
import {
  RotateCcw,
  CheckCircle2,
  Circle,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTourStore, type TourId } from "@/lib/tour-store";
import { useRouter, usePathname } from "next/navigation";

const tourOptions: {
  id: TourId;
  label: string;
  description: string;
  path: string;
}[] = [
  {
    id: "admin",
    label: "Genel Tanitim",
    description: "Panelin temel ozelliklerini kesfet",
    path: "/",
  },
  {
    id: "urunler",
    label: "Urun Yonetimi",
    description: "Urun ekleme, duzenleme ve silme",
    path: "/urunler",
  },
  {
    id: "desenler",
    label: "Desen Yonetimi",
    description: "Nakis deseni ekleme ve duzenleme",
    path: "/desenler",
  },
  {
    id: "kategoriler",
    label: "Kategori Yonetimi",
    description: "Kategori ekleme ve duzenleme",
    path: "/kategoriler",
  },
  {
    id: "gorsel",
    label: "AI Gorsel Olusturma",
    description: "Yapay zeka ile urun gorseli olustur",
    path: "/gorsel-olustur",
  },
];

export function TourHelpButton() {
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const {
    startTour,
    resetTour,
    resetAllTours,
    completedTours,
    welcomeSeen,
    markWelcomeSeen,
    startFullOnboarding,
    _hasHydrated,
  } = useTourStore();

  // Auto-open for first visit
  useEffect(() => {
    if (_hasHydrated && !welcomeSeen) {
      setOpen(true);
    }
  }, [_hasHydrated, welcomeSeen]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        if (!welcomeSeen) markWelcomeSeen();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, welcomeSeen, markWelcomeSeen]);

  const handleStartTour = (tourId: TourId, path: string) => {
    setOpen(false);
    if (!welcomeSeen) markWelcomeSeen();
    resetTour(tourId);

    if (pathname === path) {
      setTimeout(() => startTour(tourId), 300);
    } else {
      router.push(path);
      setTimeout(() => startTour(tourId), 800);
    }
  };

  const handleResetAll = () => {
    setOpen(false);
    resetAllTours();
  };

  const handleDismissWelcome = () => {
    markWelcomeSeen();
    setOpen(false);
  };

  const completedCount = completedTours.length;
  const totalCount = tourOptions.length;
  const showWelcome = !welcomeSeen;

  return (
    <div className="relative" ref={popoverRef} data-tour="tour-help-btn">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
          "text-sidebar-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
        )}
      >
        <Sparkles className="size-5 shrink-0" />
        <span>Oglum yardim et</span>
        {completedCount < totalCount && (
          <span className="ml-auto size-2 rounded-full bg-primary animate-pulse" />
        )}
      </button>

      {open && (
        <div
          className="absolute bottom-full left-0 mb-2 w-72 overflow-hidden rounded-2xl border border-border shadow-2xl"
          style={{
            background: "var(--glass-bg-thick)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            boxShadow:
              "0 8px 40px oklch(0 0 0 / 18%), inset 0 1px 0 oklch(1 0 0 / 8%)",
            zIndex: 50,
          }}
        >
          {showWelcome ? (
            <div className="p-5">
              <div className="mb-4 flex justify-center">
                <div className="flex size-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
                  <Sparkles className="size-7 text-primary" />
                </div>
              </div>

              <h3 className="text-center text-base font-semibold tracking-tight text-foreground">
                Hosgeldin anne!
              </h3>
              <p className="mt-2 text-center text-sm leading-relaxed text-muted-foreground">
                Oglun her seyi ayarladi, merak etme. Adim adim gostereyim!
              </p>

              <button
                onClick={() => {
                  setOpen(false);
                  startFullOnboarding();
                }}
                className={cn(
                  "mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-2.5",
                  "bg-primary text-sm font-medium text-primary-foreground",
                  "transition-all hover:bg-primary/90 active:scale-[0.98]"
                )}
              >
                Baslat oglum
                <ArrowRight className="size-4" />
              </button>

              <button
                onClick={handleDismissWelcome}
                className="mt-2 flex w-full items-center justify-center rounded-xl py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Sonra
              </button>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="px-4 pb-3 pt-4">
                <div className="mb-1 flex items-center gap-2.5">
                  <Sparkles className="size-4 shrink-0 text-primary" />
                  <h4 className="text-sm font-semibold tracking-tight text-foreground">
                    Yardim
                  </h4>
                </div>
                <p className="text-xs text-muted-foreground">
                  {completedCount === totalCount
                    ? "Aferin anne, hepsini ogrendin!"
                    : `${completedCount}/${totalCount} tur tamamlandi`}
                </p>
                <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{
                      width: `${(completedCount / totalCount) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Tour list */}
              <div className="max-h-64 overflow-y-auto px-2 pb-2">
                {tourOptions.map((tour) => {
                  const isCompleted = completedTours.includes(tour.id);
                  return (
                    <button
                      key={tour.id}
                      onClick={() => handleStartTour(tour.id, tour.path)}
                      className="group/item flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-all hover:bg-muted"
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                      ) : (
                        <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground/40 transition-colors group-hover/item:text-primary" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-medium leading-tight text-foreground">
                          {tour.label}
                        </p>
                        <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
                          {isCompleted ? "Tekrar baslat" : tour.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="border-t border-border/50 px-4 py-2.5">
                <button
                  onClick={handleResetAll}
                  disabled={completedCount === 0}
                  className="flex w-full items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <RotateCcw className="size-3" />
                  <span>Tumunu sifirla ve bastan basla</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
