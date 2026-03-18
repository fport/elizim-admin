"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Upload, X, Loader2, Check } from "lucide-react";
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

export default function EditProductPage({
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
  const [deliveryTime, setDeliveryTime] = useState("");
  const [whatsappText, setWhatsappText] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: categoriesApi.getAll,
  });

  // Fetch product by ID — use the slug endpoint but ID works as a fallback
  // The API uses slug-based lookup, so we need to get all products and find by ID
  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: productsApi.getAll,
  });

  const product = products?.find((p) => p.id === id);

  useEffect(() => {
    if (product && !loaded) {
      setTitle(product.title);
      setSlug(product.slug);
      setDescription(product.description || "");
      setPrice((product.price / 100).toFixed(2));
      setCategoryId(product.categoryId || "");
      setTags(product.tags || "");
      setDeliveryTime(product.deliveryTime || "");
      setWhatsappText(product.whatsappText || "");
      setThumbnailUrl(product.thumbnailUrl || "");
      setIsActive(product.isActive);

      try {
        const parsed = product.images ? JSON.parse(product.images) : [];
        setImages(Array.isArray(parsed) ? parsed : []);
      } catch {
        setImages([]);
      }

      setLoaded(true);
    }
  }, [product, loaded]);

  const updateMutation = useMutation({
    mutationFn: (data: Parameters<typeof productsApi.update>[1]) =>
      productsApi.update(id, data),
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

    updateMutation.mutate({
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
      isActive,
    });
  }

  if (!product && products) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg font-semibold text-foreground">Urun bulunamadi</p>
        <Link href="/urunler" className="mt-4">
          <Button variant="outline">Urunlere Don</Button>
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
        <Link href="/urunler">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="size-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Urunu Duzenle</h1>
          <p className="text-sm text-muted-foreground">{product?.title}</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title & Slug */}
        <div className="glass-card rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Temel Bilgiler</h2>

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
          <h2 className="text-lg font-semibold text-foreground">Fiyat ve Kategori</h2>

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

          <div>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-6 transition-colors hover:border-primary/50 hover:bg-muted/30">
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
                multiple
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>

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

                  {thumbnailUrl === url && (
                    <div className="absolute left-1 top-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                      Kapak
                    </div>
                  )}

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
