"use client";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-6 text-8xl font-bold text-muted-foreground/20">
          :/
        </div>
        <h1 className="mb-2 text-2xl font-bold text-foreground">
          Cevrimdisi
        </h1>
        <p className="mb-6 text-muted-foreground">
          Internet baglantinizi kontrol edin ve tekrar deneyin.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Tekrar Dene
        </button>
      </div>
    </div>
  );
}
