import { useState } from 'react'
import AdminShell from '../../components/AdminShell.jsx'
import { fontDisplay, fontMono } from '../../theme.js'

// Mock data -- real numbers come from the Django Ninja backend once
// it exists (e.g. GET /api/admin/overview).
const STATS = [
  { label: 'BOOKINGS TODAY', value: '18', accent: 'var(--tw-orange-500)' },
  { label: 'EQUIPMENT IN USE', value: '3 / 8', accent: 'var(--tw-teal-700)' },
  { label: 'REGISTERED USERS', value: '642', accent: 'var(--tw-amber-500)' },
  { label: 'PENDING VERIFICATIONS', value: '5', accent: 'var(--tw-sky-600)' },
]

// Ties back to the ID photo uploaded during registration -- an admin
// needs to review that photo against the name/ID before approving.
const PENDING_VERIFICATIONS = [
  { id: 'v1', name: 'Nur Aisyah Rahman', role: 'Student', idLabel: 'Matrix No.', idNumber: '24DTK21F1102', submitted: '2 hours ago' },
  { id: 'v2', name: 'Haziq Rahman', role: 'Student', idLabel: 'Matrix No.', idNumber: '21DEE22F0456', submitted: '5 hours ago' },
  { id: 'v3', name: 'Farah Idris', role: 'Staff', idLabel: 'Staff ID', idNumber: 'STF-0118', submitted: 'Yesterday' },
]

const TODAY_BOOKINGS = [
  { id: 'b1', equipment: 'Badminton Racket', borrower: 'Ahmad Faiz (21DTK21F1002)', slot: '5:00 PM \u2013 7:00 PM' },
  { id: 'b2', equipment: 'Volleyball', borrower: 'Nur Aisyah (STF-0031)', slot: '5:00 PM \u2013 7:00 PM' },
  { id: 'b3', equipment: 'Football', borrower: 'Haziq Rahman (21DEE22F0456)', slot: '5:00 PM \u2013 6:30 PM' },
]

export default function AdminDashboard() {
  const [pending, setPending] = useState(PENDING_VERIFICATIONS)

  const resolve = (id) => {
    // TODO: POST /api/admin/verifications/:id/{approve,reject} on the
    // Django Ninja backend.
    setPending((prev) => prev.filter((p) => p.id !== id))
  }

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
          Here&rsquo;s what&rsquo;s happening across FitPoly today.
        </p>

        {/* KPI cards */}
        <div className="row row-cols-2 row-cols-lg-4 g-3 mb-5">
          {STATS.map((stat) => (
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
              {pending.length > 0 && (
                <span className="badge rounded-pill" style={{ backgroundColor: 'var(--tw-sky-100)', color: 'var(--tw-sky-700)' }}>
                  {pending.length} waiting
                </span>
              )}
            </div>

            {pending.length === 0 ? (
              <div className="card">
                <div className="card-body text-center text-body-secondary py-4">All caught up &mdash; nothing to review.</div>
              </div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {pending.map((p) => (
                  <div key={p.id} className="card">
                    <div className="card-body d-flex align-items-center justify-content-between flex-wrap gap-2">
                      <div>
                        <span className="d-block fw-semibold">{p.name}</span>
                        <span className="d-block small text-body-secondary">
                          {p.role} &middot; {p.idLabel} {p.idNumber} &middot; {p.submitted}
                        </span>
                      </div>
                      <div className="d-flex gap-2">
                        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => resolve(p.id)}>
                          Reject
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm text-white"
                          style={{ backgroundColor: 'var(--tw-teal-700)', borderColor: 'var(--tw-teal-700)' }}
                          onClick={() => resolve(p.id)}
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
              <ul className="list-group list-group-flush">
                {TODAY_BOOKINGS.map((b) => (
                  <li key={b.id} className="list-group-item">
                    <span className="d-block fw-semibold small">{b.equipment}</span>
                    <span className="d-block small text-body-secondary">{b.borrower}</span>
                    <span className="d-block small text-body-secondary">{b.slot}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  )
}
