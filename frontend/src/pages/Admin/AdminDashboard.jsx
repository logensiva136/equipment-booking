import { useEffect, useState } from 'react'
import AdminShell from '../../components/AdminShell.jsx'
import { apiJson } from '../../api.js'
import { useSiteConfig } from '../../siteConfig.jsx'
import { fontDisplay, fontMono } from '../../theme.js'

function todayDisplayDate() {
  const d = new Date()
  return `${d.getDate()} ${d.toLocaleString('en-GB', { month: 'short' })} ${d.getFullYear()}`
}

export default function AdminDashboard() {
  const { siteName } = useSiteConfig()
  const [equipment, setEquipment] = useState([])
  const [bookings, setBookings] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([apiJson('/admin/equipment'), apiJson('/admin/bookings'), apiJson('/admin/users')])
      .then(([e, b, u]) => {
        setEquipment(e)
        setBookings(b)
        setUsers(u)
      })
      .catch(() => setError('Could not load the dashboard.'))
      .finally(() => setLoading(false))
  }, [])

  const resolve = async (id, verified) => {
    try {
      const updated = await apiJson(`/admin/users/${id}/${verified ? 'approve' : 'reject'}`, { method: 'POST' })
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)))
    } catch {
      setError('Could not update that user.')
    }
  }

  if (loading) return <AdminShell><div className="p-3 p-lg-5" /></AdminShell>

  const today = todayDisplayDate()
  const bookingsToday = bookings.filter((b) => b.date === today)
  const equipmentInUse = bookings.filter((b) => b.status === 'active').length
  const pendingUsers = users.filter((u) => !u.verified)

  const stats = [
    { label: 'BOOKINGS TODAY', value: String(bookingsToday.length), accent: 'var(--tw-orange-500)' },
    { label: 'EQUIPMENT IN USE', value: `${equipmentInUse} / ${equipment.length}`, accent: 'var(--tw-teal-700)' },
    { label: 'REGISTERED USERS', value: String(users.length), accent: 'var(--tw-amber-500)' },
    { label: 'PENDING VERIFICATIONS', value: String(pendingUsers.length), accent: 'var(--tw-sky-600)' },
  ]

  return (
    <AdminShell>
      <div className="p-3 p-lg-5">
        <span
          className="small text-uppercase fw-semibold d-block mb-2"
          style={{ ...fontMono, letterSpacing: '0.14em', color: 'var(--tw-orange-700)' }}
        >
          ADMIN DASHBOARD
        </span>
        <h1 className="fw-semibold mb-2" style={{ ...fontDisplay, fontSize: 'clamp(2rem, 4vw, 2.8rem)' }}>
          Good afternoon
        </h1>
        <p className="text-body-secondary mb-4" style={{ maxWidth: '48ch' }}>
          Here&rsquo;s what&rsquo;s happening across {siteName} today.
        </p>

        {error && <div className="alert alert-danger py-2 small">{error}</div>}

        {/* KPI cards */}
        <div className="row row-cols-2 row-cols-lg-4 g-3 mb-5">
          {stats.map((stat) => (
            <div className="col" key={stat.label}>
              <div className="card h-100" style={{ borderTop: `3px solid ${stat.accent}` }}>
                <div className="card-body">
                  <span className="d-block small text-body-secondary fw-semibold" style={{ ...fontMono, letterSpacing: '0.08em' }}>
                    {stat.label}
                  </span>
                  <span className="d-block fw-semibold lh-1 mt-1" style={{ ...fontDisplay, fontSize: '2.2rem' }}>
                    {stat.value}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="row g-4">
          {/* Pending ID verifications */}
          <div className="col-12 col-lg-7">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <span className="small fw-semibold text-uppercase" style={{ ...fontMono, letterSpacing: '0.1em' }}>
                Pending ID verifications
              </span>
              {pendingUsers.length > 0 && (
                <span className="badge rounded-pill" style={{ backgroundColor: 'var(--tw-sky-100)', color: 'var(--tw-sky-700)' }}>
                  {pendingUsers.length} waiting
                </span>
              )}
            </div>

            {pendingUsers.length === 0 ? (
              <div className="card">
                <div className="card-body text-center text-body-secondary py-4">All caught up &mdash; nothing to review.</div>
              </div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {pendingUsers.map((p) => (
                  <div key={p.id} className="card">
                    <div className="card-body d-flex align-items-center justify-content-between flex-wrap gap-2">
                      <div>
                        <span className="d-block fw-semibold">{p.name}</span>
                        <span className="d-block small text-body-secondary">
                          {p.role} &middot; {p.idLabel} {p.idNumber} &middot; {p.registered}
                        </span>
                      </div>
                      <div className="d-flex gap-2">
                        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => resolve(p.id, false)}>
                          Reject
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm text-white"
                          style={{ backgroundColor: 'var(--tw-teal-700)', borderColor: 'var(--tw-teal-700)' }}
                          onClick={() => resolve(p.id, true)}
                        >
                          Approve
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Today's bookings */}
          <div className="col-12 col-lg-5">
            <span className="small fw-semibold text-uppercase d-block mb-3" style={{ ...fontMono, letterSpacing: '0.1em' }}>
              Today&rsquo;s bookings
            </span>
            <div className="card">
              {bookingsToday.length === 0 ? (
                <div className="card-body text-center text-body-secondary py-4">Nothing booked today yet.</div>
              ) : (
                <ul className="list-group list-group-flush">
                  {bookingsToday.map((b) => (
                    <li key={b.id} className="list-group-item">
                      <span className="d-block fw-semibold small">{b.equipment}</span>
                      <span className="d-block small text-body-secondary">
                        {b.borrower.name} ({b.borrower.id})
                      </span>
                      <span className="d-block small text-body-secondary">{b.time}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  )
}
