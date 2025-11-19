/**
 * AI response caching system
 * Uses LRU cache for in-memory caching of AI responses
 */

import { LRUCache } from 'lru-cache'
import type { AIResponse } from '../types'

// Cache options
const CACHE_OPTIONS = {
  max: 500, // Maximum 500 cached responses
  ttl: 1000 * 60 * 60 * 24, // 24 hours TTL by default
  updateAgeOnGet: true, // Update TTL on access
  updateAgeOnHas: false,
}

// Create cache instances for different operation types
const summarizeCache = new LRUCache<string, AIResponse>(CACHE_OPTIONS)
const draftCache = new LRUCache<string, AIResponse>({
  ...CACHE_OPTIONS,
  ttl: 1000 * 60 * 60, // 1 hour for drafts (less stable)
})
const repliesCache = new LRUCache<string, AIResponse>({
  ...CACHE_OPTIONS,
  ttl: 1000 * 60 * 30, // 30 minutes for smart replies
})
const analyzeCache = new LRUCache<string, AIResponse>({
  ...CACHE_OPTIONS,
  ttl: 1000 * 60 * 60 * 24 * 7, // 7 days for analysis (more stable)
})
const labelsCache = new LRUCache<string, AIResponse>({
  ...CACHE_OPTIONS,
  ttl: 1000 * 60 * 60 * 24 * 30, // 30 days for labels (very stable)
})

/**
 * Operation type for cache selection
 */
export type CacheOperation =
  | 'summarize'
  | 'draft'
  | 'improve'
  | 'tone'
  | 'complete'
  | 'analyze'
  | 'replies'
  | 'labels'
  | 'thread'

/**
 * Get appropriate cache for operation type
 */
function getCacheForOperation(operation: CacheOperation): LRUCache<string, AIResponse> {
  switch (operation) {
    case 'summarize':
    case 'thread':
      return summarizeCache
    case 'draft':
    case 'improve':
    case 'tone':
    case 'complete':
      return draftCache
    case 'replies':
      return repliesCache
    case 'analyze':
      return analyzeCache
    case 'labels':
      return labelsCache
    default:
      return summarizeCache
  }
}

/**
 * Generate cache key from request data
 */
export function generateCacheKey(operation: CacheOperation, data: any): string {
  // Create a stable string representation of the data
  const dataString = typeof data === 'string' ? data : JSON.stringify(data)

  // Use a simple hash for the cache key
  const hash = simpleHash(dataString)

  return `${operation}:${hash}`
}

/**
 * Simple hash function for cache keys
 */
function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36)
}

/**
 * Get cached response
 */
export function getCachedResponse<T = any>(
  operation: CacheOperation,
  key: string
): AIResponse<T> | undefined {
  const cache = getCacheForOperation(operation)
  const cached = cache.get(key)

  if (cached) {
    // Mark response as coming from cache
    return {
      ...cached,
      cached: true,
      timestamp: Date.now(),
    } as AIResponse<T>
  }

  return undefined
}

/**
 * Set cached response
 */
export function setCachedResponse(
  operation: CacheOperation,
  key: string,
  response: AIResponse,
  ttlMs?: number
): void {
  const cache = getCacheForOperation(operation)

  if (ttlMs) {
    cache.set(key, response, { ttl: ttlMs })
  } else {
    cache.set(key, response)
  }
}

/**
 * Clear cache for specific operation
 */
export function clearCache(operation?: CacheOperation): void {
  if (operation) {
    const cache = getCacheForOperation(operation)
    cache.clear()
  } else {
    // Clear all caches
    summarizeCache.clear()
    draftCache.clear()
    repliesCache.clear()
    analyzeCache.clear()
    labelsCache.clear()
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats(operation?: CacheOperation) {
  if (operation) {
    const cache = getCacheForOperation(operation)
    return {
      operation,
      size: cache.size,
      max: cache.max,
      hitRate: 0, // TODO: Implement hit rate tracking
    }
  }

  return {
    summarize: { size: summarizeCache.size, max: summarizeCache.max },
    draft: { size: draftCache.size, max: draftCache.max },
    replies: { size: repliesCache.size, max: repliesCache.max },
    analyze: { size: analyzeCache.size, max: analyzeCache.max },
    labels: { size: labelsCache.size, max: labelsCache.max },
  }
}

/**
 * Check if caching is enabled
 */
export function isCachingEnabled(): boolean {
  // Could be controlled by config in the future
  return true
}

/**
 * Invalidate cache entries matching a pattern
 */
export function invalidateCachePattern(operation: CacheOperation, pattern: RegExp): number {
  const cache = getCacheForOperation(operation)
  let count = 0

  for (const key of cache.keys()) {
    if (pattern.test(key)) {
      cache.delete(key)
      count++
    }
  }

  return count
}

/**
 * Prune old cache entries
 */
export function pruneCache(operation?: CacheOperation): void {
  if (operation) {
    const cache = getCacheForOperation(operation)
    cache.purgeStale()
  } else {
    summarizeCache.purgeStale()
    draftCache.purgeStale()
    repliesCache.purgeStale()
    analyzeCache.purgeStale()
    labelsCache.purgeStale()
  }
}

/**
 * Get total cache memory usage estimate (in bytes)
 */
export function getCacheMemoryUsage(): number {
  let total = 0

  for (const [key, value] of summarizeCache.entries()) {
    total += JSON.stringify({ key, value }).length
  }

  for (const [key, value] of draftCache.entries()) {
    total += JSON.stringify({ key, value }).length
  }

  for (const [key, value] of repliesCache.entries()) {
    total += JSON.stringify({ key, value }).length
  }

  for (const [key, value] of analyzeCache.entries()) {
    total += JSON.stringify({ key, value }).length
  }

  for (const [key, value] of labelsCache.entries()) {
    total += JSON.stringify({ key, value }).length
  }

  return total
}
