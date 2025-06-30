import { useEffect, useCallback, useRef } from 'react'
import { KeyboardUI } from '~/components/wordle/ui-keyboard'
import { useActionListener } from '~/hooks/use-action-listener'
import { useWordStore } from '~/stores/word-slice'

enum KeyboardAction {
  KEY_PRESS = 'KEY_PRESS',
  DELETE_KEY = 'DELETE_KEY',
  SUBMIT_WORD = 'SUBMIT_WORD',
}

export function AppKeyboard() {
  const { registerListener, emit } = useActionListener()
  const { handleKeyPress, handleDelete, handleSubmit } = useWordStore()
  const unsubscribersRef = useRef<(() => void)[]>([])

  useEffect(() => {
    // Register all listeners and store unsubscribers
    const unsubscribers = [
      registerListener(KeyboardAction.KEY_PRESS, handleKeyPress),
      registerListener(KeyboardAction.DELETE_KEY, handleDelete),
      registerListener(KeyboardAction.SUBMIT_WORD, handleSubmit)
    ]

    unsubscribersRef.current = unsubscribers

    // Cleanup function
    return () => {
      unsubscribers.forEach(unsubscribe => {
        try {
          unsubscribe()
        } catch (error) {
          console.error('Error unsubscribing from keyboard action:', error)
        }
      })
      unsubscribersRef.current = []
    }
  }, [registerListener, handleKeyPress, handleDelete, handleSubmit])

  const onKeyPress = useCallback(
    (key: string) => {
      try {
        // Validate key input
        if (!key || typeof key !== 'string' || key.length !== 1) {
          console.warn('Invalid key input:', key)
          return
        }

        // Only allow alphabetic characters
        if (!/^[A-Za-z]$/.test(key)) {
          console.warn('Only alphabetic characters are allowed:', key)
          return
        }

        emit(KeyboardAction.KEY_PRESS, key.toUpperCase())
      } catch (error) {
        console.error('Error emitting key press:', error)
      }
    },
    [emit],
  )

  const onSubmit = useCallback(() => {
    try {
      emit(KeyboardAction.SUBMIT_WORD, null)
    } catch (error) {
      console.error('Error emitting submit action:', error)
    }
  }, [emit])

  const onDelete = useCallback(() => {
    try {
      emit(KeyboardAction.DELETE_KEY, null)
    } catch (error) {
      console.error('Error emitting delete action:', error)
    }
  }, [emit])

  return (
    <KeyboardUI
      onKeyPress={onKeyPress}
      onSubmit={onSubmit}
      onDelete={onDelete}
    />
  )
}
