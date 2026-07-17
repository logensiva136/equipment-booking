import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fontDisplay, fontMono, orangeBtnVars } from '../../theme.js'

const initialForm = {
  username: '',
  password: '',
  rememberMe: false,
}

export default function AdminLogin() {
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})

  const setField = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const validate = () => {
    const next = {}
    if (!form.username.trim()) next.username = 'Enter your admin username.'
    if (!form.password) next.password = 'Enter your password.'
    return next
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length === 0) {
      // TODO: POST to the Django Ninja backend, e.g. /api/admin/login,
      // with { username, password, rememberMe }. Keep this endpoint
      // separate from the student/staff /api/login so an admin
      // session can carry different permissions from the start.
      navigate('/admin/dashboard')
    }
  }

  return (
    <div className="d-flex flex-column flex-lg-row vh-100 overflow-hidden">
      {/* Brand panel */}
      <div
        className="d-none d-lg-flex flex-column justify-content-between p-5 text-white"
        style={{
          flex: '0 0 38%',
          background: 'radial-gradient(120% 140% at 20% 15%, var(--tw-teal-700) 0%, var(--tw-teal-900) 72%)',
        }}
      >
        <div className="d-flex align-items-center gap-2">
          <span className="fs-4" style={{ ...fontDisplay, letterSpacing: '0.06em' }}>
            FitPoly
          </span>
          <span
            className="badge rounded-pill"
            style={{ ...fontMono, fontSize: '0.65rem', letterSpacing: '0.1em', backgroundColor: 'var(--tw-teal-800)', color: 'var(--tw-amber-400)' }}
          >
            ADMIN
          </span>
        </div>

        <div>
          <span
            className="small text-uppercase fw-semibold d-block mb-3"
            style={{ ...fontMono, letterSpacing: '0.18em', color: 'var(--tw-amber-400)' }}
          >
            ADMIN ACCESS
          </span>
          <h1 className="text-uppercase lh-1 fw-semibold" style={{ ...fontDisplay, fontSize: 'clamp(2.4rem, 4vw, 3.4rem)' }}>
            <span className="d-block">RUN THE</span>
            <span className="d-block">COURT.</span>
          </h1>
          <p className="fs-5 opacity-75 mt-3" style={{ maxWidth: '30ch' }}>
            Manage bookings, equipment and guidance content across FitPoly from one place.
          </p>
        </div>

        <span className="small opacity-50" style={fontMono}>
          RESTRICTED &middot; STAFF ADMIN ONLY
        </span>
      </div>

      {/* Form panel */}
      <div className="flex-grow-1 d-flex align-items-center overflow-auto">
        <div className="p-4 p-lg-5 mx-auto w-100" style={{ maxWidth: '28rem' }}>
          <div className="d-lg-none mb-4 d-flex align-items-center gap-2">
            <span className="fs-4" style={{ ...fontDisplay, letterSpacing: '0.06em' }}>
              FitPoly
            </span>
            <span
              className="badge rounded-pill"
              style={{ ...fontMono, fontSize: '0.65rem', letterSpacing: '0.1em', backgroundColor: 'var(--tw-teal-800)', color: 'var(--tw-amber-400)' }}
            >
              ADMIN
            </span>
          </div>

          <h2 className="fw-semibold mb-2" style={{ ...fontDisplay, fontSize: 'clamp(1.8rem, 3vw, 2.2rem)' }}>
            Admin sign in
          </h2>
          <p className="text-body-secondary mb-4">Sign in with the credentials created during setup.</p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label htmlFor="username" className="form-label small fw-semibold">
                Username
              </label>
              <input
                id="username"
                type="text"
                className={`form-control${errors.username ? ' is-invalid' : ''}`}
                placeholder="e.g. admin.fitpoly"
                value={form.username}
                onChange={setField('username')}
                autoComplete="username"
                autoFocus
              />
              {errors.username && <div className="invalid-feedback">{errors.username}</div>}
            </div>

            <div className="mb-3">
              <div className="d-flex align-items-center justify-content-between">
                <label htmlFor="password" className="form-label small fw-semibold mb-0">
                  Password
                </label>
                <button
                  type="button"
                  className="btn btn-link btn-sm p-0 text-decoration-none"
                  style={{ ...fontMono, fontSize: '0.75rem', color: 'var(--tw-orange-700)' }}
                  onClick={() => navigate('/forgot-password')}
                >
                  Forgot password?
                </button>
              </div>
              <div className="input-group mt-1">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className={`form-control${errors.password ? ' is-invalid' : ''}`}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={setField('password')}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                      <path
                        d="M2 2l16 16M8.5 8.7a2.2 2.2 0 003 3M6.2 6.2C3.8 7.6 2.3 9.6 2 10c.7 1.3 3.7 5.5 8 5.5 1.4 0 2.6-.4 3.7-1M10 4.5c4.3 0 7.3 4.2 8 5.5-.3.5-1.1 1.7-2.4 2.9"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                      <path
                        d="M2 10c.7-1.3 3.7-5.5 8-5.5s7.3 4.2 8 5.5c-.7 1.3-3.7 5.5-8 5.5S2.7 11.3 2 10z"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinejoin="round"
                      />
                      <circle cx="10" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.4" />
                    </svg>
                  )}
                </button>
                {errors.password && <div className="invalid-feedback">{errors.password}</div>}
              </div>
            </div>

            <div className="form-check mb-4">
              <input
                type="checkbox"
                className="form-check-input"
                id="rememberMe"
                checked={form.rememberMe}
                onChange={setField('rememberMe')}
              />
              <label className="form-check-label small" htmlFor="rememberMe">
                Remember me on this device
              </label>
            </div>

            <button type="submit" className="btn w-100 rounded-2 fw-semibold py-2" style={orangeBtnVars}>
              Sign in
            </button>

            <p className="text-center small text-body-secondary mt-3 mb-0">
              Not an admin?{' '}
              <button type="button" className="btn btn-link btn-sm p-0 align-baseline" onClick={() => navigate('/login')}>
                Go to student / staff login
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
