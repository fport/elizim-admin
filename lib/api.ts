const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

// ── Interfaces ──

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number; // kuruş
  deliveryTime: string | null;
  categoryId: string | null;
  tags: string | null;
  images: string | null; // JSON array string
  thumbnailUrl: string | null;
  instagramPostId: string | null;
  isActive: boolean;
  whatsappText: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  order: number;
  createdAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  excerpt: string | null;
  category: string | null;
  tags: string | null;
  imageUrl: string | null;
  locale: string;
  groupId: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InstagramPost {
  id: string;
  instagramId: string;
  accountHandle: string | null;
  mediaType: string | null;
  mediaUrl: string | null;
  thumbnailUrl: string | null;
  caption: string | null;
  permalink: string | null;
  timestamp: string | null;
  linkedProductId: string | null;
  cachedAt: string;
}

// ── Fetch Helper ──

async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = `${API_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  return res;
}

// ── Products API ──

export const productsApi = {
  async getAll(): Promise<Product[]> {
    const res = await fetchWithAuth("/api/products");
    if (!res.ok) throw new Error("Ürünler yüklenemedi");
    const data = await res.json();
    return data.products;
  },

  async getBySlug(slug: string): Promise<Product> {
    const res = await fetchWithAuth(`/api/products/${slug}`);
    if (!res.ok) throw new Error("Ürün bulunamadı");
    const data = await res.json();
    return data.product;
  },

  async create(
    data: Omit<Product, "id" | "createdAt" | "updatedAt">
  ): Promise<Product> {
    const res = await fetchWithAuth("/api/products", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Ürün oluşturulamadı");
    }
    const result = await res.json();
    return result.product;
  },

  async update(id: string, data: Partial<Product>): Promise<Product> {
    const res = await fetchWithAuth(`/api/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Ürün güncellenemedi");
    }
    const result = await res.json();
    return result.product;
  },

  async delete(id: string): Promise<void> {
    const res = await fetchWithAuth(`/api/products/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Ürün silinemedi");
  },
};

// ── Categories API ──

export const categoriesApi = {
  async getAll(): Promise<Category[]> {
    const res = await fetchWithAuth("/api/categories");
    if (!res.ok) throw new Error("Kategoriler yüklenemedi");
    const data = await res.json();
    return data.categories;
  },

  async create(
    data: Omit<Category, "id" | "createdAt">
  ): Promise<Category> {
    const res = await fetchWithAuth("/api/categories", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Kategori oluşturulamadı");
    }
    const result = await res.json();
    return result.category;
  },

  async update(id: string, data: Partial<Category>): Promise<Category> {
    const res = await fetchWithAuth(`/api/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Kategori güncellenemedi");
    }
    const result = await res.json();
    return result.category;
  },

  async delete(id: string): Promise<void> {
    const res = await fetchWithAuth(`/api/categories/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Kategori silinemedi");
  },
};

// ── Blog API ──

export const blogApi = {
  async getAllAdmin(): Promise<BlogPost[]> {
    const res = await fetchWithAuth("/api/blog/admin/all");
    if (!res.ok) throw new Error("Blog yazıları yüklenemedi");
    const data = await res.json();
    return data.posts;
  },

  async create(
    data: Omit<BlogPost, "id" | "createdAt" | "updatedAt" | "publishedAt">
  ): Promise<BlogPost> {
    const res = await fetchWithAuth("/api/blog", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Blog yazısı oluşturulamadı");
    }
    const result = await res.json();
    return result.post;
  },

  async update(id: string, data: Partial<BlogPost>): Promise<BlogPost> {
    const res = await fetchWithAuth(`/api/blog/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Blog yazısı güncellenemedi");
    }
    const result = await res.json();
    return result.post;
  },

  async delete(id: string): Promise<void> {
    const res = await fetchWithAuth(`/api/blog/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Blog yazısı silinemedi");
  },

  async generate(
    topic: string,
    category?: string,
    imageUrl?: string
  ): Promise<BlogPost[]> {
    const res = await fetchWithAuth("/api/blog/generate", {
      method: "POST",
      body: JSON.stringify({ topic, category, imageUrl }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Blog olusturulamadi");
    }
    const result = await res.json();
    return result.posts;
  },
};

// ── Upload API ──

export const uploadApi = {
  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_URL}/api/upload`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Resim yüklenemedi");
    }

    const data = await res.json();
    return data.url;
  },
};

// ── Instagram API ──

export const instagramApi = {
  async getFeed(): Promise<InstagramPost[]> {
    const res = await fetchWithAuth("/api/instagram/feed");
    if (!res.ok) throw new Error("Instagram gönderileri yüklenemedi");
    const data = await res.json();
    return data.posts;
  },

  async refresh(): Promise<{ imported: number }> {
    const res = await fetchWithAuth("/api/instagram/refresh", {
      method: "POST",
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Instagram yenilenemiyor");
    }
    const data = await res.json();
    return data;
  },

  async importPost(
    postId: string
  ): Promise<{
    title: string;
    description: string;
    images: string[];
    thumbnailUrl: string;
    instagramPostId: string;
  }> {
    const res = await fetchWithAuth("/api/instagram/import", {
      method: "POST",
      body: JSON.stringify({ instagramPostId: postId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Instagram gönderisi içe aktarılamadı");
    }
    const data = await res.json();
    return data.suggestion;
  },
};

// ── AI ──

export interface ProductType {
  key: string;
  label: string;
}

export const aiApi = {
  getProductTypes: async (): Promise<ProductType[]> => {
    const res = await fetch(`${API_URL}/api/ai/product-types`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Ürün tipleri yüklenemedi");
    const data = await res.json();
    return data.types;
  },

  generateDesign: async (
    prompt: string,
    fileName: string,
    title?: string
  ): Promise<{ success: boolean; url: string; fileName: string; key: string; designId: string }> => {
    const res = await fetch(`${API_URL}/api/ai/generate-design`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, fileName, title }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Tasarim gorseli olusturulamadi");
    }
    return res.json();
  },

  generateImage: async (
    imageFile: File,
    productType: string
  ): Promise<{ url: string; patternDescription: string; productType: string }> => {
    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("productType", productType);

    const res = await fetch(`${API_URL}/api/ai/generate-image`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Görsel oluşturulamadı");
    }
    return res.json();
  },
};

// ── Custom Designs ──

export interface CustomDesign {
  id: string;
  title: string;
  prompt: string;
  imageUrl: string | null;
  r2Key: string | null;
  occasion: string | null;
  clothing: string | null;
  description: string | null;
  price: number | null;
  isActive: boolean;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  designs: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const customDesignsApi = {
  async getAll(page = 1, limit = 20): Promise<PaginatedResponse<CustomDesign>> {
    const res = await fetchWithAuth(`/api/custom-designs/all?page=${page}&limit=${limit}`);
    if (!res.ok) throw new Error("Tasarimlar yuklenemedi");
    return res.json();
  },

  async create(data: Record<string, unknown>): Promise<CustomDesign> {
    const res = await fetchWithAuth("/api/custom-designs", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Tasarim olusturulamadi");
    }
    const result = await res.json();
    return result.design;
  },

  async update(id: string, data: Record<string, unknown>): Promise<CustomDesign> {
    const res = await fetchWithAuth(`/api/custom-designs/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Tasarim guncellenemedi");
    }
    const result = await res.json();
    return result.design;
  },

  async delete(id: string): Promise<void> {
    const res = await fetchWithAuth(`/api/custom-designs/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Tasarim silinemedi");
  },
};

// ── IP Geolocation ──

export interface GeoLocation {
  ip: string;
  city: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
}

const geoCache = new Map<string, GeoLocation>();

export async function getIpLocation(ip: string): Promise<GeoLocation | null> {
  if (!ip || ip === "127.0.0.1" || ip === "::1" || ip === "localhost") {
    return { ip, city: "Yerel", region: "", country: "", lat: 0, lon: 0 };
  }

  if (geoCache.has(ip)) return geoCache.get(ip)!;

  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=query,city,regionName,country,lat,lon`);
    if (!res.ok) return null;
    const data = await res.json();
    const geo: GeoLocation = {
      ip: data.query,
      city: data.city || "Bilinmiyor",
      region: data.regionName || "",
      country: data.country || "",
      lat: data.lat || 0,
      lon: data.lon || 0,
    };
    geoCache.set(ip, geo);
    return geo;
  } catch {
    return null;
  }
}

// ── Patterns ──

export interface Pattern {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  categoryId: string | null;
  tags: string | null;
  previewImageUrl: string | null;
  images: string | null;
  formats: string;
  difficulty: string | null;
  stitchCount: number | null;
  dimensions: string | null;
  colorCount: number | null;
  isActive: boolean;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
}

export const patternsApi = {
  async getAll(): Promise<Pattern[]> {
    const res = await fetchWithAuth("/api/patterns");
    if (!res.ok) throw new Error("Desenler yuklenemedi");
    const data = await res.json();
    return data.patterns;
  },

  async create(data: Record<string, unknown>): Promise<Pattern> {
    const res = await fetchWithAuth("/api/patterns", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Desen eklenemedi");
    }
    const result = await res.json();
    return result.pattern;
  },

  async update(id: string, data: Record<string, unknown>): Promise<Pattern> {
    const res = await fetchWithAuth(`/api/patterns/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Desen guncellenemedi");
    }
    const result = await res.json();
    return result.pattern;
  },

  async delete(id: string): Promise<void> {
    const res = await fetchWithAuth(`/api/patterns/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Desen silinemedi");
  },
};
