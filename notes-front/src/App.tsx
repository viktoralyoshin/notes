import { NotesProvider } from './store/notesContext'
import Layout from './components/Layout/Layout'

function App() {
  const handleAddNote = () => {
    // TODO: implement note creation modal
  }

  return (
    <NotesProvider>
      <Layout onAddNote={handleAddNote}>
        <p className="text-gray-400">Notes grid coming soon...</p>
      </Layout>
    </NotesProvider>
  )
}

export default App
