import { useNotes } from '../../store/notesContext'

export default function SearchBar() {
  const { state, dispatch } = useNotes()

  return (
    <div className="relative w-full max-w-md">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        type="text"
        placeholder="Search"
        value={state.searchQuery}
        onChange={(e) =>
          dispatch({ type: 'SET_SEARCH_QUERY', payload: e.target.value })
        }
        className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-gray-300 transition-all"
      />
    </div>
  )
}
