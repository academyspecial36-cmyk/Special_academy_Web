"use client";

import { useRef, useState, useEffect, useCallback } from "react";

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const clientCache = new Map<string, CacheEntry<unknown>>();
const TTL = 30000;

export function useFetch<T = unknown>(url: string | null, options?: { ttl?: number }) {
  const ttl = options?.ttl ?? TTL;
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const abortRef = useRef<AbortController | null>(null);

  const execute = useCallback(async () => {
    if (!url) {
      setData(null);
      setLoading(false);
      return;
    }

    const cached = clientCache.get(url);
    if (cached && Date.now() < cached.expiresAt) {
      setData(cached.data as T);
      setLoading(false);
      return;
    }

    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(url, { signal: abortRef.current.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      clientCache.set(url, { data: json, expiresAt: Date.now() + ttl });
      setData(json as T);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }, [url, ttl]);

  useEffect(() => {
    execute();
    return () => abortRef.current?.abort();
  }, [execute]);

  const mutate = useCallback((optimisticData: T) => {
    if (url) {
      clientCache.set(url, { data: optimisticData, expiresAt: Date.now() + ttl });
      setData(optimisticData);
    }
  }, [url, ttl]);

  const revalidate = useCallback(() => {
    if (url) clientCache.delete(url);
    execute();
  }, [url, execute]);

  return { data, error, loading, mutate, revalidate };
}

export function clearCache(pattern?: string) {
  if (pattern) {
    for (const key of clientCache.keys()) {
      if (key.includes(pattern)) clientCache.delete(key);
    }
  } else {
    clientCache.clear();
  }
}
