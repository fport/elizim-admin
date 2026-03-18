"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { blogApi } from "@/lib/api";
import { Button } from "@/components/ui/button";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export default function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [locale, setLocale] = useState("tr");
  const [isPublished, setIsPublished] = useState(false);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  const { data: posts } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: blogApi.getAllAdmin,
  });

  const post = posts?.find((p) => p.id === id);

  useEffect(() => {
    if (post && !loaded) {
      setTitle(post.title);
      setSlug(post.slug);
      setExcerpt(post.excerpt || "");
      setContent(post.content || "");
      setCategory(post.category || "");
      setTags(post.tags || "");
      setImageUrl(post.imageUrl || "");
      setLocale(post.locale);
      setIsPublished(post.isPublished);
      setLoaded(true);
    }
  }, [post, loaded]);

  const updateMutation = useMutation({
    mutationFn: (data: Parameters<typeof blogApi.update>[1]) =>
      blogApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      router.push("/blog");
    },
    onError: (err: Error) => setError(err.message),
  });

  function handleTitleChange(value: string) {
    setTitle(value);
    setSlug(slugify(value));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Baslik gerekli");
      return;
    }

    if (!content.trim()) {
      setError("Icerik gerekli");
      return;
    }

    updateMutation.mutate({
      title: title.trim(),
      slug: slug.trim() || slugify(title),
      content: content.trim(),
      excerpt: excerpt.trim() || null,
      category: category.trim() || null,
      tags: tags.trim() || null,
      imageUrl: imageUrl.trim() || null,
      locale,
      isPublished,
    });
  }

  if (!post && posts) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg font-semibold text-foreground">Yazi bulunamadi</p>
        <Link href="/blog" className="mt-4">
          <Button variant="outline">Blog Listesine Don</Button>
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
        <Link href="/blog">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="size-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Yaziyi Duzenle</h1>
          <p className="text-sm text-muted-foreground">{post?.title}</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
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
              placeholder="Blog yazisi basligi"
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
              placeholder="blog-yazisi-slug"
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Ozet
            </label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Kisa ozet"
              rows={2}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20 resize-none"
            />
          </div>
        </div>

        {/* Content */}
        <div className="glass-card rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Icerik (Markdown)</h2>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Blog yazisinin icerigi (Markdown destekli)..."
            rows={16}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20 resize-y"
          />
        </div>

        {/* Meta */}
        <div className="glass-card rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Meta Bilgiler</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Kategori
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Rehber, Bakim, Haberler"
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Dil
              </label>
              <select
                value={locale}
                onChange={(e) => setLocale(e.target.value)}
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
              >
                <option value="tr">Turkce</option>
                <option value="en">English</option>
                <option value="ar">Arabic</option>
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
              placeholder="el isleri, dantel, geleneksel"
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Gorsel URL
            </label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
            />
          </div>
        </div>

        {/* Publish Toggle */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Yayinla</h2>
              <p className="text-sm text-muted-foreground">
                {isPublished
                  ? "Yazi yayinda"
                  : "Yazi taslak olarak kaydedilecek"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsPublished(!isPublished)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isPublished ? "bg-primary" : "bg-muted"
              }`}
            >
              <span
                className={`inline-block size-4 transform rounded-full bg-white transition-transform ${
                  isPublished ? "translate-x-6" : "translate-x-1"
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
          <Link href="/blog">
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
