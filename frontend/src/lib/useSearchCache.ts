'use client';

import { useRef, useCallback } from 'react';
import { searchApi } from '@/lib/api';
import { SearchResults } from '@/types';

interface CacheEntry {
    data: SearchResults;
    timestamp: number;
}

const CACHE_MAX_SIZE = 50;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export function useSearchCache() {
    const cacheRef = useRef<Map<string, CacheEntry>>(new Map());

    const evictStale = useCallback(() => {
        const now = Date.now();
        const cache = cacheRef.current;
        cache.forEach((entry, key) => {
            if (now - entry.timestamp > CACHE_TTL_MS) {
                cache.delete(key);
            }
        });
    }, []);

    const search = useCallback(async (query: string): Promise<SearchResults> => {
        const key = query.toLowerCase().trim();
        const cache = cacheRef.current;

        // Check cache first
        const cached = cache.get(key);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
            return cached.data;
        }

        // Call API
        const response = await searchApi.search(query);
        const data: SearchResults = response.data.data;

        // Evict stale entries and enforce max size (LRU-style)
        evictStale();
        if (cache.size >= CACHE_MAX_SIZE) {
            const oldestKey = cache.keys().next().value;
            if (oldestKey) cache.delete(oldestKey);
        }

        // Store in cache
        cache.set(key, { data, timestamp: Date.now() });

        return data;
    }, [evictStale]);

    const clearCache = useCallback(() => {
        cacheRef.current.clear();
    }, []);

    return { search, clearCache };
}
