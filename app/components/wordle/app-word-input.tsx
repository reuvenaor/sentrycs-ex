import { type WordInputProps, WordInputUI } from '~/components/wordle/ui-word-input'
import { useWordStore } from '~/stores/word-slice'

export function WordInput({ size = 5 }: Pick<WordInputProps, 'size'>) {
  const { word, validationStatus, isLoading, error } = useWordStore()

  return (
    <WordInputUI
      word={word}
      size={size}
      status={validationStatus}
      isLoading={isLoading}
      error={error}
    />
  )
}