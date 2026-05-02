import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/common/Navbar'
import Hero from './components/common/Hero'
import Features from './components/common/Features'
import HowItWorks from './components/common/HowItWorks'
import Roles from './components/common/Roles'
import Footer from './components/common/Footer'
import Register from './pages/auth/Register'
import Login from './pages/auth/Login'
import TenantDashboard from './pages/tenant/TenantDashboard'
import MaintenanceRequests from './pages/tenant/MaintenanceRequests'
import Amenities from './pages/tenant/Amenities'
import OwnerDashboard from './pages/owner/OwnerDashboard'

function AppLayout() {
  const location = useLocation()

  const hideNavbarOn = [
    '/tenant/dashboard',
    '/tenant/requests',
    '/tenant/amenities',
    '/owner/dashboard',
  ]

  const shouldShowNavbar = !hideNavbarOn.includes(location.pathname)

  return (
    <div className="bg-brand-bg min-h-screen font-dm">
      {shouldShowNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={
          <>
            <Hero />
            <Features />
            <HowItWorks />
            <Roles />
            <Footer />
          </>
        } />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/tenant/dashboard" element={<TenantDashboard />} />
        <Route path="/tenant/requests" element={<MaintenanceRequests />} />
        <Route path="/tenant/amenities" element={<Amenities />} />
        <Route path="/owner/dashboard" element={<OwnerDashboard />} />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}