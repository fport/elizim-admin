"use client";

import { useState, useEffect, useRef } from "react";
import {
  Wand2,
  Loader2,
  Trash2,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  Send,
  Eye,
  EyeOff,
  Download,
  Sparkles,
  ImagePlus,
  X,
  Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { aiApi, customDesignsApi, type CustomDesign } from "@/lib/api";
import { downloadImage } from "@/lib/download";

export default function TasarimUreticiPage() {
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [referencePreview, setReferencePreview] = useState<string | null>(null);

  // List
  const [designs, setDesigns] = useState<CustomDesign[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Revision
  const [revisingId, setRevisingId] = useState<string | null>(null);
  const [revisionText, setRevisionText] = useState("");
  const [revisionLoading, setRevisionLoading] = useState(false);

  async function handleReviseDesign(design: CustomDesign) {
    if (!revisionText.trim() || !design.imageUrl) return;
    setRevisionLoading(true);

    try {
      const data = await aiApi.editImage(design.imageUrl, revisionText.trim(), "tasarim");
      await customDesignsApi.update(design.id, { imageUrl: data.url });
      setRevisingId(null);
      setRevisionText("");
      await fetchDesigns(page);
    } catch {
      // ignore
    } finally {
      setRevisionLoading(false);
    }
  }

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

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 160) + "px";
    }
  }, [prompt]);

  function handleRefFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setReferenceFile(file);
    const reader = new FileReader();
    reader.onload = () => setReferencePreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  function clearRefFile() {
    setReferenceFile(null);
    setReferencePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleGenerate() {
    if (!prompt.trim()) return;
    setGenerating(true);
    setError(null);

    try {
      const fileName = `design-${Date.now()}.webp`;
      await aiApi.generateDesign(prompt.trim(), fileName, undefined, referenceFile || undefined);
      setPrompt("");
      clearRefFile();
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

  async function handleDownload(url: string, title: string) {
    await downloadImage(url, `${title.replace(/[^a-zA-Z0-9-_]/g, "_")}.webp`);
  }

  // Fullscreen loading overlay
  if (generating || revisionLoading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="size-24 rounded-full border-4 border-primary/20" />
            <Loader2 className="absolute inset-0 m-auto size-24 animate-spin text-primary" />
            <Wand2 className="absolute inset-0 m-auto size-8 text-primary" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold">
              {revisionLoading ? "Revizyon Yapiliyor" : "Tasarim Olusturuluyor"}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {revisionLoading
                ? "AI gorselinizi revize ediyor..."
                : "AI gorselinizi olusturuyor ve kaydediyor..."}
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
          Ne istedigini yaz, AI uretsin.
        </p>
      </div>

      {/* Chat-like input */}
      <div className="glass-card rounded-3xl p-3">
        {/* Reference image preview */}
        {referencePreview && (
          <div className="mx-1 mb-2 flex items-center gap-2">
            <div className="relative size-12 shrink-0 overflow-hidden rounded-xl border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={referencePreview} alt="Referans" className="h-full w-full object-cover" />
              <button
                onClick={clearRefFile}
                className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100"
              >
                <X className="size-3.5 text-white" />
              </button>
            </div>
            <span className="text-[11px] text-muted-foreground">Referans gorsel eklendi</span>
          </div>
        )}

        <div className="flex items-end gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mb-0.5 flex shrink-0 items-center justify-center rounded-2xl p-3 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
            title="Referans gorsel ekle"
          >
            <ImagePlus className="size-[18px]" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleRefFileSelect}
            className="hidden"
          />
          <div className="relative flex-1">
            <Sparkles className="absolute left-4 top-3 size-4 text-primary/40" />
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && prompt.trim()) {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
              placeholder="Nasil bir tasarim istiyorsun? Yaz, ben ureteyim..."
              rows={1}
              className="w-full !rounded-2xl !border-0 !bg-transparent !py-2.5 !pl-10 !pr-4 text-sm !shadow-none !ring-0 placeholder:text-muted-foreground/50 focus:!ring-0"
              style={{ resize: "none", minHeight: 44 }}
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim()}
            className={cn(
              "mb-0.5 flex shrink-0 items-center justify-center rounded-2xl p-3 transition-all duration-200",
              "disabled:cursor-not-allowed disabled:opacity-30",
              prompt.trim()
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:brightness-110 active:scale-[0.95]"
                : "bg-muted text-muted-foreground",
            )}
          >
            <Send className="size-[18px]" />
          </button>
        </div>

        {error && (
          <div className="mx-1 mt-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
            {error}
          </div>
        )}
      </div>

      {/* Designs list */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">
            Tasarimlar
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
          <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border/50 py-16">
            <ImageIcon className="mb-3 size-12 text-muted-foreground/30" />
            <p className="text-sm font-medium text-muted-foreground">
              Henuz tasarim yok
            </p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              Yukariya ne istedigini yaz, hemen ureteyim
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {designs.map((d) => (
                <div
                  key={d.id}
                  className={cn(
                    "group overflow-hidden rounded-3xl border transition-all",
                    d.isActive
                      ? "border-border/50 bg-card"
                      : "border-border/30 bg-muted/30 opacity-60",
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
                          className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-white/90 py-1.5 text-[11px] font-medium text-black backdrop-blur-sm hover:bg-white"
                        >
                          {d.isActive ? (
                            <><EyeOff className="size-3" /> Gizle</>
                          ) : (
                            <><Eye className="size-3" /> Goster</>
                          )}
                        </button>
                        {d.imageUrl && (
                          <>
                            <button
                              onClick={() => {
                                setRevisingId(revisingId === d.id ? null : d.id);
                                setRevisionText("");
                              }}
                              className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-white/90 py-1.5 text-[11px] font-medium text-black backdrop-blur-sm hover:bg-white"
                            >
                              <Pencil className="size-3" /> Revize
                            </button>
                            <button
                              onClick={() => handleDownload(d.imageUrl!, d.title)}
                              className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-white/90 py-1.5 text-[11px] font-medium text-black backdrop-blur-sm hover:bg-white"
                            >
                              <Download className="size-3" /> Indir
                            </button>
                            <button
                              onClick={() => handleCopyUrl(d.id, d.imageUrl!)}
                              className="flex items-center justify-center gap-1 rounded-xl bg-white/90 px-2.5 py-1.5 text-[11px] font-medium text-black backdrop-blur-sm hover:bg-white"
                            >
                              {copiedId === d.id ? (
                                <Check className="size-3 text-green-600" />
                              ) : (
                                <Copy className="size-3" />
                              )}
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(d.id)}
                          className="flex items-center justify-center rounded-xl bg-red-500/90 px-2.5 py-1.5 text-white backdrop-blur-sm hover:bg-red-600"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      </div>
                    </div>

                    {!d.isActive && (
                      <span className="absolute end-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                        Gizli
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <p className="line-clamp-2 text-[12px] leading-relaxed text-muted-foreground">
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

                    {/* Inline revision input */}
                    {revisingId === d.id && (
                      <div className="mt-2 flex gap-1.5">
                        <input
                          type="text"
                          value={revisionText}
                          onChange={(e) => setRevisionText(e.target.value)}
                          placeholder="Neyi degistirmek istiyorsun?"
                          className="!rounded-xl !px-2.5 !py-1.5 !text-[11px]"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && revisionText.trim()) {
                              handleReviseDesign(d);
                            }
                          }}
                        />
                        <button
                          onClick={() => handleReviseDesign(d)}
                          disabled={!revisionText.trim()}
                          className="shrink-0 rounded-xl bg-primary px-2.5 py-1.5 text-[11px] font-medium text-primary-foreground disabled:opacity-30"
                        >
                          <Wand2 className="size-3" />
                        </button>
                      </div>
                    )}
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
                  className="inline-flex items-center gap-1 rounded-2xl border border-border/50 px-3 py-1.5 text-sm font-medium transition-all hover:bg-muted/50 disabled:opacity-40"
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
                  className="inline-flex items-center gap-1 rounded-2xl border border-border/50 px-3 py-1.5 text-sm font-medium transition-all hover:bg-muted/50 disabled:opacity-40"
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
