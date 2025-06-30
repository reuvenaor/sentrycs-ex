import { create } from 'zustand'
import { WORD_SIZE, type ValidationStatus, DEFAULT_GAME_CONFIG } from '~/types/wordle'
import {
  isValidKey,
  isWordComplete,
  sanitizeKey,
  sanitizeWord,
  addCharacterToWord,
  removeLastCharacter,
  createEmptyWord,
  validateWordWithAPI
} from '~/lib/wordle-utils'

interface WordState {
  word: string[]
  validationStatus: ValidationStatus
  isLoading: boolean
  error: string | null
  handleKeyPress: (key: string) => void
  handleDelete: () => void
  handleSubmit: () => Promise<void>
  reset: () => void
  clearError: () => void
}

const initialState = {
  word: createEmptyWord(WORD_SIZE),
  validationStatus: 'idle' as ValidationStatus,
  isLoading: false,
  error: null,
}

export const useWordStore = create<WordState>((set, get) => ({
  ...initialState,

  handleKeyPress: (key: string) => {
    try {
      if (!key || !isValidKey(key)) {
        console.warn('Invalid key pressed:', key)
        return
      }

      const { word, isLoading } = get()

      if (isLoading) {
        console.warn('Cannot input while validating word')
        return
      }

      const newWord = addCharacterToWord(word, key)

      set({
        word: newWord,
        validationStatus: 'idle',
        error: null
      })
    } catch (error) {
      console.error('Error handling key press:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error processing key input'
      set({ error: errorMessage })
    }
  },

  handleDelete: () => {
    try {
      const { word, isLoading } = get()

      if (isLoading) {
        console.warn('Cannot delete while validating word')
        return
      }

      const newWord = removeLastCharacter(word)

      set({
        word: newWord,
        validationStatus: 'idle',
        error: null
      })
    } catch (error) {
      console.error('Error handling delete:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error deleting character'
      set({ error: errorMessage })
    }
  },

  handleSubmit: async () => {
    const { word, isLoading } = get()

    if (isLoading) {
      console.warn('Already validating word')
      return
    }

    try {
      set({ isLoading: true, error: null })

      if (!isWordComplete(word, WORD_SIZE)) {
        set({
          validationStatus: 'invalid',
          isLoading: false,
          error: 'Please complete the word before submitting'
        })
        return
      }

      const wordToCheck = sanitizeWord(word)
      const result = await validateWordWithAPI(wordToCheck, DEFAULT_GAME_CONFIG)

      set({
        validationStatus: result.isValid ? 'valid' : 'invalid',
        isLoading: false,
        error: result.error || null
      })

    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Unknown error occurred while validating word'

      console.error('Error validating word:', error)
      set({
        validationStatus: 'invalid',
        isLoading: false,
        error: errorMessage
      })
    }
  },

  reset: () => {
    set(initialState)
  },

  clearError: () => {
    set({ error: null })
  },
}))

// Re-export utilities for convenience
export { isValidKey, isWordComplete, sanitizeKey } 