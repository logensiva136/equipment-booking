import { Routes, Route } from 'react-router-dom'
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

export default function App() {
  return (
    <Routes>
      {/* TODO: once the backend exists, check GET /api/setup/status here
          (e.g. in a loader or a wrapper component) and redirect straight
          to /setup on first run if no admin account exists yet, before
          the user ever sees onboarding or login. */}
      <Route path="/" element={<Onboarding />} />
      <Route path="/setup" element={<AdminSetup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/equipment" element={<EquipmentBooking />} />
      <Route path="/steps" element={<StepTracker />} />
      <Route path="/bookings" element={<BookingHistory />} />
      <Route path="/guide" element={<Guide />} />
      <Route path="/chat" element={<ChatRewards />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/equipment" element={<AdminEquipment />} />
      <Route path="/admin/bookings" element={<AdminBookings />} />
      <Route path="/admin/users" element={<AdminUsers />} />
      <Route path="/admin/content" element={<AdminContent />} />
    </Routes>
  )
}
