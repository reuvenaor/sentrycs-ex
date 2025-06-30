export type ValidationStatus = 'idle' | 'valid' | 'invalid'

export const WORD_SIZE = 5;

// Enhanced types for better type safety
export interface GameState {
  word: string[]
  validationStatus: ValidationStatus
  isLoading: boolean
  error: string | null
  attempts: number
  maxAttempts: number
}

export interface KeyboardActionPayload<T = any> {
  type: string
  data: T
  timestamp: number
}

export interface WordValidationResult {
  isValid: boolean
  error?: string
  source: 'api' | 'cache' | 'local'
}

export interface GameConfig {
  wordSize: number
  maxAttempts: number
  apiTimeout: number
  enableKeyboard: boolean
  enableCache: boolean
}

// Utility types
export type WordArray = string[]
export type GameAction = 'KEY_PRESS' | 'DELETE_KEY' | 'SUBMIT_WORD' | 'RESET_GAME'

// Constants
export const DEFAULT_GAME_CONFIG: GameConfig = {
  wordSize: WORD_SIZE,
  maxAttempts: 6,
  apiTimeout: 5000,
  enableKeyboard: true,
  enableCache: true,
}

// Error types
export class WordValidationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly retryable: boolean = false
  ) {
    super(message)
    this.name = 'WordValidationError'
  }
}

export class NetworkError extends WordValidationError {
  constructor(message: string = 'Network error - please check your connection') {
    super(message, 'NETWORK_ERROR', true)
  }
}

export class TimeoutError extends WordValidationError {
  constructor(message: string = 'Request timeout - please try again') {
    super(message, 'TIMEOUT_ERROR', true)
  }
}

export class InvalidWordError extends WordValidationError {
  constructor(message: string = 'Word not found in dictionary') {
    super(message, 'INVALID_WORD', false)
  }
}
