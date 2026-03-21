"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Loader2,
  Sparkles,
  Save,
  Globe,
  FileText,
  Tag,
  ImagePlus,
} from "lucide-react";
import { blogApi, uploadApi } from "@/lib/api";
import type { BlogPost } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { TiptapEditor } from "@/components/blog/tiptap-editor";
import { cn } from "@/lib/utils";

const LOCALES = [
  { key: "tr", label: "Turkce", flag: "🇹🇷" },
  { key: "en", label: "English", flag: "🇬🇧" },
  { key: "ar", label: "العربية", flag: "🇸🇦" },
] as const;

type LocaleKey = "tr" | "en" | "ar";

interface LocaleData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  tags: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[çÇ]/g, "c")
    .replace(/[ğĞ]/g, "g")
    .replace(/[ıİ]/g, "i")
    .replace(/[öÖ]/g, "o")
    .replace(/[şŞ]/g, "s")
    .replace(/[üÜ]/g, "u")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export default function NewBlogPostPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [topic, setTopic] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [generated, setGenerated] = useState(false);
  const [activeTab, setActiveTab] = useState<LocaleKey>("tr");
  const [localeData, setLocaleData] = useState<Record<LocaleKey, LocaleData>>({
    tr: { title: "", slug: "", content: "", excerpt: "", tags: "" },
    en: { title: "", slug: "", content: "", excerpt: "", tags: "" },
    ar: { title: "", slug: "", content: "", excerpt: "", tags: "" },
  });
  const [isPublished, setIsPublished] = useState(false);
  const [error, setError] = useState("");

  const generateMutation = useMutation({
    mutationFn: (data: { topic: string; category?: string; imageUrl?: string }) =>
      blogApi.generate(data.topic, data.category, data.imageUrl),
    onSuccess: (posts: BlogPost[]) => {
      const newData = { ...localeData };
      for (const post of posts) {
        const locale = post.locale as LocaleKey;
        newData[locale] = {
          title: post.title,
          slug: post.slug,
          content: post.content || "",
          excerpt: post.excerpt || "",
          tags: post.tags || "",
        };
      }
      setLocaleData(newData);
      setGenerated(true);
      setError("");
    },
    onError: (err: Error) => setError(err.message),
  });

  const saveMutation = useMutation({
    mutationFn: async (posts: BlogPost[]) => {
      const updates = posts.map((post) => {
        const locale = post.locale as LocaleKey;
        const data = localeData[locale];
        return blogApi.update(post.id, {
          title: data.title,
          slug: data.slug,
          content: data.content,
          excerpt: data.excerpt || null,
          tags: data.tags || null,
          category: category || null,
          imageUrl: imageUrl || null,
          isPublished,
        });
      });
      return Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      router.push("/blog");
    },
    onError: (err: Error) => setError(err.message),
  });

  function handleGenerate() {
    setError("");
    if (!topic.trim()) {
      setError("Konu gerekli");
      return;
    }
    generateMutation.mutate({
      topic: topic.trim(),
      category: category.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
    });
  }

  function updateLocaleField(locale: LocaleKey, field: keyof LocaleData, value: string) {
    setLocaleData((prev) => ({
      ...prev,
      [locale]: { ...prev[locale], [field]: value },
    }));
  }

  function handleTitleChange(locale: LocaleKey, value: string) {
    updateLocaleField(locale, "title", value);
    const baseSlug = slugify(value);
    updateLocaleField(locale, "slug", locale === "tr" ? baseSlug : `${baseSlug}-${locale}`);
  }

  function handleSave() {
    setError("");
    const trData = localeData.tr;
    if (!trData.title.trim() || !trData.content.trim()) {
      setError("Turkce baslik ve icerik gerekli");
      return;
    }
    if (!generateMutation.data) {
      setError("Once AI ile blog olusturun");
      return;
    }
    saveMutation.mutate(generateMutation.data);
  }

  async function handleImageUpload() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const url = await uploadApi.uploadImage(file);
        setImageUrl(url);
      } catch {
        setError("Gorsel yuklenemedi");
      }
    };
    input.click();
  }

  const activeLocaleData = localeData[activeTab];
  const canGenerate = topic.trim() && !generateMutation.isPending;

  // Full-screen loading overlay
  if (generateMutation.isPending) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="size-24 rounded-full border-4 border-primary/20" />
            <Loader2 className="absolute inset-0 m-auto size-24 animate-spin text-primary" />
            <FileText className="absolute inset-0 m-auto size-8 text-primary" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold">Blog Olusturuluyor</h2>
            <p className="mt-2 text-muted-foreground">
              AI 3 dilde blog yazisi olusturuyor...
            </p>
            <p className="mt-1 text-sm text-muted-foreground/60">
              Bu islem 15-30 saniye surebilir
            </p>
          </div>
          <div className="mt-4 h-1.5 w-64 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ animation: "blogLoading 2s ease-in-out infinite" }}
            />
          </div>
        </div>
        <style>{`
          @keyframes blogLoading {
            0% { width: 10%; margin-left: 0; }
            50% { width: 60%; margin-left: 20%; }
            100% { width: 10%; margin-left: 90%; }
          }
        `}</style>
      </div>
    );
  }

  // Pre-generation: Topic input view
  if (!generated) {
    return (
      <div className="-m-6 flex min-h-[calc(100vh-4rem)] flex-col lg:flex-row">
        {/* Sol: Konu Girisi */}
        <div className="flex-1 space-y-5 overflow-y-auto border-e border-border bg-card/50 p-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <Link href="/blog">
              <button className="flex size-9 items-center justify-center rounded-xl bg-muted hover:bg-muted/80 transition-colors">
                <ArrowLeft className="size-4" />
              </button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">AI Blog Olustur</h1>
              <p className="text-xs text-muted-foreground">
                Konu yaz, 3 dilde blog olustur
              </p>
            </div>
          </div>

          {/* 1. Konu */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                1
              </span>
              Blog Konusu
            </label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Orn: Karabuk yoresinde el nakisi gelenegi ve modern yorumlari, dantel bakim rehberi, ev tekstilinde 2026 trendleri..."
              rows={4}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>

          {/* 2. Kategori */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                2
              </span>
              Kategori
              <span className="font-normal text-muted-foreground">(opsiyonel)</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {["Rehber", "Bakim", "Haberler", "Trendler", "Hikaye", ""].map(
                (cat) => (
                  <button
                    key={cat || "bos"}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={cn(
                      "rounded-lg px-3 py-2.5 text-xs font-medium transition-all",
                      category === cat
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 hover:bg-muted"
                    )}
                  >
                    {cat || "Yok"}
                  </button>
                )
              )}
            </div>
          </div>

          {/* 3. Gorsel */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                3
              </span>
              Kapak Gorseli
              <span className="font-normal text-muted-foreground">(opsiyonel)</span>
            </label>
            {imageUrl ? (
              <div className="relative overflow-hidden rounded-xl border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt="Kapak"
                  className="h-32 w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="absolute end-2 top-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
                >
                  <span className="text-xs">&#10005;</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleImageUpload}
                className="flex w-full items-center gap-3 rounded-xl border-2 border-dashed border-border p-4 transition-colors hover:border-primary hover:bg-primary/5"
              >
                <ImagePlus className="size-6 text-muted-foreground" />
                <div className="text-start">
                  <span className="text-sm font-medium">Gorsel Yukle</span>
                  <p className="text-xs text-muted-foreground">
                    Blog kapak gorseli (sonra da eklenebilir)
                  </p>
                </div>
              </button>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-center dark:border-red-800 dark:bg-red-950">
              <p className="text-sm font-medium text-red-700 dark:text-red-300">
                {error}
              </p>
            </div>
          )}

          {/* Olustur */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!canGenerate}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition-all",
              "disabled:cursor-not-allowed disabled:opacity-40",
              canGenerate
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl active:scale-[0.98]"
                : "bg-muted text-muted-foreground"
            )}
          >
            <Sparkles className="size-4" />
            AI ile Blog Olustur
          </button>
        </div>

        {/* Sag: Onizleme */}
        <div className="flex flex-1 flex-col items-center justify-center bg-muted/20 p-6">
          <div className="mb-3 flex size-16 items-center justify-center rounded-2xl bg-muted">
            <FileText className="size-7 text-muted-foreground/40" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">Onizleme</p>
          <p className="mt-1 max-w-xs text-center text-xs text-muted-foreground/60">
            Konu yazin ve &quot;AI ile Blog Olustur&quot; butonuna basin, 3 dilde blog
            icerigi burada gorunecek
          </p>
        </div>
      </div>
    );
  }

  // Post-generation: Edit view
  return (
    <div className="-m-6 flex min-h-[calc(100vh-4rem)] flex-col lg:flex-row">
      {/* Sol: Meta bilgiler */}
      <div className="w-full space-y-5 overflow-y-auto border-e border-border bg-card/50 p-6 lg:w-80 xl:w-96">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setGenerated(false)}
            className="flex size-9 items-center justify-center rounded-xl bg-muted hover:bg-muted/80 transition-colors"
          >
            <ArrowLeft className="size-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold">Blog Duzenle</h1>
            <p className="text-xs text-muted-foreground">
              3 dilde icerik hazir
            </p>
          </div>
        </div>

        {/* Konu (readonly) */}
        <div>
          <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="size-3.5 text-primary" />
            Konu
          </label>
          <p className="rounded-lg bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
            {topic}
          </p>
        </div>

        {/* Kategori */}
        <div>
          <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold">
            <Tag className="size-3.5 text-muted-foreground" />
            Kategori
          </label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Rehber, Bakim..."
            className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Gorsel */}
        <div>
          <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold">
            <ImagePlus className="size-3.5 text-muted-foreground" />
            Kapak Gorseli
          </label>
          {imageUrl ? (
            <div className="relative overflow-hidden rounded-lg border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="Kapak" className="h-24 w-full object-cover" />
              <button
                type="button"
                onClick={() => setImageUrl("")}
                className="absolute end-1.5 top-1.5 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
              >
                <span className="text-[10px]">&#10005;</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleImageUpload}
              className="flex w-full items-center gap-2 rounded-lg border-2 border-dashed border-border p-3 text-xs transition-colors hover:border-primary hover:bg-primary/5"
            >
              <ImagePlus className="size-4 text-muted-foreground" />
              <span className="font-medium">Gorsel Yukle</span>
            </button>
          )}
        </div>

        {/* Yayinla Toggle */}
        <div className="rounded-xl border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Yayinla</p>
              <p className="text-[10px] text-muted-foreground">
                {isPublished ? "3 dilde yayinlanacak" : "Taslak olarak kaydedilecek"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsPublished(!isPublished)}
              className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                isPublished ? "bg-primary" : "bg-muted"
              )}
            >
              <span
                className={cn(
                  "inline-block size-4 transform rounded-full bg-white transition-transform",
                  isPublished ? "translate-x-6" : "translate-x-1"
                )}
              />
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950">
            <p className="text-xs font-medium text-red-700 dark:text-red-300">
              {error}
            </p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all",
              "disabled:cursor-not-allowed disabled:opacity-40",
              "bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl active:scale-[0.98]"
            )}
          >
            {saveMutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="size-4" />
                {isPublished ? "3 Dilde Yayinla" : "3 Dilde Taslak Kaydet"}
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-xs font-medium hover:bg-muted transition-colors"
          >
            <Sparkles className="size-3.5" />
            Yeniden Olustur
          </button>
        </div>
      </div>

      {/* Sag: Icerik Editoru */}
      <div className="flex flex-1 flex-col overflow-y-auto bg-muted/20">
        {/* Locale Tabs */}
        <div className="sticky top-0 z-10 flex border-b border-border bg-background/80 backdrop-blur-sm">
          {LOCALES.map((locale) => (
            <button
              key={locale.key}
              type="button"
              onClick={() => setActiveTab(locale.key)}
              className={cn(
                "flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all",
                activeTab === locale.key
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span>{locale.flag}</span>
              <span>{locale.label}</span>
            </button>
          ))}
        </div>

        <div className="flex-1 space-y-4 p-6">
          {/* Baslik */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold">Baslik</label>
            <input
              type="text"
              value={activeLocaleData.title}
              onChange={(e) => handleTitleChange(activeTab, e.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Slug + Ozet inline */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold">Slug</label>
              <input
                type="text"
                value={activeLocaleData.slug}
                onChange={(e) => updateLocaleField(activeTab, "slug", e.target.value)}
                className="h-9 w-full rounded-lg border border-border bg-background px-3 font-mono text-xs focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold">Etiketler</label>
              <input
                type="text"
                value={activeLocaleData.tags}
                onChange={(e) => updateLocaleField(activeTab, "tags", e.target.value)}
                placeholder="etiket1, etiket2"
                className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Ozet */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold">Ozet</label>
            <textarea
              value={activeLocaleData.excerpt}
              onChange={(e) => updateLocaleField(activeTab, "excerpt", e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>

          {/* Tiptap Editor */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold">Icerik</label>
            <TiptapEditor
              content={activeLocaleData.content}
              onChange={(html) => updateLocaleField(activeTab, "content", html)}
              placeholder="Blog icerigi..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
