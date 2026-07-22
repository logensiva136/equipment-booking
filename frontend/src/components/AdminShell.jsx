import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth.jsx'
import { useSiteConfig } from '../siteConfig.jsx'
import { fontDisplay, fontMono } from '../theme.js'

const NAV_ITEMS = [
  {
    to: '/admin/dashboard',
    label: 'Dashboard',
    icon: (props) => (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" {...props}>
        <rect x="2.5" y="2.5" width="6.5" height="6.5" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
        <rect x="11" y="2.5" width="6.5" height="6.5" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
        <rect x="2.5" y="11" width="6.5" height="6.5" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
        <rect x="11" y="11" width="6.5" height="6.5" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    ),
  },
  {
    to: '/admin/equipment',
    label: 'Equipment',
    icon: (props) => (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" {...props}>
        <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.4" />
        <path d="M4.5 10h11M10 4.5c2.5 2.7 2.5 8.3 0 11M10 4.5c-2.5 2.7-2.5 8.3 0 11" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
      </svg>
    ),
  },
  {
    to: '/admin/bookings',
    label: 'Bookings',
    icon: (props) => (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" {...props}>
        <rect x="2.5" y="4" width="15" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
        <path d="M2.5 8h15M6 2.5v3M14 2.5v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: '/admin/users',
    label: 'Users',
    icon: (props) => (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" {...props}>
        <circle cx="7.5" cy="6.5" r="3" stroke="currentColor" strokeWidth="1.4" />
        <path d="M2 17c.6-3.4 3-5 5.5-5s4.9 1.6 5.5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="14.5" cy="7" r="2.2" stroke="currentColor" strokeWidth="1.3" opacity="0.6" />
        <path d="M13 17c.3-2 1.4-3.6 3.2-4.3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.6" />
      </svg>
    ),
  },
  {
    to: '/admin/content',
    label: 'Content',
    icon: (props) => (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" {...props}>
        <path d="M5 2.5h7L16 6.5V17a.5.5 0 01-.5.5h-9a.5.5 0 01-.5-.5v-14a.5.5 0 01.5-.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M12 2.5V6.5H16" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M7 10.5h6M7 13.5h6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
  },
]

function SidebarLinks({ pathname, onNavigate }) {
  return (
    <nav className="d-flex flex-column gap-1">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.to
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className="d-flex align-items-center gap-2 text-decoration-none rounded-2 px-3 py-2"
            style={{
              color: isActive ? '#fff' : 'rgba(255,255,255,0.65)',
              backgroundColor: isActive ? 'var(--tw-teal-700)' : 'transparent',
            }}
          >
            <item.icon />
            <span className="small fw-semibold" style={{ ...fontMono, letterSpacing: '0.04em' }}>
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}

export default function AdminShell({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const { siteName } = useSiteConfig()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login')
  }

  return (
    <div className="d-flex min-vh-100">
      {/* Desktop sidebar */}
      <aside
        className="d-none d-lg-flex flex-column justify-content-between p-3"
        style={{ width: '15rem', flexShrink: 0, backgroundColor: 'var(--tw-teal-900)' }}
      >
        <div>
          <div className="d-flex align-items-center gap-2 px-2 mb-4 mt-2">
            <span className="fs-5 text-white" style={{ ...fontDisplay, letterSpacing: '0.06em' }}>
              {siteName}
            </span>
            <span
              className="badge rounded-pill"
              style={{ ...fontMono, fontSize: '0.6rem', letterSpacing: '0.08em', backgroundColor: 'var(--tw-teal-800)', color: 'var(--tw-amber-400)' }}
            >
              ADMIN
            </span>
          </div>
          <SidebarLinks pathname={location.pathname} />
        </div>

        <button
          type="button"
          className="btn btn-outline-light btn-sm rounded-2 fw-semibold"
          onClick={handleLogout}
        >
          Log out
        </button>
      </aside>

      {/* Mobile top bar */}
      <div className="d-lg-none position-fixed top-0 start-0 end-0 bg-white border-bottom d-flex align-items-center justify-content-between p-3" style={{ zIndex: 10 }}>
        <div className="d-flex align-items-center gap-2">
          <span className="fs-5" style={{ ...fontDisplay, letterSpacing: '0.06em' }}>
            {siteName}
          </span>
          <span
            className="badge rounded-pill"
            style={{ ...fontMono, fontSize: '0.6rem', letterSpacing: '0.08em', backgroundColor: 'var(--tw-teal-800)', color: 'var(--tw-amber-400)' }}
          >
            ADMIN
          </span>
        </div>
        <button
          type="button"
          className="btn btn-outline-dark btn-sm"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <div
          className="d-lg-none position-fixed top-0 end-0 bottom-0 p-3 d-flex flex-column justify-content-between"
          style={{ width: '15rem', backgroundColor: 'var(--tw-teal-900)', zIndex: 20, marginTop: '3.7rem' }}
        >
          <SidebarLinks pathname={location.pathname} onNavigate={() => setMobileOpen(false)} />
          <button
            type="button"
            className="btn btn-outline-light btn-sm rounded-2 fw-semibold"
            onClick={() => navigate('/admin/login')}
          >
            Log out
          </button>
        </div>
      )}

      {/* Content */}
      <main className="flex-grow-1 bg-white" style={{ minWidth: 0, marginTop: 0 }}>
        <div className="d-lg-none" style={{ height: '3.7rem' }} />
        {children}
      </main>
    </div>
  )
}
