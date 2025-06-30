import { useEffect, useCallback } from 'react'
import { AppKeyboard } from "./app-keyboard"
import { WordInput } from "./app-word-input"
import { WORD_SIZE } from "~/types/wordle"
import { useActionListener } from '~/hooks/use-action-listener'
import { useWordStore } from '~/stores/word-slice'

enum KeyboardAction {
  KEY_PRESS = 'KEY_PRESS',
  DELETE_KEY = 'DELETE_KEY',
  SUBMIT_WORD = 'SUBMIT_WORD',
}

export const Wordle = () => {
  const { emit } = useActionListener()
  const { clearError, error } = useWordStore()

  // Handle physical keyboard input
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Prevent default behavior for game controls
    if (['Enter', 'Backspace', 'Delete'].includes(event.key) || /^[A-Za-z]$/.test(event.key)) {
      event.preventDefault()
    }

    try {
      if (event.key === 'Enter') {
        emit(KeyboardAction.SUBMIT_WORD, null)
      } else if (event.key === 'Backspace' || event.key === 'Delete') {
        emit(KeyboardAction.DELETE_KEY, null)
      } else if (/^[A-Za-z]$/.test(event.key)) {
        emit(KeyboardAction.KEY_PRESS, event.key.toUpperCase())
      }
    } catch (error) {
      console.error('Error handling keyboard input:', error)
    }
  }, [emit])

  // Clear error when user starts typing
  const handleErrorClear = useCallback(() => {
    if (error) {
      clearError()
    }
  }, [error, clearError])

  useEffect(() => {
    // Add keyboard event listener
    document.addEventListener('keydown', handleKeyDown)

    // Clear error on any user interaction
    document.addEventListener('click', handleErrorClear)
    document.addEventListener('keydown', handleErrorClear)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('click', handleErrorClear)
      document.removeEventListener('keydown', handleErrorClear)
    }
  }, [handleKeyDown, handleErrorClear])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-4">
      <div className="text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-800 dark:text-gray-200 mb-2">
          WORDLE
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
          Guess the {WORD_SIZE}-letter word
        </p>
      </div>

      <div className="flex flex-col items-center gap-8">
        <WordInput size={WORD_SIZE} />
        <AppKeyboard />
      </div>

      <div className="text-center text-xs text-gray-500 dark:text-gray-400 max-w-md">
        <p>Use your keyboard or click the buttons above</p>
        <p>Press Enter to submit • Backspace to delete</p>
      </div>
    </div>
  )
}