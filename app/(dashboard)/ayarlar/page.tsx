"use client";

import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { LogOut, User, Instagram, Shield } from "lucide-react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();

  async function handleLogout() {
    await signOut();
    router.push("/giris");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Ayarlar</h1>
        <p className="text-sm text-muted-foreground">
          Hesap ve sistem ayarlari
        </p>
      </div>

      {/* Account Info */}
      <div className="glass-card rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
            <User className="size-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Hesap Bilgileri</h2>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
            <span className="text-sm text-muted-foreground">Ad</span>
            <span className="text-sm font-medium text-foreground">
              {session?.user?.name || "-"}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
            <span className="text-sm text-muted-foreground">E-posta</span>
            <span className="text-sm font-medium text-foreground">
              {session?.user?.email || "-"}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
            <span className="text-sm text-muted-foreground">Oturum ID</span>
            <span className="text-xs font-mono text-muted-foreground">
              {session?.session?.id
                ? `${session.session.id.substring(0, 12)}...`
                : "-"}
            </span>
          </div>
        </div>
      </div>

      {/* Instagram Token */}
      <div className="glass-card rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
            <Instagram className="size-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Instagram Entegrasyonu</h2>
        </div>

        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <div className="flex items-start gap-3">
            <Shield className="mt-0.5 size-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Instagram Erisim Jetonu
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Instagram Graph API erisim jetonu, API sunucusunun ortam
                degiskenlerinde (<code className="rounded bg-muted px-1 py-0.5 text-xs">INSTAGRAM_ACCESS_TOKEN</code>)
                yapilandirilmaktadir. Jetonun suresi dolmadan once
                yenilenmesi gerekir.
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Jeton yenilemek icin Facebook Developer konsolunu kullanin.
                Uzun sureli jetonlar 60 gun gecerlidir.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Oturumu Kapat</h2>
            <p className="text-sm text-muted-foreground">
              Admin panelinden guvenli bir sekilde cikis yapin
            </p>
          </div>
          <Button
            variant="destructive"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="size-4" />
            Cikis Yap
          </Button>
        </div>
      </div>
    </div>
  );
}
