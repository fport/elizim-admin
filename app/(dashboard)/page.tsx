"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Package,
  FolderOpen,
  FileText,
  Instagram,
  Plus,
  RefreshCw,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { productsApi, categoriesApi, blogApi, instagramApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { LoginActivity } from "@/components/login-activity";

function StatCard({
  title,
  value,
  icon: Icon,
  loading,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  loading: boolean;
}) {
  return (
    <div className="glass-card rounded-3xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-1 text-3xl font-bold text-foreground">
            {loading ? "-" : value}
          </p>
        </div>
        <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10">
          <Icon className="size-6 text-primary" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: session } = useSession();

  const { data: products, isLoading: loadingProducts } = useQuery({
    queryKey: ["products"],
    queryFn: productsApi.getAll,
  });

  const { data: categories, isLoading: loadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: categoriesApi.getAll,
  });

  const { data: posts, isLoading: loadingPosts } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: blogApi.getAllAdmin,
  });

  const { data: igPosts, isLoading: loadingIg } = useQuery({
    queryKey: ["instagram-feed"],
    queryFn: instagramApi.getFeed,
  });

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Hos geldiniz{session?.user?.name ? `, ${session.user.name}` : ""}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Elizim.art yonetim paneline hosgeldiniz. Asagida genel bir bakis bulabilirsiniz.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-tour="stats-grid">
        <StatCard
          title="Toplam Urun"
          value={products?.length ?? 0}
          icon={Package}
          loading={loadingProducts}
        />
        <StatCard
          title="Kategoriler"
          value={categories?.length ?? 0}
          icon={FolderOpen}
          loading={loadingCategories}
        />
        <StatCard
          title="Blog Yazilari"
          value={posts?.length ?? 0}
          icon={FileText}
          loading={loadingPosts}
        />
        <StatCard
          title="Instagram"
          value={igPosts?.length ?? 0}
          icon={Instagram}
          loading={loadingIg}
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Hizli Islemler
        </h2>
        <div className="flex flex-wrap gap-3" data-tour="quick-actions">
          <Link href="/urunler/yeni">
            <Button variant="outline" size="lg" className="gap-2">
              <Plus className="size-4" />
              Yeni Urun Ekle
            </Button>
          </Link>
          <Link href="/blog/yeni">
            <Button variant="outline" size="lg" className="gap-2">
              <Plus className="size-4" />
              Yeni Blog Yazisi
            </Button>
          </Link>
          <Link href="/instagram">
            <Button variant="outline" size="lg" className="gap-2">
              <RefreshCw className="size-4" />
              Instagram Yenile
            </Button>
          </Link>
        </div>
      </div>

      {/* Login Activity */}
      <LoginActivity />
    </div>
  );
}
