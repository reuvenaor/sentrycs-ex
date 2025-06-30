import { memo, useMemo } from 'react'
import { cn } from '~/lib/utils'
import type { ValidationStatus } from '~/types/wordle'

export interface WordInputProps {
  word: string[]
  size?: number
  status?: ValidationStatus
  isLoading?: boolean
  error?: string | null
}

function PureWordInputUI({
  word,
  size = 5,
  status = 'idle' as ValidationStatus,
  isLoading = false,
  error = null
}: WordInputProps) {
  const squares = useMemo(() => Array(size).fill(null), [size])

  const statusClasses = {
    idle: 'border-gray-300 dark:border-gray-600',
    valid: 'border-green-500',
    invalid: 'border-red-500',
  }

  const loadingClass = isLoading ? 'animate-pulse' : ''

  return (
    <div className="flex flex-col items-center gap-4 mb-4">
      <div className={cn("flex justify-center items-center gap-2 md:gap-3", loadingClass)}>
        {squares.map((_, index) => (
          <div
            key={index}
            className={cn(
              'w-14 h-14 md:w-16 md:h-16 border-4 rounded-md flex items-center justify-center text-3xl md:text-4xl font-bold uppercase bg-white dark:bg-gray-800 transition-colors duration-300',
              statusClasses[status],
              isLoading && 'opacity-70',
            )}
          >
            {word[index] || ''}
          </div>
        ))}
      </div>

      {isLoading && (
        <div className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">
          Validating word...
        </div>
      )}

      {error && (
        <div className="text-sm text-red-500 dark:text-red-400 text-center max-w-xs">
          {error}
        </div>
      )}
    </div>
  )
}

export const WordInputUI = memo(PureWordInputUI)

