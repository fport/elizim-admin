"use client";

import { useState } from "react";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";
import { patternsApi } from "@/lib/api";
import type { Pattern } from "@/lib/api";
import { Button } from "@/components/ui/button";

function formatPrice(kurus: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(kurus / 100);
}

export default function PatternsPage() {
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);

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
        <Link href="/desenler/yeni" data-tour="desen-add-btn">
          <Button className="gap-2">
            <Plus className="size-4" />
            Yeni Desen
          </Button>
        </Link>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : !patterns?.length ? (
        <div className="flex flex-col items-center justify-center glass-card rounded-3xl py-20">
          <p className="text-muted-foreground">Henuz desen yok</p>
          <Link href="/desenler/yeni" className="mt-4">
            <Button variant="outline" className="gap-2">
              <Plus className="size-4" />
              Ilk Deseni Ekle
            </Button>
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto glass-card rounded-3xl overflow-hidden" data-tour="desen-table">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
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
                  className="border-b border-border/50 last:border-0 hover:bg-muted/20"
                >
                  <td className="px-4 py-3">
                    {pattern.previewImageUrl ? (
                      <Image
                        src={pattern.previewImageUrl}
                        alt={pattern.title}
                        width={48}
                        height={48}
                        className="size-12 rounded-2xl object-cover"
                      />
                    ) : (
                      <div className="flex size-12 items-center justify-center rounded-2xl bg-muted text-xs text-muted-foreground">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md">
          <div className="mx-4 w-full max-w-sm glass-modal rounded-3xl p-6">
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
