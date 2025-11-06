import { Routes, Route } from 'react-router-dom'
import SkiResortSearch from './components/SkiResortSearch'
import './App.css'

function App() {
  return (
    <div className="max-w-6xl mx-auto p-8">
      <Routes>
        <Route index element={<SkiResortSearch />} />
        <Route path="/" element={<SkiResortSearch />} />
        <Route path="*" element={<SkiResortSearch />} />
      </Routes>
    </div>
  )
}

export default App
