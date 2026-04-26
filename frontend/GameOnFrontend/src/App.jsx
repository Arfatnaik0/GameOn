import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import GameDetail from './pages/GameDetail'
import Profile from './pages/Profile'
import Lists from './pages/Lists'
import Socials from './pages/Socials'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0608' }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(220,30,60,0.2)', borderTopColor: '#dc1e3c', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  return user ? children : <Navigate to="/login" replace />
}

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />}/>
    {/* Public — guests can view */}
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/game/:id" element={<GameDetail />} />
    {/* Protected — must be signed in */}
    <Route path="/profile/:userId" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
    <Route path="/lists" element={<ProtectedRoute><Lists /></ProtectedRoute>} />
    <Route path="/socials" element={<ProtectedRoute><Socials /></ProtectedRoute>} />
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
)

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </BrowserRouter>
)

export default App
