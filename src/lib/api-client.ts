const cache = new Map<string, { data: unknown; expiry: number }>();
const CACHE_TTL = 30_000;

function getCached(key: string): unknown | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiry) { cache.delete(key); return null; }
  return entry.data;
}

function setCache(key: string, data: unknown) {
  cache.set(key, { data, expiry: Date.now() + CACHE_TTL });
}

export function clearCache(table?: string) {
  if (!table) { cache.clear(); return; }
  for (const key of cache.keys()) {
    if (key.startsWith(table)) cache.delete(key);
  }
}

async function cachedFetch<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const cached = getCached(key);
  if (cached) return cached as T;
  const data = await fetcher();
  setCache(key, data);
  return data;
}

export async function apiList(table: string) {
  return cachedFetch(`${table}:list`, async () => {
    const res = await fetch(`/api/data/${table}`);
    if (!res.ok) throw new Error(`Failed to list ${table}`);
    return res.json();
  });
}

export async function apiGet(table: string, id: string) {
  const res = await fetch(`/api/data/${table}/${id}`);
  if (!res.ok) throw new Error(`Failed to get ${table}`);
  return res.json();
}

export async function apiCreate(table: string, data: object) {
  clearCache(table);
  const res = await fetch(`/api/data/${table}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to create ${table}`);
  return res.json();
}

export async function apiUpdate(table: string, id: string, data: object) {
  clearCache(table);
  const res = await fetch(`/api/data/${table}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to update ${table}`);
  return res.json();
}

export async function apiDelete(table: string, id: string) {
  clearCache(table);
  const res = await fetch(`/api/data/${table}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Failed to delete ${table}`);
  return res.json();
}

export async function apiUpload(file: File, folder: "images" | "pdfs" = "images") {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);
  const res = await fetch("/api/upload", { method: "POST", body: formData });
  if (!res.ok) throw new Error("Upload failed");
  return res.json() as Promise<{ url: string }>;
}

export async function apiUploadMultiple(files: File[], folder: "images" | "pdfs" = "images") {
  const formData = new FormData();
  files.forEach((f) => formData.append("files", f));
  formData.append("folder", folder);
  const res = await fetch("/api/upload", { method: "POST", body: formData });
  if (!res.ok) throw new Error("Upload failed");
  return res.json() as Promise<{ urls: string[] }>;
}
