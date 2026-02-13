import { useState, useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import type { Note } from '../../types'
import { SortableNoteCard, NoteCardContent } from '../NoteCard/NoteCard'
import { useNotes } from '../../store/notesContext'

interface NoteGridProps {
  notes: Note[]
  isLoading?: boolean
  onEdit: (note: Note) => void
  onDelete: (id: string) => void
  onToggleFavorite: (id: string) => void
  onShare?: (note: Note) => void
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl p-5 min-h-[180px] bg-gray-200 dark:bg-[#333] animate-pulse">
      <div className="h-4 bg-gray-300 dark:bg-[#444] rounded w-3/4 mb-3" />
      <div className="h-3 bg-gray-300 dark:bg-[#444] rounded w-full mb-2" />
      <div className="h-3 bg-gray-300 dark:bg-[#444] rounded w-2/3" />
    </div>
  )
}

export default function NoteGrid({ notes, isLoading, onEdit, onDelete, onToggleFavorite, onShare }: NoteGridProps) {
  const { state, reorderNotes } = useNotes()
  const [activeNote, setActiveNote] = useState<Note | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  )

  const isDragEnabled = state.sortBy === 'manual'

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const note = notes.find((n) => n.id === event.active.id)
    if (note) setActiveNote(note)
  }, [notes])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveNote(null)
    const { active, over } = event

    if (!over || active.id === over.id) return

    const oldIndex = notes.findIndex((n) => n.id === active.id)
    const newIndex = notes.findIndex((n) => n.id === over.id)

    if (oldIndex === -1 || newIndex === -1) return

    const reordered = [...notes]
    const [moved] = reordered.splice(oldIndex, 1)
    reordered.splice(newIndex, 0, moved)

    reorderNotes(reordered)
  }, [notes, reorderNotes])

  const handleDragCancel = useCallback(() => {
    setActiveNote(null)
  }, [])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500 animate-fade-in">
        <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="text-lg font-medium">No notes yet</p>
        <p className="text-sm mt-1">Click the + button to create your first note</p>
      </div>
    )
  }

  if (!isDragEnabled) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {notes.map((note, index) => (
          <NoteCardContent
            key={note.id}
            note={note}
            index={index}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleFavorite={onToggleFavorite}
            onShare={onShare}
          />
        ))}
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={notes.map((n) => n.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {notes.map((note, index) => (
            <SortableNoteCard
              key={note.id}
              note={note}
              index={index}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleFavorite={onToggleFavorite}
              onShare={onShare}
            />
          ))}
        </div>
      </SortableContext>
      <DragOverlay>
        {activeNote ? (
          <NoteCardContent
            note={activeNote}
            index={0}
            isDragOverlay
            onEdit={() => {}}
            onDelete={() => {}}
            onToggleFavorite={() => {}}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
