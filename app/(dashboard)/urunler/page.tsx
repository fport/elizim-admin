"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { productsApi } from "@/lib/api";
import type { Product } from "@/lib/api";
import { Button } from "@/components/ui/button";

function formatPrice(kurus: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(kurus / 100);
}

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: productsApi.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setDeleteId(null);
    },
  });

  function handleDelete(product: Product) {
    setDeleteId(product.id);
  }

  function confirmDelete() {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Urunler</h1>
          <p className="text-sm text-muted-foreground">
            Tum urunleri yonetin
          </p>
        </div>
        <Link href="/urunler/yeni" data-tour="urun-add-btn">
          <Button className="gap-2">
            <Plus className="size-4" />
            Yeni Urun
          </Button>
        </Link>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : !products?.length ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border py-20">
          <p className="text-muted-foreground">Henuz urun yok</p>
          <Link href="/urunler/yeni" className="mt-4">
            <Button variant="outline" className="gap-2">
              <Plus className="size-4" />
              Ilk Urunu Ekle
            </Button>
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border" data-tour="urun-table">
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
                  Kategori
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
              {products.map((product, idx) => (
                <tr
                  key={product.id}
                  className="border-b border-border last:border-0 hover:bg-muted/30"
                >
                  <td className="px-4 py-3">
                    {product.thumbnailUrl ? (
                      <Image
                        src={product.thumbnailUrl}
                        alt={product.title}
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
                      {product.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {product.slug}
                    </p>
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">
                    {formatPrice(product.price)}
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                    {product.categoryId || "-"}
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        product.isActive
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      {product.isActive ? "Aktif" : "Pasif"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/urunler/${product.id}/duzenle`} {...(idx === 0 ? { "data-tour": "urun-edit-btn" } : {})}>
                        <Button variant="ghost" size="icon-sm">
                          <Pencil className="size-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(product)}
                        {...(idx === 0 ? { "data-tour": "urun-delete-btn" } : {})}
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
              Urunu Sil
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Bu urunu silmek istediginizden emin misiniz? Bu islem geri alinamaz.
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
                onClick={confirmDelete}
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
