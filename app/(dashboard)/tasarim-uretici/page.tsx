"use client";

import { useState, useEffect } from "react";
import {
  Wand2,
  Loader2,
  Sparkles,
  Trash2,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  Send,
  Eye,
  EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { aiApi, customDesignsApi, type CustomDesign } from "@/lib/api";

export default function TasarimUreticiPage() {
  // Create form
  const [prompt, setPrompt] = useState("");
  const [title, setTitle] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // List
  const [designs, setDesigns] = useState<CustomDesign[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function fetchDesigns(p = page) {
    setLoading(true);
    try {
      const data = await customDesignsApi.getAll(p, 12);
      setDesigns(data.designs);
      setTotalPages(data.pagination.totalPages);
      setTotal(data.pagination.total);
      setPage(data.pagination.page);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDesigns(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleGenerate() {
    if (!prompt.trim()) return;
    setGenerating(true);
    setError(null);

    try {
      const fileName = `design-${Date.now()}.webp`;
      await aiApi.generateDesign(prompt.trim(), fileName, title.trim() || undefined);
      setPrompt("");
      setTitle("");
      // Refresh list, go to page 1
      await fetchDesigns(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata olustu");
    } finally {
      setGenerating(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu tasarimi silmek istediginize emin misiniz?")) return;
    try {
      await customDesignsApi.delete(id);
      await fetchDesigns(page);
    } catch {
      // ignore
    }
  }

  async function handleToggleActive(design: CustomDesign) {
    try {
      await customDesignsApi.update(design.id, { isActive: !design.isActive });
      await fetchDesigns(page);
    } catch {
      // ignore
    }
  }

  async function handleCopyUrl(id: string, url: string) {
    await navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  // Fullscreen loading overlay
  if (generating) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="size-24 rounded-full border-4 border-primary/20" />
            <Loader2 className="absolute inset-0 m-auto size-24 animate-spin text-primary" />
            <Wand2 className="absolute inset-0 m-auto size-8 text-primary" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold">Tasarim Olusturuluyor</h2>
            <p className="mt-2 text-muted-foreground">
              AI gorselinizi olusturuyor ve kaydediyor...
            </p>
            <p className="mt-1 text-sm text-muted-foreground/60">
              Bu islem 30-60 saniye surebilir
            </p>
          </div>
          <div className="mt-4 h-1.5 w-64 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{
                animation: "loading-bar 2s ease-in-out infinite",
              }}
            />
          </div>
        </div>
        <style>{`
          @keyframes loading-bar {
            0% { width: 10%; margin-left: 0; }
            50% { width: 60%; margin-left: 20%; }
            100% { width: 10%; margin-left: 90%; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="flex items-center gap-3 text-2xl font-bold">
          <Wand2 className="size-7 text-primary" />
          Tasarim Uretici
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Prompt yaz, gorsel olustur. Olusturulan gorseller otomatik kaydedilir.
        </p>
      </div>

      {/* Create form */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="space-y-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Baslik (opsiyonel) — ornegin: Sevgililer Gunu Tisort"
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium outline-none placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <div className="flex gap-2">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && prompt.trim()) {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
              placeholder="Gorsel icin prompt yazin... (Enter ile gonder)"
              rows={3}
              className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm leading-relaxed outline-none placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim()}
              className={cn(
                "flex shrink-0 items-center justify-center self-end rounded-xl px-5 py-2.5 transition-all",
                "disabled:cursor-not-allowed disabled:opacity-40",
                prompt.trim()
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl active:scale-[0.97]"
                  : "bg-muted text-muted-foreground",
              )}
            >
              <Send className="size-5" />
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
            {error}
          </div>
        )}
      </div>

      {/* Designs list */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">
            Kayitli Tasarimlar
            {total > 0 && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({total})
              </span>
            )}
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        ) : designs.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-16">
            <ImageIcon className="mb-3 size-12 text-muted-foreground/30" />
            <p className="text-sm font-medium text-muted-foreground">
              Henuz tasarim yok
            </p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              Yukaridaki alandan ilk tasariminizi olusturun
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {designs.map((d) => (
                <div
                  key={d.id}
                  className={cn(
                    "group overflow-hidden rounded-2xl border transition-all",
                    d.isActive
                      ? "border-border bg-card"
                      : "border-border/50 bg-muted/30 opacity-60",
                  )}
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    {d.imageUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={d.imageUrl}
                        alt={d.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <ImageIcon className="size-10 text-muted-foreground/20" />
                      </div>
                    )}

                    {/* Overlay actions */}
                    <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                      <div className="flex w-full gap-1.5 p-3">
                        <button
                          onClick={() => handleToggleActive(d)}
                          className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-white/90 py-1.5 text-[11px] font-medium text-black hover:bg-white"
                        >
                          {d.isActive ? (
                            <><EyeOff className="size-3" /> Gizle</>
                          ) : (
                            <><Eye className="size-3" /> Goster</>
                          )}
                        </button>
                        {d.imageUrl && (
                          <button
                            onClick={() => handleCopyUrl(d.id, d.imageUrl!)}
                            className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-white/90 py-1.5 text-[11px] font-medium text-black hover:bg-white"
                          >
                            {copiedId === d.id ? (
                              <><Check className="size-3 text-green-600" /> Kopyalandi</>
                            ) : (
                              <><Copy className="size-3" /> URL</>
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(d.id)}
                          className="flex items-center justify-center rounded-lg bg-red-500/90 px-3 py-1.5 text-white hover:bg-red-600"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      </div>
                    </div>

                    {!d.isActive && (
                      <span className="absolute end-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white">
                        Gizli
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <h3 className="truncate text-sm font-bold">{d.title}</h3>
                    <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                      {d.prompt}
                    </p>
                    <p className="mt-1.5 text-[10px] text-muted-foreground/50">
                      {new Date(d.createdAt).toLocaleDateString("tr-TR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <button
                  onClick={() => fetchDesigns(page - 1)}
                  disabled={page <= 1}
                  className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm font-medium disabled:opacity-40"
                >
                  <ChevronLeft className="size-4" />
                  Onceki
                </button>
                <span className="px-3 text-sm text-muted-foreground">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => fetchDesigns(page + 1)}
                  disabled={page >= totalPages}
                  className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm font-medium disabled:opacity-40"
                >
                  Sonraki
                  <ChevronRight className="size-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
