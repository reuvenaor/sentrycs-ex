import { Button } from '~/components/ui/button'
import { memo } from 'react'

const keyboardLayout = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
]

const lastRowKeys = keyboardLayout[2]
const firstRowKeys = keyboardLayout.slice(0, 2)




interface KeyboardPressProps {
  onKeyPress: (key: string) => void
}

interface KeyboardKeyProps extends KeyboardPressProps {
  name: string
}

interface KeyboardEnterProps {
  onSubmit: () => void
}

interface KeyboardDeleteProps {
  onDelete: () => void
}

interface KeyboardRowProps extends KeyboardPressProps {
  keys: string[]
}



interface KeyboardProps extends KeyboardPressProps, KeyboardEnterProps, KeyboardDeleteProps { }


function KeyboardEnterUI({ onSubmit }: KeyboardEnterProps) {
  return <Button
    variant="outline"
    className="h-12 md:h-16 px-6 md:px-8 text-sm md:text-base font-bold uppercase bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-50 dark:hover:bg-gray-600 rounded-md transition-all duration-75"
    onClick={onSubmit}
  >
    Enter
  </Button>
}

function KeyboardDeleteUI({ onDelete }: KeyboardDeleteProps) {
  return <Button
    variant="destructive"
    className="h-12 md:h-16 px-6 md:px-8 text-sm md:text-base font-bold uppercase rounded-md transition-all duration-75"
    onClick={onDelete}
  >
    Delete
  </Button>
}

function KeyboardKeyUI({ onKeyPress, name }: KeyboardKeyProps) {
  return <Button
    variant="outline"
    className="h-12 w-12 md:h-16 md:w-16 p-0 text-base md:text-lg font-bold uppercase bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-50 dark:hover:bg-gray-600 rounded-md transition-all duration-75 flex-shrink-0"
    onClick={() => onKeyPress(name)}
  >
    {name}
  </Button>
}

function KeyboardRowUI({ keys, onKeyPress }: KeyboardRowProps) {
  return keys.map((key) => <KeyboardKeyUI key={key} name={key} onKeyPress={onKeyPress} />)
}

function KeyboardLastRowUI({ onKeyPress }: KeyboardPressProps) {
  return <KeyboardRowUI keys={lastRowKeys} onKeyPress={onKeyPress} />
}

function KeyboardFirstRowUI({ onKeyPress }: KeyboardPressProps) {
  return firstRowKeys.map((row, rowIndex) => (
    <div
      key={rowIndex}
      className="flex justify-center w-full gap-1 md:gap-1.5"
    >
      <KeyboardRowUI keys={row} onKeyPress={onKeyPress} />
    </div>
  ))
}


function PureKeyboardUI({ onKeyPress, onSubmit, onDelete }: KeyboardProps) {
  return (
    <div className="w-full max-w-4xl mx-auto p-2 md:p-4 bg-gray-100 dark:bg-gray-900 rounded-xl shadow-lg">
      <div className="space-y-1 md:space-y-2">
        <KeyboardFirstRowUI onKeyPress={onKeyPress} />
        <div className="flex w-full items-center justify-center gap-1 md:gap-1.5 pt-1">
          <KeyboardEnterUI onSubmit={onSubmit} />
          <KeyboardLastRowUI onKeyPress={onKeyPress} />
          <KeyboardDeleteUI onDelete={onDelete} />
        </div>
      </div>
    </div>
  )
}

export const KeyboardUI = memo(PureKeyboardUI)
