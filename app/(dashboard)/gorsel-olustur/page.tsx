"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  Sparkles,
  Download,
  Copy,
  Check,
  Loader2,
  Upload,
  ImagePlus,
  X,
  Square,
  RectangleVertical,
  RectangleHorizontal,
  Monitor,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  Wand2,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { aiApi, generatedImagesApi, type GeneratedImage } from "@/lib/api";
import { downloadImage } from "@/lib/download";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

const PRODUCT_TYPES = [
  { key: "havlu", label: "Havlu", emoji: "🧣" },
  { key: "masa-ortusu", label: "Masa Örtüsü", emoji: "🍽️" },
  { key: "yastik", label: "Yastık Kılıfı", emoji: "🛋️" },
  { key: "perde", label: "Perde", emoji: "🪟" },
  { key: "bohca", label: "Bohça", emoji: "🎁" },
  { key: "sehpa-ortusu", label: "Sehpa Örtüsü", emoji: "☕" },
  { key: "ceyiz", label: "Çeyiz", emoji: "💍" },
  { key: "kiyafet", label: "Kıyafet", emoji: "👗" },
  { key: "custom", label: "Kendim Yazayım", emoji: "✏️" },
];

const ASPECT_RATIOS = [
  { key: "post", label: "Post (1:1)", icon: Square },
  { key: "story", label: "Story (9:16)", icon: RectangleVertical },
  { key: "product", label: "Ürün (4:3)", icon: RectangleHorizontal },
  { key: "wide", label: "Banner (16:9)", icon: Monitor },
];

export default function GorselOlusturPage() {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [customProduct, setCustomProduct] = useState("");
  const [selectedRatio, setSelectedRatio] = useState("post");
  const [detail, setDetail] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<{
    url: string;
    patternDescription: string;
    productType: string;
    aspectRatio: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Revision
  const [revisionInstructions, setRevisionInstructions] = useState("");
  const [revising, setRevising] = useState(false);

  // History
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyLoading, setHistoryLoading] = useState(true);

  async function fetchHistory(p = historyPage) {
    setHistoryLoading(true);
    try {
      const data = await generatedImagesApi.getAll(p, 8);
      setHistory(data.images);
      setHistoryTotalPages(data.pagination.totalPages);
      setHistoryTotal(data.pagination.total);
      setHistoryPage(data.pagination.page);
    } catch {
      // ignore
    } finally {
      setHistoryLoading(false);
    }
  }

  useEffect(() => {
    fetchHistory(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setResult(null);
    setError(null);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  function clearImage() {
    setImageFile(null);
    setImagePreview(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleGenerate() {
    if (!imageFile || (!selectedProduct && !customProduct)) return;
    setGenerating(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append(
        "productType",
        selectedProduct === "custom" ? "custom" : selectedProduct || "havlu"
      );
      formData.append("aspectRatio", selectedRatio);
      formData.append("detail", detail);
      if (selectedProduct === "custom" && customProduct.trim()) {
        formData.append("customProductPrompt", customProduct.trim());
      }

      const res = await fetch(`${API_URL}/api/ai/generate-image`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Görsel oluşturulamadı");
      }

      setResult(await res.json());
      fetchHistory(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setGenerating(false);
    }
  }

  async function handleCopyUrl() {
    if (!result?.url) return;
    await navigator.clipboard.writeText(result.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDownloadImage(url: string) {
    await downloadImage(url, `elizim-ai-${Date.now()}.jpg`);
  }

  async function handleRevise(imageUrl: string) {
    if (!revisionInstructions.trim()) return;
    setRevising(true);
    setError(null);

    try {
      const data = await aiApi.editImage(imageUrl, revisionInstructions.trim(), "gorsel");
      setResult({
        url: data.url,
        patternDescription: data.description,
        productType: result?.productType || "",
        aspectRatio: result?.aspectRatio || "",
      });
      setRevisionInstructions("");
      fetchHistory(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Revizyon yapilamadi");
    } finally {
      setRevising(false);
    }
  }

  async function handleDeleteHistory(id: string) {
    if (!confirm("Bu görseli silmek istediğinize emin misiniz?")) return;
    try {
      await generatedImagesApi.delete(id);
      await fetchHistory(historyPage);
    } catch {
      // ignore
    }
  }

  const isProductSelected =
    selectedProduct && (selectedProduct !== "custom" || customProduct.trim());
  const canGenerate = imageFile && isProductSelected && !generating;

  // Full-screen loading overlay
  if (generating || revising) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="size-24 rounded-full border-4 border-primary/20" />
            <Loader2 className="absolute inset-0 m-auto size-24 animate-spin text-primary" />
            {revising ? (
              <Wand2 className="absolute inset-0 m-auto size-8 text-primary" />
            ) : (
              <Sparkles className="absolute inset-0 m-auto size-8 text-primary" />
            )}
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold">
              {revising ? "Revizyon Yapiliyor" : "Görsel Oluşturuluyor"}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {revising
                ? "AI gorselinizi revize ediyor..."
                : "AI desenini analiz edip ürüne uyguluyor..."}
            </p>
            <p className="mt-1 text-sm text-muted-foreground/60">
              Bu işlem 30-60 saniye sürebilir
            </p>
          </div>
          <div className="mt-4 h-1.5 w-64 overflow-hidden rounded-full bg-muted">
            <div className="h-full animate-pulse rounded-full bg-primary" style={{ width: "60%", animation: "loading 2s ease-in-out infinite" }} />
          </div>
        </div>
        <style>{`
          @keyframes loading {
            0% { width: 10%; margin-left: 0; }
            50% { width: 60%; margin-left: 20%; }
            100% { width: 10%; margin-left: 90%; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="-m-4 lg:-m-6">
      {/* Top: Generation form + Preview */}
      <div className="flex min-h-[calc(100dvh-4rem)] flex-col lg:flex-row">
        {/* Sol: Ayarlar */}
        <div className="flex-1 space-y-5 overflow-y-auto border-e border-border bg-card/50 p-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-2xl bg-primary/10">
              <Sparkles className="size-4 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">AI Görsel Oluştur</h1>
              <p className="text-xs text-muted-foreground">Desenini yükle, ürüne uygula</p>
            </div>
          </div>

          {/* 1. Desen Yükle */}
          <div data-tour="gorsel-upload">
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">1</span>
              Desenini Yükle
            </label>
            {!imagePreview ? (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full items-center gap-3 rounded-3xl border-2 border-dashed border-border/50 p-4 transition-colors hover:border-primary hover:bg-primary/5"
              >
                <Upload className="size-6 text-muted-foreground" />
                <div className="text-start">
                  <span className="text-sm font-medium">Fotoğraf Seç</span>
                  <p className="text-xs text-muted-foreground">Nakış, dantel veya desen fotoğrafı</p>
                </div>
              </button>
            ) : (
              <div className="relative overflow-hidden rounded-2xl border border-border">
                <Image src={imagePreview} alt="Desen" width={400} height={200} className="h-32 w-full object-cover" />
                <button onClick={clearImage} className="absolute end-2 top-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80">
                  <X className="size-3" />
                </button>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
          </div>

          {/* 2. Ürün Tipi */}
          <div data-tour="gorsel-product-type">
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">2</span>
              Nereye Uygulansın?
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {PRODUCT_TYPES.map((type) => (
                <button
                  key={type.key}
                  onClick={() => { setSelectedProduct(type.key); setResult(null); setError(null); }}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2.5 text-start transition-all",
                    selectedProduct === type.key
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/50 hover:bg-muted"
                  )}
                >
                  <span className="text-base">{type.emoji}</span>
                  <span className="text-xs font-medium">{type.label}</span>
                </button>
              ))}
            </div>
            {selectedProduct === "custom" && (
              <textarea
                value={customProduct}
                onChange={(e) => setCustomProduct(e.target.value)}
                placeholder="Örn: Kırmızı kadife bir elbise, beyaz ipek mendil, ahşap tepsi..."
                rows={2}
                className="mt-2 w-full px-3 py-2 text-sm"
                autoFocus
              />
            )}
          </div>

          {/* 3. Boyut */}
          <div data-tour="gorsel-aspect">
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">3</span>
              Boyut
            </label>
            <div className="flex gap-1.5">
              {ASPECT_RATIOS.map((ratio) => {
                const Icon = ratio.icon;
                return (
                  <button
                    key={ratio.key}
                    onClick={() => { setSelectedRatio(ratio.key); setResult(null); }}
                    className={cn(
                      "flex flex-1 flex-col items-center gap-1 rounded-lg py-2.5 transition-all",
                      selectedRatio === ratio.key
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 hover:bg-muted"
                    )}
                  >
                    <Icon className="size-4" />
                    <span className="text-[10px] font-medium">{ratio.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Detay */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <Pencil className="size-3.5 text-muted-foreground" />
              Ekstra Detay <span className="font-normal text-muted-foreground">(opsiyonel)</span>
            </label>
            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="Örn: Arka plan sade olsun, çiçek motifleri büyük görünsün..."
              rows={2}
              className="w-full px-3 py-2 text-sm"
            />
          </div>

          {/* Oluştur */}
          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            data-tour="gorsel-generate"
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition-all",
              "disabled:cursor-not-allowed disabled:opacity-40",
              canGenerate
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl active:scale-[0.98]"
                : "bg-muted text-muted-foreground"
            )}
          >
            <Sparkles className="size-4" />
            Görsel Oluştur
          </button>
        </div>

        {/* Sağ: Sonuç */}
        <div className="flex flex-1 flex-col bg-muted/20 p-6" data-tour="gorsel-preview">
          {error && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-center dark:border-red-800 dark:bg-red-950">
              <p className="text-sm font-medium text-red-700 dark:text-red-300">{error}</p>
              <button onClick={handleGenerate} disabled={!canGenerate} className="mt-1 text-xs text-red-500 underline hover:no-underline">Tekrar dene</button>
            </div>
          )}

          {result ? (
            <div className="flex flex-1 flex-col">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold text-green-600 dark:text-green-400">
                  {result.productType}
                </h3>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {result.aspectRatio}
                </span>
              </div>

              <div className="flex flex-1 items-center justify-center overflow-hidden rounded-2xl border border-border bg-white shadow-lg dark:bg-black/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={result.url}
                  alt="AI ürün görseli"
                  className="max-h-[60vh] w-full object-contain"
                />
              </div>

              {result.patternDescription && (
                <details className="mt-3 rounded-2xl border border-border bg-background p-2.5">
                  <summary className="cursor-pointer text-xs font-medium text-muted-foreground">AI açıklaması</summary>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{result.patternDescription}</p>
                </details>
              )}

              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => handleDownloadImage(result.url)}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border py-2 text-xs font-medium hover:bg-muted"
                >
                  <Download className="size-3.5" />
                  İndir
                </button>
                <button
                  onClick={handleCopyUrl}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border py-2 text-xs font-medium hover:bg-muted"
                >
                  {copied ? <Check className="size-3.5 text-green-500" /> : <Copy className="size-3.5" />}
                  {copied ? "Kopyalandı!" : "URL Kopyala"}
                </button>
                <button
                  onClick={handleGenerate}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                >
                  <ImagePlus className="size-3.5" />
                  Yeniden
                </button>
              </div>

              {/* Revision section */}
              <div className="mt-4 rounded-2xl border border-border bg-background p-3">
                <label className="mb-2 flex items-center gap-2 text-xs font-semibold">
                  <Wand2 className="size-3.5 text-primary" />
                  Revize Et
                </label>
                <div className="flex gap-2">
                  <textarea
                    value={revisionInstructions}
                    onChange={(e) => setRevisionInstructions(e.target.value)}
                    placeholder="Orn: Arka plani beyaz yap, cicekleri buyut..."
                    rows={2}
                    className="flex-1 px-3 py-2 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey && revisionInstructions.trim()) {
                        e.preventDefault();
                        handleRevise(result.url);
                      }
                    }}
                  />
                  <button
                    onClick={() => handleRevise(result.url)}
                    disabled={!revisionInstructions.trim()}
                    className={cn(
                      "flex shrink-0 items-center justify-center rounded-xl px-4 text-xs font-medium transition-all",
                      "disabled:cursor-not-allowed disabled:opacity-30",
                      revisionInstructions.trim()
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <Send className="size-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <div className="mb-3 flex size-16 items-center justify-center rounded-2xl bg-muted">
                <Sparkles className="size-7 text-muted-foreground/40" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Önizleme</p>
              <p className="mt-1 text-xs text-muted-foreground/60">
                Desen yükle ve ürün seç, AI görseli burada görünecek
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom: History Gallery */}
      <div className="border-t border-border p-4 lg:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">
            Gecmis Gorseller
            {historyTotal > 0 && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({historyTotal})
              </span>
            )}
          </h2>
        </div>

        {historyLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border/50 py-16">
            <ImageIcon className="mb-3 size-12 text-muted-foreground/30" />
            <p className="text-sm font-medium text-muted-foreground">
              Henuz gorsel yok
            </p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              Yukaridan gorsel olustur, burada listelensin
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {history.map((img) => (
                <div
                  key={img.id}
                  className="group overflow-hidden rounded-3xl border border-border/50 bg-card transition-all"
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    {img.resultImageUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={img.resultImageUrl}
                        alt={img.productType}
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
                          onClick={() => {
                            setResult({
                              url: img.resultImageUrl,
                              patternDescription: img.patternDescription || "",
                              productType: img.productType,
                              aspectRatio: img.aspectRatio,
                            });
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-white/90 py-1.5 text-[11px] font-medium text-black backdrop-blur-sm hover:bg-white"
                        >
                          <Wand2 className="size-3" /> Revize Et
                        </button>
                        <button
                          onClick={() => handleDownloadImage(img.resultImageUrl)}
                          className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-white/90 py-1.5 text-[11px] font-medium text-black backdrop-blur-sm hover:bg-white"
                        >
                          <Download className="size-3" /> Indir
                        </button>
                        <button
                          onClick={() => handleDeleteHistory(img.id)}
                          className="flex items-center justify-center rounded-xl bg-red-500/90 px-2.5 py-1.5 text-white backdrop-blur-sm hover:bg-red-600"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <div className="flex items-center gap-1.5">
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                        {img.productType}
                      </span>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                        {img.aspectRatio}
                      </span>
                    </div>
                    {img.detail && (
                      <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                        {img.detail}
                      </p>
                    )}
                    <p className="mt-1.5 text-[10px] text-muted-foreground/50">
                      {new Date(img.createdAt).toLocaleDateString("tr-TR", {
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
            {historyTotalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <button
                  onClick={() => fetchHistory(historyPage - 1)}
                  disabled={historyPage <= 1}
                  className="inline-flex items-center gap-1 rounded-2xl border border-border/50 px-3 py-1.5 text-sm font-medium transition-all hover:bg-muted/50 disabled:opacity-40"
                >
                  <ChevronLeft className="size-4" />
                  Onceki
                </button>
                <span className="px-3 text-sm text-muted-foreground">
                  {historyPage} / {historyTotalPages}
                </span>
                <button
                  onClick={() => fetchHistory(historyPage + 1)}
                  disabled={historyPage >= historyTotalPages}
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
