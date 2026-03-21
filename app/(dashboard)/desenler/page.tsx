"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  X,
  Upload,
  Link2,
} from "lucide-react";
import { patternsApi, uploadApi } from "@/lib/api";
import type { Pattern } from "@/lib/api";
import { Button } from "@/components/ui/button";

function formatPrice(kurus: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(kurus / 100);
}

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
const DIFFICULTY_OPTIONS = ["Kolay", "Orta", "Zor"];

interface PatternFormData {
  title: string;
  slug: string;
  description: string;
  price: string;
  categoryId: string;
  tags: string;
  previewImageUrl: string;
  formats: string[];
  difficulty: string;
  stitchCount: string;
  dimensions: string;
  colorCount: string;
  isActive: boolean;
}

const emptyForm: PatternFormData = {
  title: "",
  slug: "",
  description: "",
  price: "",
  categoryId: "",
  tags: "",
  previewImageUrl: "",
  formats: ["DST", "VP3", "EXP"],
  difficulty: "Orta",
  stitchCount: "",
  dimensions: "",
  colorCount: "",
  isActive: true,
};

export default function PatternsPage() {
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPattern, setEditingPattern] = useState<Pattern | null>(null);
  const [form, setForm] = useState<PatternFormData>(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState("");

  const { data: patterns, isLoading } = useQuery({
    queryKey: ["patterns"],
    queryFn: patternsApi.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => patternsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patterns"] });
      setDeleteId(null);
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => patternsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patterns"] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      patternsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patterns"] });
      resetForm();
    },
  });

  function resetForm() {
    setForm(emptyForm);
    setShowForm(false);
    setEditingPattern(null);
    setImageUrlInput("");
  }

  function openCreate() {
    setForm(emptyForm);
    setEditingPattern(null);
    setShowForm(true);
  }

  function openEdit(pattern: Pattern) {
    setEditingPattern(pattern);
    setForm({
      title: pattern.title,
      slug: pattern.slug,
      description: pattern.description || "",
      price: String(pattern.price / 100),
      categoryId: pattern.categoryId || "",
      tags: pattern.tags || "",
      previewImageUrl: pattern.previewImageUrl || "",
      formats: pattern.formats.split(",").map((f) => f.trim()),
      difficulty: pattern.difficulty || "Orta",
      stitchCount: pattern.stitchCount ? String(pattern.stitchCount) : "",
      dimensions: pattern.dimensions || "",
      colorCount: pattern.colorCount ? String(pattern.colorCount) : "",
      isActive: pattern.isActive,
    });
    setShowForm(true);
  }

  // Auto-generate slug when title changes (only for new patterns)
  useEffect(() => {
    if (!editingPattern && form.title) {
      setForm((prev) => ({ ...prev, slug: generateSlug(prev.title) }));
    }
  }, [form.title, editingPattern]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadApi.uploadImage(file);
      setForm((prev) => ({ ...prev, previewImageUrl: url }));
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  }

  function toggleFormat(fmt: string) {
    setForm((prev) => ({
      ...prev,
      formats: prev.formats.includes(fmt)
        ? prev.formats.filter((f) => f !== fmt)
        : [...prev.formats, fmt],
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data: Record<string, unknown> = {
      title: form.title,
      slug: form.slug,
      description: form.description || null,
      price: Math.round(parseFloat(form.price) * 100),
      categoryId: form.categoryId || null,
      tags: form.tags || null,
      previewImageUrl: form.previewImageUrl || null,
      formats: form.formats.join(","),
      difficulty: form.difficulty || null,
      stitchCount: form.stitchCount ? parseInt(form.stitchCount) : null,
      dimensions: form.dimensions || null,
      colorCount: form.colorCount ? parseInt(form.colorCount) : null,
      isActive: form.isActive,
    };

    if (editingPattern) {
      updateMutation.mutate({ id: editingPattern.id, data });
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
          <h1 className="text-2xl font-bold text-foreground">Desenler</h1>
          <p className="text-sm text-muted-foreground">
            Nakis desenlerini yonetin
          </p>
        </div>
        <Button className="gap-2" onClick={openCreate} data-tour="desen-add-btn">
          <Plus className="size-4" />
          Yeni Desen
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {editingPattern ? "Desen Duzenle" : "Yeni Desen"}
            </h2>
            <button
              onClick={resetForm}
              className="rounded-lg p-1 hover:bg-muted"
            >
              <X className="size-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Title */}
              <div>
                <label className="mb-1 block text-sm font-medium">Baslik</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  required
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Desen basligi"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="mb-1 block text-sm font-medium">Slug</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, slug: e.target.value }))
                  }
                  required
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="desen-slug"
                />
              </div>

              {/* Price */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Fiyat (TL)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, price: e.target.value }))
                  }
                  required
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="0.00"
                />
              </div>

              {/* Difficulty */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Zorluk
                </label>
                <select
                  value={form.difficulty}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, difficulty: e.target.value }))
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {DIFFICULTY_OPTIONS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stitch Count */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Dikis Sayisi
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.stitchCount}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      stitchCount: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="15000"
                />
              </div>

              {/* Dimensions */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Boyutlar
                </label>
                <input
                  type="text"
                  value={form.dimensions}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      dimensions: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="10x15 cm"
                />
              </div>

              {/* Color Count */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Renk Sayisi
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.colorCount}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      colorCount: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="5"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Etiketler
                </label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, tags: e.target.value }))
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="cicek, yaprak, geometrik"
                />
              </div>
            </div>

            {/* Formats */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Formatlar
              </label>
              <div className="flex gap-3">
                {AVAILABLE_FORMATS.map((fmt) => (
                  <label
                    key={fmt}
                    className="flex cursor-pointer items-center gap-2"
                  >
                    <input
                      type="checkbox"
                      checked={form.formats.includes(fmt)}
                      onChange={() => toggleFormat(fmt)}
                      className="size-4 rounded border-border text-primary focus:ring-primary/20"
                    />
                    <span className="text-sm font-medium">{fmt}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                Aciklama
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={3}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Desen aciklamasi..."
              />
            </div>

            {/* Preview Image Upload */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                Onizleme Gorseli
              </label>
              <div className="flex items-center gap-4">
                {form.previewImageUrl && (
                  <Image
                    src={form.previewImageUrl}
                    alt="Preview"
                    width={80}
                    height={80}
                    className="size-20 rounded-lg border border-border object-cover"
                  />
                )}
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm transition-colors hover:bg-muted">
                  <Upload className="size-4" />
                  {uploading ? "Yukleniyor..." : "Gorsel Yukle"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>
              <div className="mt-2 flex gap-2">
                <div className="relative flex-1">
                  <Link2 className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="url"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    placeholder="veya gorsel URL'si yapistiriniz"
                    className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!imageUrlInput.trim()}
                  onClick={() => {
                    const url = imageUrlInput.trim();
                    if (url) {
                      setForm((prev) => ({ ...prev, previewImageUrl: url }));
                      setImageUrlInput("");
                    }
                  }}
                >
                  Ekle
                </Button>
              </div>
            </div>

            {/* Active toggle */}
            <div className="flex items-center gap-2">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      isActive: e.target.checked,
                    }))
                  }
                  className="size-4 rounded border-border text-primary focus:ring-primary/20"
                />
                <span className="text-sm font-medium">Aktif</span>
              </label>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={resetForm}>
                Iptal
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 size-4 animate-spin" />}
                {editingPattern ? "Guncelle" : "Olustur"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : !patterns?.length ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border py-20">
          <p className="text-muted-foreground">Henuz desen yok</p>
          <Button
            variant="outline"
            className="mt-4 gap-2"
            onClick={openCreate}
          >
            <Plus className="size-4" />
            Ilk Deseni Ekle
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border" data-tour="desen-table">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Gorsel
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Baslik
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Fiyat
                </th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">
                  Formatlar
                </th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground lg:table-cell">
                  Zorluk
                </th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground sm:table-cell">
                  Durum
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Islemler
                </th>
              </tr>
            </thead>
            <tbody>
              {patterns.map((pattern, idx) => (
                <tr
                  key={pattern.id}
                  className="border-b border-border last:border-0 hover:bg-muted/30"
                >
                  <td className="px-4 py-3">
                    {pattern.previewImageUrl ? (
                      <Image
                        src={pattern.previewImageUrl}
                        alt={pattern.title}
                        width={48}
                        height={48}
                        className="size-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex size-12 items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground">
                        Yok
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">
                      {pattern.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {pattern.slug}
                    </p>
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">
                    {formatPrice(pattern.price)}
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {pattern.formats.split(",").map((fmt) => (
                        <span
                          key={fmt.trim()}
                          className="inline-flex rounded bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground"
                        >
                          {fmt.trim()}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 lg:table-cell">
                    {pattern.difficulty && (
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          pattern.difficulty === "Kolay"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : pattern.difficulty === "Orta"
                              ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                      >
                        {pattern.difficulty}
                      </span>
                    )}
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        pattern.isActive
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      {pattern.isActive ? "Aktif" : "Pasif"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/desenler/${pattern.id}/duzenle`} {...(idx === 0 ? { "data-tour": "desen-edit-btn" } : {})}>
                        <Button variant="ghost" size="icon-sm">
                          <Pencil className="size-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setDeleteId(pattern.id)}
                        {...(idx === 0 ? { "data-tour": "desen-delete-btn" } : {})}
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

      {/* Delete Confirmation Dialog */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-xl border border-border bg-background p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-foreground">
              Deseni Sil
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Bu deseni silmek istediginizden emin misiniz? Bu islem geri
              alinamaz.
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
