import { useState } from 'react'
import AdminShell from '../../components/AdminShell.jsx'
import { fontDisplay, fontMono, orangeBtnVars, tealCheckVars } from '../../theme.js'

// Mock data -- real data via GET /api/admin/bookings. Lifecycle:
//   pending   -- booked on the system, ID card not yet at the counter
//   active    -- admin collected the card and released the item
//   completed -- item returned, admin released the booking and gave
//                the card back
//   cancelled -- never collected / cancelled before release
const INITIAL_BOOKINGS = [
  { id: 'bk-1', equipment: 'Badminton Racket', borrower: { name: 'Ahmad Faiz', id: '21DTK21F1002', role: 'Student' }, slot: 'Tue, Wed & Fri', time: '5:00 PM \u2013 7:00 PM', date: '18 Jul 2026', status: 'pending' },
  { id: 'bk-2', equipment: 'Volleyball', borrower: { name: 'Nur Aisyah', id: 'STF-0031', role: 'Staff' }, slot: 'Tue, Wed & Fri', time: '5:00 PM \u2013 7:00 PM', date: '18 Jul 2026', status: 'active' },
  { id: 'bk-3', equipment: 'Football', borrower: { name: 'Haziq Rahman', id: '21DEE22F0456', role: 'Student' }, slot: 'Mon & Thu', time: '5:00 PM \u2013 6:30 PM', date: '20 Jul 2026', status: 'pending' },
  { id: 'bk-4', equipment: 'Table Tennis Paddle', borrower: { name: 'Farah Idris', id: 'STF-0118', role: 'Staff' }, slot: 'Mon & Thu', time: '5:00 PM \u2013 6:30 PM', date: '11 Jul 2026', status: 'completed' },
  { id: 'bk-5', equipment: 'Basketball', borrower: { name: 'Ahmad Faiz', id: '21DTK21F1002', role: 'Student' }, slot: 'Tue, Wed & Fri', time: '5:00 PM \u2013 7:00 PM', date: '9 Jul 2026', status: 'completed' },
  { id: 'bk-6', equipment: 'Frisbee', borrower: { name: 'Nur Aisyah', id: 'STF-0031', role: 'Staff' }, slot: 'Mon & Thu', time: '5:00 PM \u2013 6:30 PM', date: '29 Jun 2026', status: 'cancelled' },
]

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
]

const STATUS_HELP = {
  pending: 'Awaiting ID card at the counter',
  active: 'Card held at the counter until return',
}

function StatusBadge({ status }) {
  if (status === 'pending') {
    return (
      <span className="badge rounded-pill" style={{ backgroundColor: 'var(--tw-sky-100)', color: 'var(--tw-sky-700)' }}>
        Pending
      </span>
    )
  }
  if (status === 'active') {
    return (
      <span className="badge rounded-pill" style={{ backgroundColor: 'var(--tw-teal-700)', color: '#fff' }}>
        Active
      </span>
    )
  }
  if (status === 'completed') {
    return <span className="badge rounded-pill bg-secondary-subtle text-secondary-emphasis">Completed</span>
  }
  return <span className="badge rounded-pill bg-danger-subtle text-danger-emphasis">Cancelled</span>
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState(INITIAL_BOOKINGS)
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')

  const filtered = bookings.filter((b) => {
    const matchesFilter = filter === 'all' || b.status === filter
    const q = query.trim().toLowerCase()
    const matchesQuery =
      !q ||
      b.borrower.name.toLowerCase().includes(q) ||
      b.borrower.id.toLowerCase().includes(q) ||
      b.equipment.toLowerCase().includes(q)
    return matchesFilter && matchesQuery
  })

  // Card collected, item released to the borrower.
  const approve = (id) => {
    // TODO: PATCH /api/admin/bookings/:id { status: 'active' }
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: 'active' } : b)))
  }

  // Card was never surrendered, or the booking is being called off
  // before release.
  const cancel = (id) => {
    // TODO: PATCH /api/admin/bookings/:id { status: 'cancelled' }
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: 'cancelled' } : b)))
  }

  // Item returned, card handed back to the borrower.
  const complete = (id) => {
    // TODO: PATCH /api/admin/bookings/:id { status: 'completed' }
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: 'completed' } : b)))
  }

  return (
    <AdminShell>
      <div className="p-3 p-lg-5">
        <span
          className="small text-uppercase fw-semibold d-block mb-2"
          style={{ ...fontMono, letterSpacing: '0.14em', color: 'var(--tw-orange-700)' }}
        >
          SPORTS AFFAIR
        </span>
        <h1 className="fw-semibold mb-2" style={{ ...fontDisplay, fontSize: 'clamp(2rem, 4vw, 2.8rem)' }}>
          Manage bookings
        </h1>
        <p className="text-body-secondary mb-4" style={{ maxWidth: '52ch' }}>
          Approve a booking once the borrower's ID card is at the counter, and mark it complete once the item and the
          card are both back.
        </p>

        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
          <div className="btn-group flex-wrap" role="group" aria-label="Filter bookings">
            {FILTERS.map((f) => (
              <div key={f.key}>
                <input
                  type="radio"
                  className="btn-check"
                  name="filter"
                  id={`admin-filter-${f.key}`}
                  autoComplete="off"
                  checked={filter === f.key}
                  onChange={() => setFilter(f.key)}
                />
                <label className="btn btn-outline-dark fw-semibold px-3" htmlFor={`admin-filter-${f.key}`} style={tealCheckVars}>
                  {f.label}
                </label>
              </div>
            ))}
          </div>

          <input
            type="search"
            className="form-control"
            style={{ maxWidth: '18rem' }}
            placeholder="Search name, ID or equipment"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-5 text-body-secondary">
            <p className="mb-1 fw-semibold">No bookings match</p>
            <p className="small mb-0">Try a different filter or search term.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th className="small text-uppercase text-body-secondary fw-semibold" style={fontMono}>
                    Borrower
                  </th>
                  <th className="small text-uppercase text-body-secondary fw-semibold" style={fontMono}>
                    Equipment
                  </th>
                  <th className="small text-uppercase text-body-secondary fw-semibold" style={fontMono}>
                    Slot
                  </th>
                  <th className="small text-uppercase text-body-secondary fw-semibold" style={fontMono}>
                    Date
                  </th>
                  <th className="small text-uppercase text-body-secondary fw-semibold" style={fontMono}>
                    Status
                  </th>
                  <th className="small text-uppercase text-body-secondary fw-semibold text-end" style={fontMono}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <span className="d-block fw-semibold">{b.borrower.name}</span>
                      <span className="d-block small text-body-secondary">
                        {b.borrower.role} &middot; {b.borrower.id}
                      </span>
                    </td>
                    <td>{b.equipment}</td>
                    <td>
                      <span className="d-block">{b.slot}</span>
                      <span className="d-block small text-body-secondary">{b.time}</span>
                    </td>
                    <td>{b.date}</td>
                    <td>
                      <StatusBadge status={b.status} />
                      {STATUS_HELP[b.status] && (
                        <span className="d-block small text-body-secondary mt-1" style={{ maxWidth: '14rem' }}>
                          {STATUS_HELP[b.status]}
                        </span>
                      )}
                    </td>
                    <td className="text-end">
                      <div className="d-inline-flex gap-2">
                        {b.status === 'pending' && (
                          <>
                            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => cancel(b.id)}>
                              Cancel
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm text-white"
                              style={{ backgroundColor: 'var(--tw-teal-700)', borderColor: 'var(--tw-teal-700)' }}
                              onClick={() => approve(b.id)}
                            >
                              Approve (card collected)
                            </button>
                          </>
                        )}
                        {b.status === 'active' && (
                          <button type="button" className="btn rounded-2 fw-semibold btn-sm" style={orangeBtnVars} onClick={() => complete(b.id)}>
                            Complete (item &amp; card returned)
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  )
}
