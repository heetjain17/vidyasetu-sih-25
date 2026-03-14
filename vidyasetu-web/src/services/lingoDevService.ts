import { LingoDotDevEngine } from "lingo.dev/sdk"

// Types
interface CacheEntry {
  text: string
  timestamp: number
}

interface TranslationCache {
  [key: string]: CacheEntry
}

// Cache configuration
const CACHE_KEY_PREFIX = "lingo_cache_"
const CACHE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

// In-memory cache for instant access
const memoryCache: TranslationCache = {}

// Initialize SDK (lazy)
let engine: LingoDotDevEngine | null = null

const getEngine = (): LingoDotDevEngine => {
  if (!engine) {
    const apiKey = import.meta.env.VITE_LINGODOTDEV_API_KEY
    if (!apiKey || apiKey === "your_api_key_here") {
      throw new Error(
        "VITE_LINGODOTDEV_API_KEY is not set. Please add your API key from lingo.dev to the .env file."
      )
    }
    engine = new LingoDotDevEngine({ apiKey })
  }
  return engine
}

// Generate cache key
const getCacheKey = (text: string, targetLocale: string): string => {
  // Create a simple hash from the text
  const hash = text
    .slice(0, 100)
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_]/g, "")
  return `${CACHE_KEY_PREFIX}${targetLocale}_${hash}_${text.length}`
}

// Load from localStorage
const loadFromStorage = (key: string): CacheEntry | null => {
  try {
    const stored = localStorage.getItem(key)
    if (!stored) return null

    const entry: CacheEntry = JSON.parse(stored)
    if (Date.now() - entry.timestamp > CACHE_EXPIRY_MS) {
      localStorage.removeItem(key)
      return null
    }
    return entry
  } catch {
    return null
  }
}

// Save to localStorage
const saveToStorage = (key: string, text: string): void => {
  try {
    const entry: CacheEntry = { text, timestamp: Date.now() }
    localStorage.setItem(key, JSON.stringify(entry))
    memoryCache[key] = entry
  } catch (e) {
    // Cache storage failed
  }
}

// Main translation function
export const translateText = async (
  text: string,
  targetLocale: string,
  sourceLocale: string = "en"
): Promise<string> => {
  // Skip if target is same as source or text is empty
  if (targetLocale === sourceLocale || !text.trim()) {
    return text
  }

  const cacheKey = getCacheKey(text, targetLocale)

  // Check memory cache first
  if (memoryCache[cacheKey]) {
    return memoryCache[cacheKey].text
  }

  // Check localStorage
  const storedEntry = loadFromStorage(cacheKey)
  if (storedEntry) {
    memoryCache[cacheKey] = storedEntry
    return storedEntry.text
  }

  // Call Lingo.dev API
  try {
    const lingoDev = getEngine()
    const translated = await lingoDev.localizeText(text, {
      sourceLocale,
      targetLocale,
    })

    saveToStorage(cacheKey, translated)
    return translated
  } catch (error) {
    console.error("Translation failed:", error)
    return text // Fallback to original
  }
}

// Batch translate multiple texts
export const translateBatch = async (
  texts: string[],
  targetLocale: string,
  sourceLocale: string = "en"
): Promise<string[]> => {
  if (targetLocale === sourceLocale) {
    return texts
  }

  const results: string[] = new Array(texts.length)
  const toTranslate: { index: number; text: string }[] = []

  // Check cache for each text
  for (let i = 0; i < texts.length; i++) {
    const text = texts[i]
    if (!text.trim()) {
      results[i] = text
      continue
    }

    const cacheKey = getCacheKey(text, targetLocale)

    if (memoryCache[cacheKey]) {
      results[i] = memoryCache[cacheKey].text
    } else {
      const stored = loadFromStorage(cacheKey)
      if (stored) {
        memoryCache[cacheKey] = stored
        results[i] = stored.text
      } else {
        toTranslate.push({ index: i, text })
      }
    }
  }

  // Batch translation: some cached, some to translate

  // Translate uncached texts
  if (toTranslate.length > 0) {
    try {
      const lingoDev = getEngine()

      // Translate one by one (SDK doesn't have multi-text single-locale batch)
      for (let i = 0; i < toTranslate.length; i++) {
        const { index, text } = toTranslate[i]
        const translated = await lingoDev.localizeText(text, {
          sourceLocale,
          targetLocale,
        })

        saveToStorage(getCacheKey(text, targetLocale), translated)
        results[index] = translated
      }
    } catch (error) {
      console.error("Batch translation failed:", error)
      // Fill remaining with original texts
      for (const { index, text } of toTranslate) {
        if (!results[index]) results[index] = text
      }
    }
  }

  return results
}

// Translate an object's string values
export const translateObject = async <T extends Record<string, unknown>>(
  obj: T,
  targetLocale: string,
  sourceLocale: string = "en"
): Promise<T> => {
  if (targetLocale === sourceLocale) return obj

  const cacheKey = getCacheKey(JSON.stringify(obj), targetLocale)

  // Check cache
  const stored = loadFromStorage(cacheKey)
  if (stored) {
    try {
      return JSON.parse(stored.text) as T
    } catch {
      // Invalid cache, continue to translate
    }
  }

  try {
    const lingoDev = getEngine()
    const translated = await lingoDev.localizeObject(obj, {
      sourceLocale,
      targetLocale,
    })

    saveToStorage(cacheKey, JSON.stringify(translated))
    return translated as T
  } catch (error) {
    console.error("Object translation failed:", error)
    return obj
  }
}

// Clear expired cache entries
export const clearExpiredCache = (): void => {
  const keys = Object.keys(localStorage).filter((k) => k.startsWith(CACHE_KEY_PREFIX))

  let cleared = 0
  for (const key of keys) {
    const result = loadFromStorage(key) // This auto-removes expired entries
    if (!result) cleared++
  }

  // Cleared expired entries
}

// Clear all translation cache
export const clearTranslationCache = (): void => {
  const keys = Object.keys(localStorage).filter((k) => k.startsWith(CACHE_KEY_PREFIX))

  for (const key of keys) {
    localStorage.removeItem(key)
  }

  Object.keys(memoryCache).forEach((k) => delete memoryCache[k])
  // Cleared all cache entries
}

// Get cache stats
export const getCacheStats = (): {
  memoryEntries: number
  storageEntries: number
} => {
  const storageKeys = Object.keys(localStorage).filter((k) => k.startsWith(CACHE_KEY_PREFIX))

  return {
    memoryEntries: Object.keys(memoryCache).length,
    storageEntries: storageKeys.length,
  }
}
