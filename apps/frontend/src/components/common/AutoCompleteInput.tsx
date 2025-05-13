import { useState, useMemo } from 'react'
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from '@headlessui/react'

export interface AutoCompleteInputProps<T> {
  options: T[]
  value: T | null
  onChange: (value: T) => void
  getOptionLabel: (option: T) => string
  placeholder?: string
}

export function AutoCompleteInput<T extends { id: string | number }>({
  options,
  value,
  onChange,
  getOptionLabel,
  placeholder = '',
}: AutoCompleteInputProps<T>) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredOptions = useMemo(() => {
    const lower = searchTerm.toLowerCase()
    return options.filter((option) =>
      getOptionLabel(option).toLowerCase().includes(lower)
    )
  }, [searchTerm, options, getOptionLabel])

  return (
    <Listbox value={value} onChange={onChange}>
      <div className="relative mt-1">
        <ListboxButton className="flex w-full items-center justify-between rounded-md bg-gray-800 px-3 py-2 text-left text-white border border-gray-600 sm:text-sm">
          <div className="flex items-center gap-3">
            <span className="truncate">
              {value ? getOptionLabel(value) : placeholder}
            </span>
          </div>
        </ListboxButton>

        <ListboxOptions className="absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded-md bg-gray-800 shadow-lg ring-1 ring-white/10 sm:text-sm">
          <div className="px-3 py-2 border-b border border-gray-600">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="חפש..."
              className="w-full rounded-md px-2 py-1 text-sm bg-gray-700 text-white border border-gray-500 focus:outline-none"
            />
          </div>
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-2 text-gray-400 text-sm">לא נמצאו תוצאות</div>
          ) : (
            filteredOptions.map((option) => (
              <ListboxOption
                key={(option as any).id}
                value={option}
                className={({ active }) =>
                  `relative cursor-pointer select-none py-2 pr-9 pl-3 ${
                    active ? 'bg-indigo-600 text-white' : 'text-gray-100'
                  }`
                }
              >
                <span className="ml-3 truncate">
                  {getOptionLabel(option)}
                </span>
              </ListboxOption>
            ))
          )}
        </ListboxOptions>
      </div>
    </Listbox>
  )
}