"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  RefreshCw,
  Loader2,
  ExternalLink,
  ImageIcon,
  Video,
  Images,
  Download,
} from "lucide-react";
import { instagramApi } from "@/lib/api";
import { Button } from "@/components/ui/button";

const mediaTypeIcons: Record<string, React.ElementType> = {
  IMAGE: ImageIcon,
  VIDEO: Video,
  CAROUSEL_ALBUM: Images,
};

export default function InstagramPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [importingId, setImportingId] = useState<string | null>(null);

  const { data: posts, isLoading } = useQuery({
    queryKey: ["instagram-feed"],
    queryFn: instagramApi.getFeed,
  });

  const refreshMutation = useMutation({
    mutationFn: instagramApi.refresh,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["instagram-feed"] });
      alert(`${data.imported} gonderi basariyla yenilendi.`);
    },
    onError: (err: Error) => {
      alert(`Hata: ${err.message}`);
    },
  });

  async function handleImport(postId: string) {
    setImportingId(postId);

    try {
      const suggestion = await instagramApi.importPost(postId);

      // Navigate to new product page with pre-filled data
      const params = new URLSearchParams();
      if (suggestion.title) params.set("title", suggestion.title);
      if (suggestion.description) params.set("description", suggestion.description);
      if (suggestion.images?.length) params.set("images", suggestion.images.join(","));
      if (suggestion.thumbnailUrl) params.set("thumbnailUrl", suggestion.thumbnailUrl);
      if (suggestion.instagramPostId) params.set("instagramPostId", suggestion.instagramPostId);

      router.push(`/urunler/yeni?${params.toString()}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Ice aktarma basarisiz");
    } finally {
      setImportingId(null);
    }
  }

  function truncateCaption(caption: string | null, maxLen: number = 100): string {
    if (!caption) return "";
    if (caption.length <= maxLen) return caption;
    return caption.substring(0, maxLen) + "...";
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Instagram</h1>
          <p className="text-sm text-muted-foreground">
            Instagram gonderilerini yonetin ve urun olarak ice aktarin
          </p>
        </div>
        <Button
          onClick={() => refreshMutation.mutate()}
          disabled={refreshMutation.isPending}
          className="gap-2"
        >
          {refreshMutation.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <RefreshCw className="size-4" />
          )}
          Besleyi Yenile
        </Button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : !posts?.length ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border py-20">
          <ImageIcon className="mb-4 size-12 text-muted-foreground" />
          <p className="text-muted-foreground">
            Henuz Instagram gonderisi yok
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Besleyi yenileyerek Instagram gonderilerinizi cekebilirsiniz
          </p>
          <Button
            variant="outline"
            className="mt-4 gap-2"
            onClick={() => refreshMutation.mutate()}
            disabled={refreshMutation.isPending}
          >
            <RefreshCw className="size-4" />
            Besleyi Yenile
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => {
            const MediaIcon = mediaTypeIcons[post.mediaType || "IMAGE"] || ImageIcon;
            const imageUrl = post.thumbnailUrl || post.mediaUrl;

            return (
              <div
                key={post.id}
                className="glass-card overflow-hidden rounded-xl"
              >
                {/* Image */}
                <div className="relative aspect-square bg-muted">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={truncateCaption(post.caption, 50) || "Instagram post"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ImageIcon className="size-12 text-muted-foreground" />
                    </div>
                  )}

                  {/* Media type badge */}
                  <div className="absolute right-2 top-2 rounded-lg bg-black/60 p-1.5">
                    <MediaIcon className="size-4 text-white" />
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <p className="line-clamp-3 text-sm text-foreground">
                    {truncateCaption(post.caption, 150) || "Aciklama yok"}
                  </p>

                  {post.timestamp && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {new Date(post.timestamp).toLocaleDateString("tr-TR")}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="mt-3 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1.5"
                      onClick={() => handleImport(post.id)}
                      disabled={importingId === post.id}
                    >
                      {importingId === post.id ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Download className="size-3.5" />
                      )}
                      Urun Olarak Aktar
                    </Button>
                    {post.permalink && (
                      <a
                        href={post.permalink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="ghost" size="icon-sm">
                          <ExternalLink className="size-4" />
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
