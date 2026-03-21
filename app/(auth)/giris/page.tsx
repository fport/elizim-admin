"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn.email({
        email,
        password,
      });

      if (result.error) {
        setError(
          result.error.message ||
            "Giris basarisiz. Lutfen bilgilerinizi kontrol edin."
        );
        setLoading(false);
        return;
      }

      router.push(redirect);
    } catch {
      setError("Bir hata olustu. Lutfen tekrar deneyin.");
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="glass-card rounded-3xl p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10">
            <span className="text-xl font-bold text-primary">E</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Elizim Admin
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Yonetim paneline giris yapin
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              E-posta
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@elizim.art"
              required
              autoComplete="email"
              className="h-10 w-full text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Sifre
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              required
              autoComplete="current-password"
              className="h-10 w-full text-sm"
            />
          </div>

          {error && (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button type="submit" disabled={loading} className="h-10 w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Giris yapiliyor...
              </>
            ) : (
              "Giris Yap"
            )}
          </Button>
        </form>
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground/60">
        Elizim.art Yonetim Paneli
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Suspense
        fallback={
          <div className="flex items-center justify-center">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
