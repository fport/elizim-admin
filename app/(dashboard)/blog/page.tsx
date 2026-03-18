"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { blogApi } from "@/lib/api";
import type { BlogPost } from "@/lib/api";
import { Button } from "@/components/ui/button";

const localeLabels: Record<string, string> = {
  tr: "Turkce",
  en: "English",
  ar: "Arabic",
};

export default function BlogPage() {
  const queryClient = useQueryClient();
  const [localeFilter, setLocaleFilter] = useState<string>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: posts, isLoading } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: blogApi.getAllAdmin,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => blogApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      setDeleteId(null);
    },
  });

  const filteredPosts =
    localeFilter === "all"
      ? posts
      : posts?.filter((p) => p.locale === localeFilter);

  function formatDate(dateStr: string | null): string {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString("tr-TR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return "-";
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Blog</h1>
          <p className="text-sm text-muted-foreground">
            Blog yazilarini yonetin
          </p>
        </div>
        <Link href="/blog/yeni">
          <Button className="gap-2">
            <Plus className="size-4" />
            Yeni Yazi
          </Button>
        </Link>
      </div>

      {/* Locale Filter */}
      <div className="flex gap-2">
        {["all", "tr", "en", "ar"].map((locale) => (
          <button
            key={locale}
            onClick={() => setLocaleFilter(locale)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              localeFilter === locale
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {locale === "all" ? "Tumu" : localeLabels[locale] || locale}
          </button>
        ))}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : !filteredPosts?.length ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border py-20">
          <p className="text-muted-foreground">Henuz blog yazisi yok</p>
          <Link href="/blog/yeni" className="mt-4">
            <Button variant="outline" className="gap-2">
              <Plus className="size-4" />
              Ilk Yaziyi Olustur
            </Button>
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Baslik
                </th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground sm:table-cell">
                  Dil
                </th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">
                  Durum
                </th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground lg:table-cell">
                  Tarih
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Islemler
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.map((post) => (
                <tr
                  key={post.id}
                  className="border-b border-border last:border-0 hover:bg-muted/30"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{post.title}</p>
                    <p className="text-xs text-muted-foreground">{post.slug}</p>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <span className="inline-flex rounded bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      {post.locale.toUpperCase()}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        post.isPublished
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                      }`}
                    >
                      {post.isPublished ? "Yayinda" : "Taslak"}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">
                    {formatDate(post.publishedAt || post.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/blog/${post.id}/duzenle`}>
                        <Button variant="ghost" size="icon-sm">
                          <Pencil className="size-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setDeleteId(post.id)}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-xl border border-border bg-background p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-foreground">
              Yaziyi Sil
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Bu blog yazisini silmek istediginizden emin misiniz? Bu islem geri
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
