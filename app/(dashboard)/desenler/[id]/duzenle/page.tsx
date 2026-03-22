"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Upload, Loader2, Link2 } from "lucide-react";
import { patternsApi, uploadApi } from "@/lib/api";
import { Button } from "@/components/ui/button";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

const AVAILABLE_FORMATS = ["DST", "VP3", "EXP"];
const TECHNIQUE_OPTIONS = ["Maraş İşi", "Kanaviçe", "Logo"];

export default function EditPatternPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [tags, setTags] = useState("");
  const [previewImageUrl, setPreviewImageUrl] = useState("");
  const [formats, setFormats] = useState<string[]>(["DST", "VP3", "EXP"]);
  const [difficulty, setDifficulty] = useState("");
  const [stitchCount, setStitchCount] = useState("");
  const [dimensions, setDimensions] = useState("");
  const [colorCount, setColorCount] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  const { data: patterns } = useQuery({
    queryKey: ["patterns"],
    queryFn: patternsApi.getAll,
  });

  const pattern = patterns?.find((p) => p.id === id);

  useEffect(() => {
    if (pattern && !loaded) {
      setTitle(pattern.title);
      setSlug(pattern.slug);
      setDescription(pattern.description || "");
      setPrice((pattern.price / 100).toFixed(2));
      setCategoryId(pattern.categoryId || "");
      setTags(pattern.tags || "");
      setPreviewImageUrl(pattern.previewImageUrl || "");
      setFormats(pattern.formats.split(",").map((f) => f.trim()));
      setDifficulty(pattern.difficulty || "");
      setStitchCount(pattern.stitchCount ? String(pattern.stitchCount) : "");
      setDimensions(pattern.dimensions || "");
      setColorCount(pattern.colorCount ? String(pattern.colorCount) : "");
      setIsActive(pattern.isActive);
      setLoaded(true);
    }
  }, [pattern, loaded]);

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      patternsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patterns"] });
      router.push("/desenler");
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  function handleTitleChange(value: string) {
    setTitle(value);
    setSlug(generateSlug(value));
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const url = await uploadApi.uploadImage(file);
      setPreviewImageUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gorsel yuklenemedi");
    } finally {
      setUploading(false);
    }
  }

  function toggleFormat(fmt: string) {
    setFormats((prev) =>
      prev.includes(fmt) ? prev.filter((f) => f !== fmt) : [...prev, fmt]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Baslik gerekli");
      return;
    }

    const priceKurus = Math.round(parseFloat(price || "0") * 100);
    if (priceKurus <= 0) {
      setError("Gecerli bir fiyat girin");
      return;
    }

    updateMutation.mutate({
      title: title.trim(),
      slug: slug.trim(),
      description: description.trim() || null,
      price: priceKurus,
      categoryId: categoryId || null,
      tags: tags.trim() || null,
      previewImageUrl: previewImageUrl || null,
      formats: formats.join(","),
      difficulty: difficulty || null,
      stitchCount: stitchCount ? parseInt(stitchCount) : null,
      dimensions: dimensions.trim() || null,
      colorCount: colorCount ? parseInt(colorCount) : null,
      isActive,
    });
  }

  if (!pattern && patterns) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg font-semibold text-foreground">Desen bulunamadi</p>
        <Link href="/desenler" className="mt-4">
          <Button variant="outline">Desenlere Don</Button>
        </Link>
      </div>
    );
  }

  if (!loaded) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/desenler">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="size-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Desen Duzenle</h1>
          <p className="text-sm text-muted-foreground">{pattern?.title}</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title & Slug */}
        <div className="glass-card rounded-3xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Temel Bilgiler</h2>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Baslik *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Desen basligi"
              className="h-10 w-full text-sm"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Slug
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="desen-slug"
              className="h-10 w-full text-sm"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Aciklama
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Desen aciklamasi"
              rows={4}
              className="w-full text-sm"
            />
          </div>
        </div>

        {/* Price & Details */}
        <div className="glass-card rounded-3xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Fiyat ve Detaylar</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Fiyat (TL) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="h-10 w-full text-sm"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Nakis Turu
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="h-10 w-full text-sm"
              >
                <option value="">Seciniz</option>
                {TECHNIQUE_OPTIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Dikis Sayisi
              </label>
              <input
                type="number"
                min="0"
                value={stitchCount}
                onChange={(e) => setStitchCount(e.target.value)}
                placeholder="15000"
                className="h-10 w-full text-sm"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Boyutlar
              </label>
              <input
                type="text"
                value={dimensions}
                onChange={(e) => setDimensions(e.target.value)}
                placeholder="10x15 cm"
                className="h-10 w-full text-sm"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Renk Sayisi
              </label>
              <input
                type="number"
                min="1"
                value={colorCount}
                onChange={(e) => setColorCount(e.target.value)}
                placeholder="5"
                className="h-10 w-full text-sm"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Etiketler (virgul ile ayirin)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="cicek, yaprak, geometrik"
              className="h-10 w-full text-sm"
            />
          </div>
        </div>

        {/* Formats */}
        <div className="glass-card rounded-3xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Formatlar</h2>
          <div className="flex gap-3">
            {AVAILABLE_FORMATS.map((fmt) => (
              <label
                key={fmt}
                className="flex cursor-pointer items-center gap-2"
              >
                <input
                  type="checkbox"
                  checked={formats.includes(fmt)}
                  onChange={() => toggleFormat(fmt)}
                  className="size-4 rounded border-border text-primary focus:ring-primary/20"
                />
                <span className="text-sm font-medium">{fmt}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Preview Image */}
        <div className="glass-card rounded-3xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Onizleme Gorseli</h2>

          <div>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border/50 p-6 transition-colors hover:border-primary/50 hover:bg-muted/30">
              <Upload className="mb-2 size-8 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                {uploading ? "Yukleniyor..." : "Gorsel yuklemek icin tiklayin"}
              </span>
              <span className="mt-1 text-xs text-muted-foreground">
                PNG, JPG, WebP (max 10MB)
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>

          {/* URL Input */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Link2 className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="url"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                placeholder="veya gorsel URL'si yapistiriniz"
                className="h-10 w-full pl-9 pr-3 text-sm"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              disabled={!imageUrlInput.trim()}
              onClick={() => {
                const url = imageUrlInput.trim();
                if (url) {
                  setPreviewImageUrl(url);
                  setImageUrlInput("");
                }
              }}
            >
              Ekle
            </Button>
          </div>

          {previewImageUrl && (
            <div className="flex items-center gap-4">
              <Image
                src={previewImageUrl}
                alt="Preview"
                width={120}
                height={120}
                className="size-30 rounded-2xl border border-border object-cover"
              />
            </div>
          )}
        </div>

        {/* Active Toggle */}
        <div className="glass-card rounded-3xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Durum</h2>
              <p className="text-sm text-muted-foreground">
                Desenin sitede gorunurlugu
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isActive ? "bg-primary" : "bg-muted"
              }`}
            >
              <span
                className={`inline-block size-4 transform rounded-full bg-white transition-transform ${
                  isActive ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Link href="/desenler">
            <Button type="button" variant="outline">
              Iptal
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={updateMutation.isPending}
            className="min-w-[120px]"
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              "Degisiklikleri Kaydet"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
