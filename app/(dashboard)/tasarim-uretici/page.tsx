"use client";

import { useState, useEffect, useRef } from "react";
import {
  Wand2,
  Loader2,
  Trash2,
  Copy,
  Check,
  ImageIcon,
  Send,
  Eye,
  EyeOff,
  Download,
  Sparkles,
  ImagePlus,
  X,
  ArrowLeft,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { aiApi, customDesignsApi, type CustomDesign } from "@/lib/api";
import { downloadImage } from "@/lib/download";

type View = "list" | "chat";

export default function TasarimUreticiPage() {
  const [view, setView] = useState<View>("list");
  const [activeDesign, setActiveDesign] = useState<CustomDesign | null>(null);

  // Generation
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [referencePreview, setReferencePreview] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // List
  const [designs, setDesigns] = useState<CustomDesign[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Revision in chat
  const [revisionLoading, setRevisionLoading] = useState(false);

  async function fetchDesigns() {
    setLoading(true);
    try {
      const data = await customDesignsApi.getAll(1, 50);
      setDesigns(data.designs);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDesigns();
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 120) + "px";
    }
  }, [prompt]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (view === "chat") {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeDesign?.imageUrl, view]);

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

  function openDesign(design: CustomDesign) {
    setActiveDesign(design);
    setView("chat");
    setPrompt("");
    setError(null);
  }

  function goBack() {
    setView("list");
    setActiveDesign(null);
    setPrompt("");
    setError(null);
    clearRefFile();
  }

  async function handleGenerate() {
    if (!prompt.trim()) return;
    setGenerating(true);
    setError(null);

    try {
      const fileName = `design-${Date.now()}.webp`;
      const result = await aiApi.generateDesign(prompt.trim(), fileName, undefined, referenceFile || undefined);
      setPrompt("");
      clearRefFile();
      await fetchDesigns();

      // Open the newly created design in chat view
      const data = await customDesignsApi.getAll(1, 1);
      if (data.designs.length > 0) {
        openDesign(data.designs[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata olustu");
      setGenerating(false);
    } finally {
      setGenerating(false);
    }
  }

  async function handleRevise() {
    if (!prompt.trim() || !activeDesign?.imageUrl) return;
    setRevisionLoading(true);
    setError(null);

    try {
      const data = await aiApi.editImage(activeDesign.imageUrl, prompt.trim(), "tasarim");
      await customDesignsApi.update(activeDesign.id, { imageUrl: data.url });
      setPrompt("");
      clearRefFile();
      await fetchDesigns();

      // Update active design
      setActiveDesign((prev) => prev ? { ...prev, imageUrl: data.url } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Revizyon yapilamadi");
    } finally {
      setRevisionLoading(false);
    }
  }

  async function handleSend() {
    if (view === "chat" && activeDesign) {
      handleRevise();
    } else {
      handleGenerate();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu tasarimi silmek istediginize emin misiniz?")) return;
    try {
      await customDesignsApi.delete(id);
      if (activeDesign?.id === id) goBack();
      await fetchDesigns();
    } catch {
      // ignore
    }
  }

  async function handleToggleActive(design: CustomDesign) {
    try {
      await customDesignsApi.update(design.id, { isActive: !design.isActive });
      await fetchDesigns();
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

  // Full-screen loading overlay
  if (generating || revisionLoading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="size-20 rounded-full border-4 border-primary/20" />
            <Loader2 className="absolute inset-0 m-auto size-20 animate-spin text-primary" />
            <Wand2 className="absolute inset-0 m-auto size-7 text-primary" />
          </div>
          <div className="text-center px-6">
            <h2 className="text-xl font-bold">
              {revisionLoading ? "Revizyon Yapiliyor" : "Tasarim Olusturuluyor"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {revisionLoading
                ? "AI gorselinizi revize ediyor..."
                : "AI gorselinizi olusturuyor..."}
            </p>
            <p className="mt-1 text-xs text-muted-foreground/60">30-60 saniye</p>
          </div>
          <div className="mt-2 h-1.5 w-48 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ animation: "loading-bar 2s ease-in-out infinite" }} />
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

  // ─── CHAT VIEW ───
  if (view === "chat" && activeDesign) {
    return (
      <div className="-m-4 lg:-m-6 flex flex-col h-[calc(100dvh-3.5rem-4rem)] lg:h-[calc(100dvh-3.5rem)]">
        {/* Chat header */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <button onClick={goBack} className="rounded-xl p-1.5 hover:bg-muted">
            <ArrowLeft className="size-5" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-semibold">{activeDesign.prompt}</p>
            <p className="text-[10px] text-muted-foreground">
              {new Date(activeDesign.createdAt).toLocaleDateString("tr-TR", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => handleToggleActive(activeDesign)}
              className="rounded-xl p-2 text-muted-foreground hover:bg-muted"
            >
              {activeDesign.isActive ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
            </button>
            {activeDesign.imageUrl && (
              <button
                onClick={() => handleDownload(activeDesign.imageUrl!, activeDesign.title)}
                className="rounded-xl p-2 text-muted-foreground hover:bg-muted"
              >
                <Download className="size-4" />
              </button>
            )}
            <button
              onClick={() => handleDelete(activeDesign.id)}
              className="rounded-xl p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        </div>

        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* User prompt message */}
          <div className="flex justify-end">
            <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">
              {activeDesign.prompt}
            </div>
          </div>

          {/* AI response */}
          {activeDesign.imageUrl ? (
            <div className="flex justify-start">
              <div className="max-w-[85%] space-y-2">
                <div className="overflow-hidden rounded-2xl rounded-tl-sm border border-border shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activeDesign.imageUrl}
                    alt={activeDesign.title}
                    className="w-full object-contain"
                  />
                </div>
                <div className="flex gap-1.5 px-1">
                  <button
                    onClick={() => handleDownload(activeDesign.imageUrl!, activeDesign.title)}
                    className="flex items-center gap-1 rounded-lg bg-muted/60 px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:bg-muted"
                  >
                    <Download className="size-3" /> Indir
                  </button>
                  <button
                    onClick={() => handleCopyUrl(activeDesign.id, activeDesign.imageUrl!)}
                    className="flex items-center gap-1 rounded-lg bg-muted/60 px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:bg-muted"
                  >
                    {copiedId === activeDesign.id ? (
                      <><Check className="size-3 text-green-500" /> Kopyalandi</>
                    ) : (
                      <><Copy className="size-3" /> URL</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
                <ImageIcon className="size-4" /> Gorsel uretilemedi
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-center text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
              {error}
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Chat input — fixed at bottom */}
        <div className="border-t border-border bg-card/80 backdrop-blur-md p-3">
          {referencePreview && (
            <div className="mb-2 flex items-center gap-2 px-1">
              <div className="relative size-10 shrink-0 overflow-hidden rounded-lg border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={referencePreview} alt="Ref" className="h-full w-full object-cover" />
                <button onClick={clearRefFile} className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100">
                  <X className="size-3 text-white" />
                </button>
              </div>
              <span className="text-[11px] text-muted-foreground">Referans eklendi</span>
            </div>
          )}
          <div className="flex items-end gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mb-0.5 flex shrink-0 items-center justify-center rounded-xl p-2.5 text-muted-foreground hover:bg-muted/50"
            >
              <ImagePlus className="size-[18px]" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleRefFileSelect} className="hidden" />
            <div className="relative flex-1">
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && prompt.trim()) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Revizyon talimatinizi yazin..."
                rows={1}
                className="w-full !rounded-xl !border-border !bg-muted/30 !py-2.5 !px-4 text-sm !shadow-none placeholder:text-muted-foreground/50 focus:!ring-1 focus:!ring-primary/30"
                style={{ resize: "none", minHeight: 42 }}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!prompt.trim()}
              className={cn(
                "mb-0.5 flex shrink-0 items-center justify-center rounded-xl p-2.5 transition-all",
                "disabled:opacity-30",
                prompt.trim()
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <Send className="size-[18px]" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── LIST VIEW ───
  return (
    <div className="space-y-4">
      {/* Header + New button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold">
            <Wand2 className="size-5 text-primary" />
            Tasarimlar
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Tikla ve revize et, yeni olustur
          </p>
        </div>
      </div>

      {/* New design input */}
      <div className="glass-card rounded-2xl p-3">
        {referencePreview && (
          <div className="mb-2 flex items-center gap-2 px-1">
            <div className="relative size-10 shrink-0 overflow-hidden rounded-lg border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={referencePreview} alt="Ref" className="h-full w-full object-cover" />
              <button onClick={clearRefFile} className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100">
                <X className="size-3 text-white" />
              </button>
            </div>
            <span className="text-[11px] text-muted-foreground">Referans eklendi</span>
          </div>
        )}
        <div className="flex items-end gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mb-0.5 flex shrink-0 items-center justify-center rounded-xl p-2.5 text-muted-foreground hover:bg-muted/50"
          >
            <ImagePlus className="size-[18px]" />
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleRefFileSelect} className="hidden" />
          <div className="relative flex-1">
            <Sparkles className="absolute left-3 top-2.5 size-4 text-primary/40" />
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
              placeholder="Nasil bir tasarim istiyorsun?"
              rows={1}
              className="w-full !rounded-xl !border-0 !bg-transparent !py-2.5 !pl-9 !pr-3 text-sm !shadow-none !ring-0 placeholder:text-muted-foreground/50 focus:!ring-0"
              style={{ resize: "none", minHeight: 42 }}
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim()}
            className={cn(
              "mb-0.5 flex shrink-0 items-center justify-center rounded-xl p-2.5 transition-all",
              "disabled:opacity-30",
              prompt.trim()
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-muted text-muted-foreground"
            )}
          >
            <Send className="size-[18px]" />
          </button>
        </div>

        {error && (
          <div className="mx-1 mt-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
            {error}
          </div>
        )}
      </div>

      {/* Designs grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : designs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <ImageIcon className="mb-3 size-12 text-muted-foreground/30" />
          <p className="text-sm font-medium text-muted-foreground">Henuz tasarim yok</p>
          <p className="mt-1 text-xs text-muted-foreground/60">Yukariya yaz, hemen ureteyim</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          {designs.map((d) => (
            <button
              key={d.id}
              onClick={() => openDesign(d)}
              className={cn(
                "group overflow-hidden rounded-2xl border text-start transition-all active:scale-[0.98]",
                d.isActive
                  ? "border-border/50 bg-card"
                  : "border-border/30 bg-muted/30 opacity-60"
              )}
            >
              <div className="relative aspect-square overflow-hidden bg-muted">
                {d.imageUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={d.imageUrl}
                    alt={d.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ImageIcon className="size-8 text-muted-foreground/20" />
                  </div>
                )}
                {!d.isActive && (
                  <span className="absolute end-1.5 top-1.5 rounded-md bg-black/60 px-1.5 py-0.5 text-[9px] font-medium text-white">
                    Gizli
                  </span>
                )}
              </div>
              <div className="p-2">
                <p className="line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                  {d.prompt}
                </p>
                <p className="mt-1 text-[9px] text-muted-foreground/50">
                  {new Date(d.createdAt).toLocaleDateString("tr-TR", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
