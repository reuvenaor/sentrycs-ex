import { useCallback, useEffect, useRef } from 'react'
import { ActionListenerManager, type ActionListener } from '~/lib/action-listener'

// Hook that provides access to the singleton action listener
export function useActionListener() {
  const actionListenerRef = useRef<ActionListenerManager>(ActionListenerManager.getInstance())
  const unsubscribersRef = useRef<Map<string, () => void>>(new Map())

  const registerListener = useCallback(<T = any>(
    action: string,
    listener: ActionListener<T>
  ): (() => void) => {
    const unsubscribe = actionListenerRef.current.registerListener(action, listener)

    // Store unsubscriber for cleanup
    const key = `${action}_${Date.now()}_${Math.random()}`
    unsubscribersRef.current.set(key, unsubscribe)

    // Return unsubscriber that also removes from our tracking
    return () => {
      unsubscribe()
      unsubscribersRef.current.delete(key)
    }
  }, [])

  const removeListener = useCallback(<T = any>(
    action: string,
    listener: ActionListener<T>
  ): boolean => {
    return actionListenerRef.current.removeListener(action, listener)
  }, [])

  const removeAllListeners = useCallback((action: string): boolean => {
    return actionListenerRef.current.removeAllListeners(action)
  }, [])

  const emit = useCallback(<T = any>(action: string, data: T): void => {
    actionListenerRef.current.emit(action, data)
  }, [])

  const getRegisteredActions = useCallback((): string[] => {
    return actionListenerRef.current.getRegisteredActions()
  }, [])

  const getListenerCount = useCallback((action: string): number => {
    return actionListenerRef.current.getListenerCount(action)
  }, [])

  // Cleanup all listeners registered through this hook instance
  useEffect(() => {
    return () => {
      // Cleanup all unsubscribers tracked by this hook instance
      unsubscribersRef.current.forEach(unsubscribe => {
        try {
          unsubscribe()
        } catch (error) {
          console.error('Error during cleanup:', error)
        }
      })
      unsubscribersRef.current.clear()
    }
  }, [])

  return {
    registerListener,
    removeListener,
    removeAllListeners,
    emit,
    getRegisteredActions,
    getListenerCount
  }
} 