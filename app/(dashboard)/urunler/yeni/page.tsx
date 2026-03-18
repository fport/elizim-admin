"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Upload, X, Loader2, Check } from "lucide-react";
import Link from "next/link";
import { productsApi, categoriesApi, uploadApi } from "@/lib/api";
import { Button } from "@/components/ui/button";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function NewProductForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  // Pre-fill from Instagram import
  const prefillTitle = searchParams.get("title") || "";
  const prefillDescription = searchParams.get("description") || "";
  const prefillImages = searchParams.get("images") || "";
  const prefillThumbnail = searchParams.get("thumbnailUrl") || "";
  const prefillInstagramId = searchParams.get("instagramPostId") || "";

  const initialImages = prefillImages
    ? prefillImages.split(",").filter(Boolean)
    : [];

  const [title, setTitle] = useState(prefillTitle);
  const [slug, setSlug] = useState(slugify(prefillTitle));
  const [description, setDescription] = useState(prefillDescription);
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [tags, setTags] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [whatsappText, setWhatsappText] = useState("");
  const [images, setImages] = useState<string[]>(initialImages);
  const [thumbnailUrl, setThumbnailUrl] = useState(prefillThumbnail);
  const [isActive, setIsActive] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: categoriesApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: productsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      router.push("/urunler");
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  function handleTitleChange(value: string) {
    setTitle(value);
    setSlug(slugify(value));
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;

    setUploading(true);
    setError("");

    try {
      const uploadPromises = Array.from(files).map((file) =>
        uploadApi.uploadImage(file)
      );
      const urls = await Promise.all(uploadPromises);
      const newImages = [...images, ...urls];
      setImages(newImages);

      if (!thumbnailUrl && newImages.length > 0) {
        setThumbnailUrl(newImages[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Resim yuklenemedi");
    } finally {
      setUploading(false);
    }
  }

  function removeImage(index: number) {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    if (thumbnailUrl === images[index]) {
      setThumbnailUrl(newImages[0] || "");
    }
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

    createMutation.mutate({
      title: title.trim(),
      slug: slug.trim(),
      description: description.trim() || null,
      price: priceKurus,
      categoryId: categoryId || null,
      tags: tags.trim() || null,
      deliveryTime: deliveryTime.trim() || null,
      whatsappText: whatsappText.trim() || null,
      images: images.length > 0 ? JSON.stringify(images) : null,
      thumbnailUrl: thumbnailUrl || null,
      instagramPostId: prefillInstagramId || null,
      isActive,
    });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/urunler">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="size-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Yeni Urun</h1>
          <p className="text-sm text-muted-foreground">
            Yeni bir urun olusturun
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title & Slug */}
        <div className="glass-card rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">
            Temel Bilgiler
          </h2>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Baslik *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Urun basligi"
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
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
              placeholder="urun-slug"
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Aciklama
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Urun aciklamasi"
              rows={4}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20 resize-none"
            />
          </div>
        </div>

        {/* Price & Category */}
        <div className="glass-card rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">
            Fiyat ve Kategori
          </h2>

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
                placeholder="150.00"
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Kategori
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
              >
                <option value="">Kategori secin</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
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
              placeholder="el islemesi, masa ortusu, dantel"
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Teslimat Suresi
              </label>
              <input
                type="text"
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
                placeholder="3-5 is gunu"
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                WhatsApp Metni
              </label>
              <input
                type="text"
                value={whatsappText}
                onChange={(e) => setWhatsappText(e.target.value)}
                placeholder="Bu urun hakkinda bilgi almak istiyorum"
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
              />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="glass-card rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Gorseller</h2>

          {/* Upload */}
          <div>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-6 transition-colors hover:border-primary/50 hover:bg-muted/30">
              <Upload className="mb-2 size-8 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                {uploading
                  ? "Yukleniyor..."
                  : "Gorsel yuklemek icin tiklayin"}
              </span>
              <span className="mt-1 text-xs text-muted-foreground">
                PNG, JPG, WebP (max 10MB)
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>

          {/* Image Grid */}
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {images.map((url, index) => (
                <div
                  key={index}
                  className="group relative aspect-square overflow-hidden rounded-lg border border-border"
                >
                  <Image
                    src={url}
                    alt={`Gorsel ${index + 1}`}
                    fill
                    className="object-cover"
                  />

                  {/* Thumbnail badge */}
                  {thumbnailUrl === url && (
                    <div className="absolute left-1 top-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                      Kapak
                    </div>
                  )}

                  {/* Actions overlay */}
                  <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => setThumbnailUrl(url)}
                      className="rounded-lg bg-white/90 p-1.5 text-black hover:bg-white"
                      title="Kapak gorseli yap"
                    >
                      <Check className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="rounded-lg bg-white/90 p-1.5 text-red-600 hover:bg-white"
                      title="Gorseli kaldir"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Toggle */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Durum</h2>
              <p className="text-sm text-muted-foreground">
                Urunun sitede gorunurlugu
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
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Link href="/urunler">
            <Button type="button" variant="outline">
              Iptal
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={createMutation.isPending}
            className="min-w-[120px]"
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              "Urunu Kaydet"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function NewProductPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      }
    >
      <NewProductForm />
    </Suspense>
  );
}
