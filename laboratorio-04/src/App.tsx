import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Threads from './pages/Threads'
import Thread from './pages/Thread'

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Threads />} />
      <Route path="/:id" element={<Thread />} />
    </Routes>
  </BrowserRouter>
)

export default App
