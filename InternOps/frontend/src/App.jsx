import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import useAuthStore from './store/auth'

function Private({ children }) {
  const token = useAuthStore(s => s.accessToken)
  return token ? children : <Navigate to="/login" />
}
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/*" element={<Private><Dashboard /></Private>} />
    </Routes>
  )
}
