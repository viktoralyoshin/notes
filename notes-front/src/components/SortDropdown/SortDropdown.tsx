import { useState, useRef, useEffect } from 'react'
import { useNotes } from '../../store/notesContext'
import type { SortOption } from '../../types'

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'manual', label: 'Manual' },
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'title-asc', label: 'Title A-Z' },
  { value: 'title-desc', label: 'Title Z-A' },
  { value: 'color', label: 'By color' },
]

export default function SortDropdown() {
  const { state, dispatch } = useNotes()
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const currentLabel = sortOptions.find((o) => o.value === state.sortBy)?.label || 'Sort'

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 bg-gray-100 dark:bg-[#2a2a2a] hover:bg-gray-200 dark:hover:bg-[#333] rounded-lg transition-colors cursor-pointer"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
        </svg>
        {currentLabel}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 bg-white dark:bg-[#1a1a1a] rounded-lg shadow-lg dark:shadow-black/30 border border-gray-100 dark:border-[#2a2a2a] py-1 z-20 min-w-[140px] animate-fade-in">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                dispatch({ type: 'SET_SORT', payload: option.value })
                setIsOpen(false)
              }}
              className={`w-full text-left px-3 py-1.5 text-xs transition-colors cursor-pointer ${
                state.sortBy === option.value
                  ? 'text-gray-900 dark:text-white font-medium bg-gray-50 dark:bg-[#111111]'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111111]'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
