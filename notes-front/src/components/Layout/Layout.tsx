import type { ReactNode } from 'react'
import Sidebar from '../Sidebar/Sidebar'
import SearchBar from '../SearchBar/SearchBar'

interface LayoutProps {
  children: ReactNode
  onAddNote: () => void
}

export default function Layout({ children, onAddNote }: LayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar onAddNote={onAddNote} />

      <main className="flex-1 px-4 md:px-8 py-6 md:py-8 pb-20 md:pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <SearchBar />
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 md:mb-8">Notes</h1>

        {/* Content */}
        {children}
      </main>
    </div>
  )
}
