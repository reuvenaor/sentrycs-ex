import {
  WORD_SIZE,
  type WordArray,
  type WordValidationResult,
  type GameConfig,
  DEFAULT_GAME_CONFIG,
  WordValidationError,
  NetworkError,
  TimeoutError,
  InvalidWordError
} from '~/types/wordle'

// Word validation utilities
export const isValidKey = (key: string): boolean => {
  return typeof key === 'string' && /^[A-Za-z]$/.test(key)
}

export const isWordComplete = (word: WordArray, size: number = WORD_SIZE): boolean => {
  return word.length === size && word.every(char => char !== '' && isValidKey(char))
}

export const sanitizeKey = (key: string): string => {
  return key.toUpperCase().trim()
}

export const sanitizeWord = (word: WordArray): string => {
  return word.map(char => sanitizeKey(char)).join('')
}

// Game state utilities
export const createEmptyWord = (size: number = WORD_SIZE): WordArray => {
  return Array(size).fill('')
}

export const addCharacterToWord = (word: WordArray, char: string): WordArray => {
  if (!isValidKey(char)) {
    throw new Error(`Invalid character: ${char}`)
  }

  const newWord = [...word]
  const emptyIndex = newWord.findIndex(c => c === '')

  if (emptyIndex !== -1) {
    newWord[emptyIndex] = sanitizeKey(char)
  }

  return newWord
}

export const removeLastCharacter = (word: WordArray): WordArray => {
  const newWord = [...word]

  for (let i = newWord.length - 1; i >= 0; i--) {
    if (newWord[i] !== '') {
      newWord[i] = ''
      break
    }
  }

  return newWord
}

// Cache management for word validation
class WordValidationCache {
  private cache = new Map<string, boolean>()
  private maxSize: number
  private enabled: boolean

  constructor(maxSize: number = 1000, enabled: boolean = true) {
    this.maxSize = maxSize
    this.enabled = enabled
  }

  get(word: string): boolean | undefined {
    if (!this.enabled) return undefined
    return this.cache.get(word.toLowerCase())
  }

  set(word: string, isValid: boolean): void {
    if (!this.enabled) return

    // Simple LRU: remove oldest entry if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey !== undefined) {
        this.cache.delete(firstKey)
      }
    }

    this.cache.set(word.toLowerCase(), isValid)
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }
}

// Singleton cache instance
const validationCache = new WordValidationCache()

// Enhanced word validation with caching and better error handling
export const validateWordWithAPI = async (
  word: string,
  config: GameConfig = DEFAULT_GAME_CONFIG
): Promise<WordValidationResult> => {
  if (!word || word.length !== config.wordSize) {
    throw new WordValidationError('Invalid word length', 'INVALID_LENGTH')
  }

  const cleanWord = word.toLowerCase().trim()

  // Check cache first
  if (config.enableCache) {
    const cachedResult = validationCache.get(cleanWord)
    if (cachedResult !== undefined) {
      return {
        isValid: cachedResult,
        source: 'cache'
      }
    }
  }

  // Create abort controller for timeout
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), config.apiTimeout)

  try {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${cleanWord}`,
      {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Wordle-Game/1.0',
        },
        cache: 'default', // Enable browser caching
      }
    )

    clearTimeout(timeoutId)

    let isValid: boolean

    if (response.status === 404) {
      isValid = false
    } else if (!response.ok) {
      throw new WordValidationError(
        `API request failed with status: ${response.status}`,
        'API_ERROR',
        true
      )
    } else {
      const data = await response.json()
      isValid = Array.isArray(data) && data.length > 0
    }

    // Cache the result
    if (config.enableCache) {
      validationCache.set(cleanWord, isValid)
    }

    return {
      isValid,
      source: 'api',
      error: isValid ? undefined : 'Word not found in dictionary'
    }

  } catch (error) {
    clearTimeout(timeoutId)

    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new TimeoutError()
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new NetworkError()
    }

    if (error instanceof WordValidationError) {
      throw error
    }

    throw new WordValidationError(
      'Unknown error occurred while validating word',
      'UNKNOWN_ERROR',
      true
    )
  }
}

// Keyboard event utilities
export const isGameKey = (key: string): boolean => {
  return ['Enter', 'Backspace', 'Delete'].includes(key) || /^[A-Za-z]$/.test(key)
}

export const getActionFromKey = (key: string): string | null => {
  if (key === 'Enter') return 'SUBMIT_WORD'
  if (key === 'Backspace' || key === 'Delete') return 'DELETE_KEY'
  if (/^[A-Za-z]$/.test(key)) return 'KEY_PRESS'
  return null
}

// Performance utilities
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean = false

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Export cache for testing/debugging
export { validationCache } 