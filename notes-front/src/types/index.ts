export type NoteColor = 'yellow' | 'orange' | 'purple' | 'green' | 'blue'

export type SortOption = 'manual' | 'newest' | 'oldest' | 'title-asc' | 'title-desc' | 'color'

export interface Note {
  id: string
  title: string
  content: string
  color: NoteColor
  isFavorite: boolean
  position: number
  createdAt: string
  updatedAt: string
}

export const NOTE_COLORS: Record<NoteColor, { bg: string; label: string; dot: string }> = {
  yellow: { bg: 'bg-note-yellow', label: 'Yellow', dot: 'bg-note-yellow' },
  orange: { bg: 'bg-note-orange', label: 'Orange', dot: 'bg-note-orange' },
  purple: { bg: 'bg-note-purple', label: 'Purple', dot: 'bg-note-purple' },
  green:  { bg: 'bg-note-green',  label: 'Green',  dot: 'bg-note-green' },
  blue:   { bg: 'bg-note-blue',   label: 'Blue',   dot: 'bg-note-blue' },
}
