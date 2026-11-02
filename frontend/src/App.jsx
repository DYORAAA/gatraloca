import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { adminDashboardUrl } from './api/students'
import HomePage from './pages/HomePage'
import './styles/global.css'

function AdminRedirect() {
  useEffect(() => {
    window.location.replace(adminDashboardUrl)
  }, [])

  return <main className="admin-page"><p className="route-loading">Membuka dashboard Laravel...</p></main>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<><Navbar /><HomePage /><Footer /></>} />
        <Route path="/admin/*" element={<AdminRedirect />} />
        <Route path="/siswa" element={<Navigate to="/#yearbook3d" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
