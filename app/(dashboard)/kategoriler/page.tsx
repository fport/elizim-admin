"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Loader2, X, Save, Globe } from "lucide-react";
import { categoriesApi } from "@/lib/api";
import type { Category, CategoryTranslation } from "@/lib/api";
import { Button } from "@/components/ui/button";

const LOCALES = [
  { code: "tr", label: "Turkce", flag: "🇹🇷" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
] as const;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export default function CategoriesPage() {
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [order, setOrder] = useState(0);
  const [error, setError] = useState("");

  // Translation state
  const [activeLocale, setActiveLocale] = useState("tr");
  const [translationNames, setTranslationNames] = useState<Record<string, string>>({ en: "", ar: "" });
  const [translationDescs, setTranslationDescs] = useState<Record<string, string>>({ en: "", ar: "" });

  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: categoriesApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: categoriesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      resetForm();
    },
    onError: (err: Error) => setError(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof categoriesApi.update>[1] }) =>
      categoriesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      resetForm();
    },
    onError: (err: Error) => setError(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setDeleteId(null);
    },
  });

  function resetForm() {
    setShowForm(false);
    setEditingId(null);
    setName("");
    setSlug("");
    setDescription("");
    setImageUrl("");
    setOrder(0);
    setError("");
    setActiveLocale("tr");
    setTranslationNames({ en: "", ar: "" });
    setTranslationDescs({ en: "", ar: "" });
  }

  async function startEdit(cat: Category) {
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || "");
    setImageUrl(cat.imageUrl || "");
    setOrder(cat.order);
    setShowForm(true);
    setActiveLocale("tr");
    setError("");

    // Load translations
    try {
      const translations = await categoriesApi.getTranslations(cat.id);
      const names: Record<string, string> = { en: "", ar: "" };
      const descs: Record<string, string> = { en: "", ar: "" };
      for (const tr of translations) {
        if (tr.locale === "en" || tr.locale === "ar") {
          names[tr.locale] = tr.name;
          descs[tr.locale] = tr.description || "";
        }
      }
      setTranslationNames(names);
      setTranslationDescs(descs);
    } catch {
      // Translations may not exist yet
    }
  }

  function startCreate() {
    resetForm();
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Kategori adi gerekli");
      return;
    }

    const translations: { locale: string; name: string; description: string | null }[] = [];
    for (const loc of ["en", "ar"] as const) {
      if (translationNames[loc]?.trim()) {
        translations.push({
          locale: loc,
          name: translationNames[loc].trim(),
          description: translationDescs[loc]?.trim() || null,
        });
      }
    }

    const data = {
      name: name.trim(),
      slug: slug.trim() || slugify(name),
      description: description.trim() || null,
      imageUrl: imageUrl.trim() || null,
      order,
      translations,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      createMutation.mutate(data);
    }
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Kategoriler</h1>
          <p className="text-sm text-muted-foreground">
            Urun kategorilerini yonetin
          </p>
        </div>
        {!showForm && (
          <Button onClick={startCreate} className="gap-2" data-tour="kategori-add-btn">
            <Plus className="size-4" />
            Yeni Kategori
          </Button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="glass-card rounded-3xl p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              {editingId ? "Kategoriyi Duzenle" : "Yeni Kategori"}
            </h2>
            <button
              onClick={resetForm}
              className="rounded-xl p-1 text-muted-foreground hover:bg-muted"
            >
              <X className="size-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Language Tabs */}
            <div className="flex items-center gap-1 rounded-2xl bg-muted/50 p-1">
              {LOCALES.map((loc) => (
                <button
                  key={loc.code}
                  type="button"
                  onClick={() => setActiveLocale(loc.code)}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium transition-colors ${
                    activeLocale === loc.code
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>{loc.flag}</span>
                  <span>{loc.label}</span>
                </button>
              ))}
              <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                <Globe className="size-3.5" />
                Coklu dil
              </div>
            </div>

            {/* TR fields (main) */}
            {activeLocale === "tr" && (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      Ad * <span className="text-xs text-muted-foreground">(Turkce)</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (!editingId) setSlug(slugify(e.target.value));
                      }}
                      placeholder="Kategori adi"
                      className="h-10 w-full px-3 text-sm"
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
                      placeholder="kategori-slug"
                      className="h-10 w-full px-3 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Aciklama <span className="text-xs text-muted-foreground">(Turkce)</span>
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Kategori aciklamasi"
                    className="h-10 w-full px-3 text-sm"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      Gorsel URL
                    </label>
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://..."
                      className="h-10 w-full px-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      Sira
                    </label>
                    <input
                      type="number"
                      value={order}
                      onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
                      min={0}
                      className="h-10 w-full px-3 text-sm"
                    />
                  </div>
                </div>
              </>
            )}

            {/* EN / AR fields */}
            {activeLocale !== "tr" && (
              <>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Ad * <span className="text-xs text-muted-foreground">
                      ({LOCALES.find((l) => l.code === activeLocale)?.label})
                    </span>
                  </label>
                  <input
                    type="text"
                    value={translationNames[activeLocale] || ""}
                    onChange={(e) =>
                      setTranslationNames((prev) => ({ ...prev, [activeLocale]: e.target.value }))
                    }
                    placeholder={`Kategori adi (${LOCALES.find((l) => l.code === activeLocale)?.label})`}
                    className="h-10 w-full px-3 text-sm"
                    dir={activeLocale === "ar" ? "rtl" : "ltr"}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Aciklama <span className="text-xs text-muted-foreground">
                      ({LOCALES.find((l) => l.code === activeLocale)?.label})
                    </span>
                  </label>
                  <input
                    type="text"
                    value={translationDescs[activeLocale] || ""}
                    onChange={(e) =>
                      setTranslationDescs((prev) => ({ ...prev, [activeLocale]: e.target.value }))
                    }
                    placeholder={`Kategori aciklamasi (${LOCALES.find((l) => l.code === activeLocale)?.label})`}
                    className="h-10 w-full px-3 text-sm"
                    dir={activeLocale === "ar" ? "rtl" : "ltr"}
                  />
                </div>

                {!name.trim() && (
                  <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-600 dark:text-amber-400">
                    Once Turkce sekmesinden kategori adini girin.
                  </div>
                )}
              </>
            )}

            {error && (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={resetForm}>
                Iptal
              </Button>
              <Button type="submit" disabled={isSaving} className="gap-2">
                {isSaving ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                {editingId ? "Guncelle" : "Olustur"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Category List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : !categories?.length ? (
        <div className="flex flex-col items-center justify-center glass-card rounded-3xl py-20">
          <p className="text-muted-foreground">Henuz kategori yok</p>
          {!showForm && (
            <Button
              variant="outline"
              className="mt-4 gap-2"
              onClick={startCreate}
            >
              <Plus className="size-4" />
              Ilk Kategoriyi Ekle
            </Button>
          )}
        </div>
      ) : (
        <div className="glass-card rounded-3xl overflow-hidden" data-tour="kategori-table">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Ad
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Slug
                </th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground sm:table-cell">
                  Sira
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Islemler
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, idx) => (
                <tr
                  key={cat.id}
                  className="border-b border-border/50 last:border-0 hover:bg-muted/20"
                >
                  <td className="px-4 py-3 font-medium text-foreground">
                    {cat.name}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {cat.slug}
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                    {cat.order}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => startEdit(cat)}
                        {...(idx === 0 ? { "data-tour": "kategori-edit-btn" } : {})}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setDeleteId(cat.id)}
                        {...(idx === 0 ? { "data-tour": "kategori-delete-btn" } : {})}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md">
          <div className="mx-4 w-full max-w-sm glass-modal rounded-3xl p-6">
            <h3 className="text-lg font-semibold text-foreground">
              Kategoriyi Sil
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Bu kategoriyi silmek istediginizden emin misiniz? Kategoriye ait
              urunlerin kategori bilgisi silinecektir.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setDeleteId(null)}
                disabled={deleteMutation.isPending}
              >
                Iptal
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteId && deleteMutation.mutate(deleteId)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : null}
                Sil
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
