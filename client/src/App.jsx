import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Planner from './pages/Planner'
import Chat from './pages/Chat'
import Focus from './pages/Focus'
import Calendar from './pages/Calendar'
import Goals from './pages/Goals'
import Analytics from './pages/Analytics'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/planner" element={
            <ProtectedRoute><Planner /></ProtectedRoute>
          } />
          <Route path="/chat" element={
            <ProtectedRoute><Chat /></ProtectedRoute>
          } />
          <Route path="/focus" element={
            <ProtectedRoute><Focus /></ProtectedRoute>
          } />
          <Route path="/calendar" element={
  <ProtectedRoute>
    <Calendar />
  </ProtectedRoute>
} />
<Route path="/goals" element={
  <ProtectedRoute>
    <Goals />
  </ProtectedRoute>
} />
<Route path="/analytics" element={
  <ProtectedRoute>
    <Analytics />
  </ProtectedRoute>
} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App