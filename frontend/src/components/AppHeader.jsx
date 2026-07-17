import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { fontDisplay, fontMono } from '../theme.js'

const NAV_ITEMS = [
  { to: '/equipment', label: 'Book Equipment' },
  { to: '/steps', label: 'Step Tracker' },
  { to: '/bookings', label: 'Booking History' },
  { to: '/guide', label: 'BMI & Exercise' },
  { to: '/chat', label: 'Chat & Rewards' },
]

function navLinkStyle(isActive) {
  return {
    ...fontMono,
    letterSpacing: '0.06em',
    color: isActive ? 'var(--tw-orange-700)' : 'var(--tw-neutral-600)',
  }
}

export default function AppHeader() {
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="border-bottom bg-white">
      <div className="d-flex align-items-center justify-content-between p-3 p-lg-4">
        <Link to="/equipment" className="text-decoration-none text-dark fs-4" style={{ ...fontDisplay, letterSpacing: '0.06em' }}>
          FitPoly
        </Link>

        <nav className="d-none d-lg-flex align-items-center gap-4">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-decoration-none small fw-semibold text-uppercase"
              style={navLinkStyle(location.pathname === item.to)}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="btn btn-outline-dark btn-sm rounded-2 d-none d-lg-inline-block"
          onClick={() => navigate('/login')}
        >
          Log out
        </button>

        <button
          type="button"
          className="btn btn-outline-dark btn-sm d-lg-none"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {menuOpen && (
        <nav className="d-lg-none border-top px-3 pb-3 d-flex flex-column gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-decoration-none small fw-semibold text-uppercase py-2"
              style={navLinkStyle(location.pathname === item.to)}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <button type="button" className="btn btn-outline-dark btn-sm rounded-2 mt-2" onClick={() => navigate('/login')}>
            Log out
          </button>
        </nav>
      )}
    </header>
  )
}
