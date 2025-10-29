import { Routes, Route } from 'react-router-dom'
import SkiResortSearch from './components/SkiResortSearch'
import './App.css'

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<SkiResortSearch />} />
      </Routes>
    </div>
  )
}

export default App
