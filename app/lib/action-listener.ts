export type ActionListener<T = any> = (data: T) => void

export type ActionMap = Map<string, Set<ActionListener>>

export class ActionListenerManager {
  private static instance: ActionListenerManager | null = null
  private listeners: ActionMap = new Map()

  private constructor() { }

  // Singleton pattern - ensures only one instance exists
  public static getInstance(): ActionListenerManager {
    if (!ActionListenerManager.instance) {
      ActionListenerManager.instance = new ActionListenerManager()
    }
    return ActionListenerManager.instance
  }

  // Register a listener for a specific action
  public registerListener<T = any>(action: string, listener: ActionListener<T>): () => void {
    if (!action || typeof action !== 'string') {
      throw new Error('Action must be a non-empty string')
    }

    if (typeof listener !== 'function') {
      throw new Error('Listener must be a function')
    }

    if (!this.listeners.has(action)) {
      this.listeners.set(action, new Set())
    }

    const actionListeners = this.listeners.get(action)!
    actionListeners.add(listener)

    // Return unsubscribe function
    return () => this.removeListener(action, listener)
  }

  // Remove a specific listener from an action
  public removeListener<T = any>(action: string, listener: ActionListener<T>): boolean {
    const actionListeners = this.listeners.get(action)
    if (!actionListeners) {
      return false
    }

    const removed = actionListeners.delete(listener)

    // Clean up empty action entries
    if (actionListeners.size === 0) {
      this.listeners.delete(action)
    }

    return removed
  }

  // Remove all listeners for an action
  public removeAllListeners(action: string): boolean {
    return this.listeners.delete(action)
  }

  // Emit an event to all registered listeners
  public emit<T = any>(action: string, data: T): void {
    if (!action || typeof action !== 'string') {
      throw new Error('Action must be a non-empty string')
    }

    const actionListeners = this.listeners.get(action)
    if (!actionListeners || actionListeners.size === 0) {
      console.warn(`No listeners registered for action: "${action}"`)
      return
    }

    // Execute listeners safely
    actionListeners.forEach(listener => {
      try {
        listener(data)
      } catch (error) {
        console.error(`Error executing listener for action "${action}":`, error)
      }
    })
  }

  // Get all registered actions
  public getRegisteredActions(): string[] {
    return Array.from(this.listeners.keys())
  }

  // Get listener count for an action
  public getListenerCount(action: string): number {
    return this.listeners.get(action)?.size ?? 0
  }

  // Clear all listeners (for cleanup/testing)
  public clear(): void {
    this.listeners.clear()
  }

  // Reset singleton instance (for testing)
  public static reset(): void {
    ActionListenerManager.instance = null
  }
}

// Export singleton instance for convenience
export const actionListener = ActionListenerManager.getInstance()