const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

function extractR2Key(url: string): string | null {
  // Local: http://localhost:8787/api/upload/products/ai-xxx.png
  const localMatch = url.match(/\/api\/upload\/(.+)$/);
  if (localMatch) return localMatch[1];

  // Production: https://images.elizim.art/products/ai-xxx.png
  const prodMatch = url.match(/images\.elizim\.art\/(.+)$/);
  if (prodMatch) return prodMatch[1];

  // R2 dev: https://pub-xxx.r2.dev/products/ai-xxx.png
  const r2Match = url.match(/r2\.dev\/(.+)$/);
  if (r2Match) return r2Match[1];

  return null;
}

function isMobile(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

export async function downloadImage(
  url: string,
  suggestedName?: string
): Promise<void> {
  const r2Key = extractR2Key(url);

  if (r2Key) {
    const downloadUrl = `${API_URL}/api/upload/download/${r2Key}`;

    if (isMobile()) {
      window.location.href = downloadUrl;
      return;
    }

    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = suggestedName || `elizim-${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return;
  }

  // Fallback for non-R2 URLs
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download =
      suggestedName ||
      `elizim-${Date.now()}.${blob.type.includes("png") ? "png" : "jpg"}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  } catch {
    window.open(url, "_blank");
  }
}
