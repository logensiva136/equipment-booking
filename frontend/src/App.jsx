import { useEffect, useState } from 'react'
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { apiJson } from './api.js'
import { AuthProvider, RequireAuth, RequireAdmin } from './auth.jsx'
import { SiteConfigProvider } from './siteConfig.jsx'
import Onboarding from './pages/Onboarding/Onboarding.jsx'
import AdminSetup from './pages/AdminSetup/AdminSetup.jsx'
import Register from './pages/Register/Register.jsx'
import Login from './pages/Login/Login.jsx'
import ForgotPassword from './pages/ForgotPassword/ForgotPassword.jsx'
import EquipmentBooking from './pages/Equipment/EquipmentBooking.jsx'
import StepTracker from './pages/StepTracker/StepTracker.jsx'
import BookingHistory from './pages/BookingHistory/BookingHistory.jsx'
import Guide from './pages/Guide/Guide.jsx'
import ChatRewards from './pages/ChatRewards/ChatRewards.jsx'
import AdminLogin from './pages/Admin/AdminLogin.jsx'
import AdminDashboard from './pages/Admin/AdminDashboard.jsx'
import AdminEquipment from './pages/Admin/AdminEquipment.jsx'
import AdminBookings from './pages/Admin/AdminBookings.jsx'
import AdminUsers from './pages/Admin/AdminUsers.jsx'
import AdminContent from './pages/Admin/AdminContent.jsx'
import NotFound from './pages/errors/NotFound.jsx'

// Gates the whole app behind the one-time admin setup: until an admin
// account exists, every route bounces to /admin-setup; once it exists,
// /admin-setup itself bounces away so it can never be run again.
function SetupGate({ children }) {
  const [status, setStatus] = useState(null) // null = still checking
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    apiJson('/setup/status')
      .then(setStatus)
      // Fail open if the backend is unreachable -- don't lock everyone out
      // of the app (incl. this setup screen) over a transient network blip.
      .catch(() => setStatus({ hasAdmin: true, companyName: '', companyAbbr: '' }))
  }, [])

  useEffect(() => {
    if (!status) return
    if (!status.hasAdmin && location.pathname !== '/admin-setup') {
      navigate('/admin-setup', { replace: true })
    } else if (status.hasAdmin && location.pathname === '/admin-setup') {
      navigate('/login', { replace: true })
    }
  }, [status, location.pathname, navigate])

  const siteName = status?.companyAbbr || 'FitPoly'

  useEffect(() => {
    document.title = `${siteName} | Your Campus. Your Game.`
  }, [siteName])

  if (!status) return null

  return <SiteConfigProvider siteName={siteName}>{children}</SiteConfigProvider>
}

export default function App() {
  return (
    <SetupGate>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Onboarding />} />
          <Route path="/admin-setup" element={<AdminSetup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/equipment" element={<RequireAuth><EquipmentBooking /></RequireAuth>} />
          <Route path="/steps" element={<RequireAuth><StepTracker /></RequireAuth>} />
          <Route path="/bookings" element={<RequireAuth><BookingHistory /></RequireAuth>} />
          <Route path="/guide" element={<RequireAuth><Guide /></RequireAuth>} />
          <Route path="/chat" element={<RequireAuth><ChatRewards /></RequireAuth>} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
          <Route path="/admin/equipment" element={<RequireAdmin><AdminEquipment /></RequireAdmin>} />
          <Route path="/admin/bookings" element={<RequireAdmin><AdminBookings /></RequireAdmin>} />
          <Route path="/admin/users" element={<RequireAdmin><AdminUsers /></RequireAdmin>} />
          <Route path="/admin/content" element={<RequireAdmin><AdminContent /></RequireAdmin>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </SetupGate>
  )
}
