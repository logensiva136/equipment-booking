import { useEffect, useState } from 'react'
import AdminShell from '../../components/AdminShell.jsx'
import { apiJson } from '../../api.js'
import { fontDisplay, fontMono, orangeBtnVars, tealCheckVars } from '../../theme.js'

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'student', label: 'Students' },
  { key: 'staff', label: 'Staff' },
  { key: 'pending', label: 'Pending' },
]

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [activeUser, setActiveUser] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    apiJson('/admin/users')
      .then(setUsers)
      .catch(() => setError('Could not load users.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <AdminShell><div className="p-3 p-lg-5" /></AdminShell>

  const filtered = users.filter((u) => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'student' && u.role === 'Student') ||
      (filter === 'staff' && u.role === 'Staff') ||
      (filter === 'pending' && !u.verified)
    const q = query.trim().toLowerCase()
    const matchesQuery = !q || u.name.toLowerCase().includes(q) || u.idNumber.toLowerCase().includes(q)
    return matchesFilter && matchesQuery
  })

  const setVerified = async (id, verified) => {
    try {
      const updated = await apiJson(`/admin/users/${id}/${verified ? 'approve' : 'reject'}`, { method: 'POST' })
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)))
      setActiveUser((prev) => (prev && prev.id === id ? updated : prev))
    } catch {
      setError('Could not update that user.')
    }
  }

  const bmi = (h, w) => (h > 0 ? (w / (h / 100) ** 2).toFixed(1) : '\u2014')

  return (
    <AdminShell>
      <div className="p-3 p-lg-5">
        <span
          className="small text-uppercase fw-semibold d-block mb-2"
          style={{ ...fontMono, letterSpacing: '0.14em', color: 'var(--tw-orange-700)' }}
        >
          COMMUNITY
        </span>
        <h1 className="fw-semibold mb-2" style={{ ...fontDisplay, fontSize: 'clamp(2rem, 4vw, 2.8rem)' }}>
          Manage users
        </h1>
        <p className="text-body-secondary mb-4" style={{ maxWidth: '48ch' }}>
          Registered students and staff, and anyone waiting on ID verification.
        </p>

        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
          <div className="btn-group flex-wrap" role="group" aria-label="Filter users">
            {FILTERS.map((f) => (
              <div key={f.key}>
                <input
                  type="radio"
                  className="btn-check"
                  name="user-filter"
                  id={`user-filter-${f.key}`}
                  autoComplete="off"
                  checked={filter === f.key}
                  onChange={() => setFilter(f.key)}
                />
                <label className="btn btn-outline-dark fw-semibold px-3" htmlFor={`user-filter-${f.key}`} style={tealCheckVars}>
                  {f.label}
                </label>
              </div>
            ))}
          </div>

          <input
            type="search"
            className="form-control"
            style={{ maxWidth: '18rem' }}
            placeholder="Search name or ID"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {error && <div className="alert alert-danger py-2 small">{error}</div>}

        {filtered.length === 0 ? (
          <div className="text-center py-5 text-body-secondary">
            <p className="mb-1 fw-semibold">No users match</p>
            <p className="small mb-0">Try a different filter or search term.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th className="small text-uppercase text-body-secondary fw-semibold" style={fontMono}>
                    Name
                  </th>
                  <th className="small text-uppercase text-body-secondary fw-semibold" style={fontMono}>
                    Role &amp; ID
                  </th>
                  <th className="small text-uppercase text-body-secondary fw-semibold" style={fontMono}>
                    Contact
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
                {filtered.map((u) => (
                  <tr key={u.id}>
                    <td className="fw-semibold">{u.name}</td>
                    <td>
                      <span className="d-block small">{u.role}</span>
                      <span className="d-block small text-body-secondary">{u.idNumber}</span>
                    </td>
                    <td>
                      <span className="d-block small text-truncate" style={{ maxWidth: '14rem' }}>
                        {u.email}
                      </span>
                      <span className="d-block small text-body-secondary">{u.phone}</span>
                    </td>
                    <td>
                      {u.verified ? (
                        <span className="badge rounded-pill bg-secondary-subtle text-secondary-emphasis">Verified</span>
                      ) : (
                        <span className="badge rounded-pill" style={{ backgroundColor: 'var(--tw-sky-100)', color: 'var(--tw-sky-700)' }}>
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="text-end">
                      <button type="button" className="btn btn-outline-dark btn-sm" onClick={() => setActiveUser(u)}>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {activeUser && (
        <>
          <div className="modal-backdrop show" onClick={() => setActiveUser(null)} />
          <div className="modal d-block" tabIndex="-1" role="dialog" aria-modal="true" onClick={() => setActiveUser(null)}>
            <div className="modal-dialog modal-dialog-centered" role="document" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title fw-semibold mb-0" style={fontDisplay}>
                    {activeUser.name}
                  </h5>
                  <button type="button" className="btn-close" aria-label="Close" onClick={() => setActiveUser(null)} />
                </div>
                <div className="modal-body">
                  <div className="row row-cols-2 g-3 small">
                    <div className="col">
                      <span className="d-block text-body-secondary" style={fontMono}>
                        ROLE
                      </span>
                      <span className="fw-semibold">{activeUser.role}</span>
                    </div>
                    <div className="col">
                      <span className="d-block text-body-secondary" style={fontMono}>
                        {activeUser.idLabel.toUpperCase()}
                      </span>
                      <span className="fw-semibold">{activeUser.idNumber}</span>
                    </div>
                    <div className="col">
                      <span className="d-block text-body-secondary" style={fontMono}>
                        EMAIL
                      </span>
                      <span className="fw-semibold">{activeUser.email}</span>
                    </div>
                    <div className="col">
                      <span className="d-block text-body-secondary" style={fontMono}>
                        PHONE
                      </span>
                      <span className="fw-semibold">{activeUser.phone}</span>
                    </div>
                    <div className="col">
                      <span className="d-block text-body-secondary" style={fontMono}>
                        GENDER
                      </span>
                      <span className="fw-semibold">{activeUser.gender}</span>
                    </div>
                    <div className="col">
                      <span className="d-block text-body-secondary" style={fontMono}>
                        HEIGHT / WEIGHT
                      </span>
                      <span className="fw-semibold">
                        {activeUser.height} cm &middot; {activeUser.weight} kg
                      </span>
                    </div>
                    <div className="col">
                      <span className="d-block text-body-secondary" style={fontMono}>
                        BMI
                      </span>
                      <span className="fw-semibold">{bmi(activeUser.height, activeUser.weight)}</span>
                    </div>
                    <div className="col">
                      <span className="d-block text-body-secondary" style={fontMono}>
                        REGISTERED
                      </span>
                      <span className="fw-semibold">{activeUser.registered}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-top">
                    <span className="d-block small text-body-secondary mb-2" style={fontMono}>
                      ID VERIFICATION PHOTO
                    </span>
                    <div
                      className="rounded-2 d-flex align-items-center justify-content-center"
                      style={{ height: '8rem', backgroundColor: 'var(--tw-neutral-100)', color: 'var(--tw-neutral-500)' }}
                    >
                      <span className="small">Uploaded {activeUser.idLabel.toLowerCase()} photo</span>
                    </div>
                  </div>
                </div>
                <div className="modal-footer d-flex align-items-center justify-content-between">
                  {activeUser.verified ? (
                    <span className="small" style={{ color: 'var(--tw-teal-700)' }}>
                      Verified
                    </span>
                  ) : (
                    <span className="small text-body-secondary">Awaiting review</span>
                  )}
                  <div className="d-flex gap-2">
                    {!activeUser.verified && (
                      <button type="button" className="btn btn-outline-secondary" onClick={() => setVerified(activeUser.id, false)}>
                        Reject
                      </button>
                    )}
                    {!activeUser.verified && (
                      <button type="button" className="btn rounded-2 fw-semibold" style={orangeBtnVars} onClick={() => setVerified(activeUser.id, true)}>
                        Approve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </AdminShell>
  )
}
