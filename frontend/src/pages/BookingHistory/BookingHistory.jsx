import { useState } from 'react'
import AppHeader from '../../components/AppHeader.jsx'
import { fontDisplay, fontMono, tealCheckVars } from '../../theme.js'

// Mock history -- real data comes from GET /api/bookings/mine once the
// Django Ninja backend exists. Statuses follow the ID-card handover
// process: a booking starts 'pending' until admin collects the card
// and releases the item ('active'), then 'completed' once it's
// returned and the card is handed back -- or 'cancelled' at any point
// before that.
const INITIAL_BOOKINGS = [
  { id: 'bk-1', equipment: 'Badminton Racket', slot: 'Tue, Wed & Fri', time: '5:00 PM \u2013 7:00 PM', date: '18 Jul 2026', status: 'pending' },
  { id: 'bk-2', equipment: 'Table Tennis Paddle', slot: 'Mon & Thu', time: '5:00 PM \u2013 6:30 PM', date: '20 Jul 2026', status: 'active' },
  { id: 'bk-3', equipment: 'Basketball', slot: 'Tue, Wed & Fri', time: '5:00 PM \u2013 7:00 PM', date: '11 Jul 2026', status: 'completed' },
  { id: 'bk-4', equipment: 'Jump Rope', slot: 'Mon & Thu', time: '5:00 PM \u2013 6:30 PM', date: '7 Jul 2026', status: 'completed' },
  { id: 'bk-5', equipment: 'Futsal Ball', slot: 'Tue, Wed & Fri', time: '5:00 PM \u2013 7:00 PM', date: '2 Jul 2026', status: 'completed' },
  { id: 'bk-6', equipment: 'Frisbee', slot: 'Mon & Thu', time: '5:00 PM \u2013 6:30 PM', date: '29 Jun 2026', status: 'cancelled' },
]

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
]

const STATUS_HELP = {
  pending: 'Awaiting ID card handover at the counter',
  active: 'Card is held at the counter until you return it',
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

export default function BookingHistory() {
  const [bookings, setBookings] = useState(INITIAL_BOOKINGS)
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all' ? bookings : bookings.filter((b) => b.status === filter)

  const cancelBooking = (id) => {
    // TODO: PATCH /api/bookings/:id { status: 'cancelled' } on the
    // Django Ninja backend. Only allowed while still pending -- once
    // an admin has released the item, cancelling it isn't a
    // self-service action any more.
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: 'cancelled' } : b)))
  }

  return (
    <div className="min-vh-100 bg-white">
      <AppHeader />

      <div className="p-3 p-lg-5">
        <span
          className="small text-uppercase fw-semibold d-block mb-2"
          style={{ ...fontMono, letterSpacing: '0.14em', color: 'var(--tw-orange-700)' }}
        >
          BOOKING HISTORY
        </span>
        <h1 className="fw-semibold mb-2" style={{ ...fontDisplay, fontSize: 'clamp(2rem, 4vw, 2.8rem)' }}>
          Your bookings
        </h1>
        <p className="text-body-secondary mb-4" style={{ maxWidth: '48ch' }}>
          Everything you&rsquo;ve booked through Sports Affair, past and upcoming.
        </p>

        {/* Filter tabs */}
        <div className="btn-group mb-4 flex-wrap" role="group" aria-label="Filter bookings">
          {FILTERS.map((f) => (
            <div key={f.key}>
              <input
                type="radio"
                className="btn-check"
                name="filter"
                id={`filter-${f.key}`}
                autoComplete="off"
                checked={filter === f.key}
                onChange={() => setFilter(f.key)}
              />
              <label className="btn btn-outline-dark fw-semibold px-3" htmlFor={`filter-${f.key}`} style={tealCheckVars}>
                {f.label}
              </label>
            </div>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-5 text-body-secondary">
            <p className="mb-1 fw-semibold">Nothing here yet</p>
            <p className="small mb-0">Bookings matching this filter will show up here.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
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
                    &nbsp;
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b.id}>
                    <td className="fw-semibold">{b.equipment}</td>
                    <td>
                      <span className="d-block">{b.slot}</span>
                      <span className="d-block small text-body-secondary">{b.time}</span>
                    </td>
                    <td>{b.date}</td>
                    <td>
                      <StatusBadge status={b.status} />
                      {STATUS_HELP[b.status] && (
                        <span className="d-block small text-body-secondary mt-1" style={{ maxWidth: '16rem' }}>
                          {STATUS_HELP[b.status]}
                        </span>
                      )}
                    </td>
                    <td className="text-end">
                      {b.status === 'pending' && (
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => cancelBooking(b.id)}
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
