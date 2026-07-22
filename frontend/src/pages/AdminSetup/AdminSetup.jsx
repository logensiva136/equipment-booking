import { useState } from 'react'
import { apiJson, ApiError } from '../../api.js'
import { fontDisplay, fontMono, orangeBtnVars } from '../../theme.js'

// Same "no custom stylesheet" approach as the onboarding carousel:
// Bootstrap utility classes + the Tailwind color extension for teal/
// orange/amber, inline `style` only for the two custom fonts and the
// one gradient. Buttons are recolored via Bootstrap 5.3's own CSS
// variable API (--bs-btn-*) instead of a bespoke class (see ../../theme.js).

// Derives a short uppercase abbreviation from a company name, e.g.
// "Politeknik Sultan Idris Shah" -> "PSIS". Runs live while the admin
// types, unless they've edited the abbreviation field by hand.
function deriveAbbreviation(name) {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 8)
}

const initialForm = {
  name: '',
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  companyName: '',
  companyAbbr: '',
}

export default function AdminSetup() {
  const [form, setForm] = useState(initialForm)
  const [abbrTouched, setAbbrTouched] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const setField = (field) => (e) => {
    const value = e.target.value
    setForm((prev) => {
      const next = { ...prev, [field]: value }
      if (field === 'companyName' && !abbrTouched) {
        next.companyAbbr = deriveAbbreviation(value)
      }
      return next
    })
  }

  const setAbbrField = (e) => {
    setAbbrTouched(true)
    setForm((prev) => ({ ...prev, companyAbbr: e.target.value.toUpperCase() }))
  }

  const resetAbbrToAuto = () => {
    setAbbrTouched(false)
    setForm((prev) => ({ ...prev, companyAbbr: deriveAbbreviation(prev.companyName) }))
  }

  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = 'Enter the admin\u2019s full name.'
    if (!form.username.trim()) next.username = 'Choose a username.'
    else if (/\s/.test(form.username)) next.username = 'Usernames can\u2019t contain spaces.'
    if (!form.email.trim()) next.email = 'Enter an email address.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Enter a valid email address.'
    if (form.password.length < 8) next.password = 'Use at least 8 characters.'
    if (form.confirmPassword !== form.password) next.confirmPassword = 'Passwords don\u2019t match.'
    if (!form.companyName.trim()) next.companyName = 'Enter your organisation\u2019s name.'
    if (!form.companyAbbr.trim()) next.companyAbbr = 'Abbreviation can\u2019t be empty.'
    return next
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)
    try {
      const body = new FormData()
      body.append('name', form.name)
      body.append('username', form.username)
      body.append('email', form.email)
      body.append('password', form.password)
      body.append('confirmPassword', form.confirmPassword)
      body.append('companyName', form.companyName)
      body.append('companyAbbr', form.companyAbbr)
      await apiJson('/setup/admin', { method: 'POST', form: body })
      setSubmitted(true)
    } catch (err) {
      if (err instanceof ApiError && err.body?.errors) {
        setErrors(err.body.errors)
      } else if (err instanceof ApiError) {
        // e.g. 409 -- an admin already exists (shouldn't normally happen,
        // the app gate keeps this page unreachable once setup is done).
        setErrors({ form: err.body?.detail || 'Something went wrong. Please try again.' })
      } else {
        setErrors({ form: 'Could not reach the server. Please try again.' })
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="d-flex align-items-center justify-content-center vh-100 bg-teal-50 p-4">
        <div className="text-center" style={{ maxWidth: '28rem' }}>
          <div
            className="rounded-circle d-inline-flex align-items-center justify-content-center mb-4"
            style={{ width: '4rem', height: '4rem', backgroundColor: 'var(--tw-teal-700)' }}
          >
            <svg width="28" height="28" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M4 10.5L8 14.5L16 5.5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="fw-semibold" style={{ ...fontDisplay, fontSize: '2.5rem' }}>
            SETUP COMPLETE
          </h1>
          <p className="text-body-secondary fs-5">
            {form.companyAbbr}&rsquo;s admin account for <strong>{form.name}</strong> is ready. You can sign in with
            username <strong>{form.username}</strong>.
          </p>
          <button
            type="button"
            className="btn rounded-2 fw-semibold px-4 mt-2"
            style={orangeBtnVars}
            onClick={() => {
              // Full reload (not client-side navigate) so the app-wide
              // setup gate re-checks /api/setup/status and picks up the
              // org name/abbreviation just created, instead of running
              // with its stale pre-setup snapshot for the rest of the
              // session.
              window.location.assign('/admin/login')
            }}
          >
            Go to login
          </button>
        </div>
      </div>
    )
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
        <span className="fs-4" style={{ ...fontDisplay, letterSpacing: '0.06em' }}>
          FitPoly
        </span>

        <div>
          <span
            className="small text-uppercase fw-semibold d-block mb-3"
            style={{ ...fontMono, letterSpacing: '0.18em', color: 'var(--tw-amber-400)' }}
          >
            FIRST-TIME SETUP
          </span>
          <h1 className="text-uppercase lh-1 fw-semibold" style={{ ...fontDisplay, fontSize: 'clamp(2.4rem, 4vw, 3.4rem)' }}>
            <span className="d-block">CLAIM THE</span>
            <span className="d-block">FIRST WHISTLE.</span>
          </h1>
          <p className="fs-5 opacity-75 mt-3" style={{ maxWidth: '30ch' }}>
            This runs once. Create the admin account and register your organisation before anyone else can sign in.
          </p>
        </div>

        <span className="small opacity-50" style={fontMono}>
          STEP 0 &middot; SYSTEM SETUP
        </span>
      </div>

      {/* Form panel */}
      <div className="flex-grow-1 overflow-auto">
        <div className="p-4 p-lg-5 mx-auto" style={{ maxWidth: '34rem' }}>
          <div className="d-lg-none mb-4">
            <span className="fs-4" style={{ ...fontDisplay, letterSpacing: '0.06em' }}>
              FitPoly
            </span>
            <span
              className="small text-uppercase fw-semibold d-block mt-3"
              style={{ ...fontMono, letterSpacing: '0.18em', color: 'var(--tw-orange-700)' }}
            >
              FIRST-TIME SETUP
            </span>
          </div>

          <h2 className="fw-semibold mb-2" style={{ ...fontDisplay, fontSize: 'clamp(1.8rem, 3vw, 2.2rem) ' }}>
            Set up your admin account
          </h2>
          <p className="text-body-secondary mb-4">
            You&rsquo;ll use this login to manage bookings, content and other admins later.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            {/* Admin account */}
            <div className="d-flex align-items-center gap-2 mb-3">
              <span className="text-uppercase small fw-semibold" style={{ ...fontMono, letterSpacing: '0.12em', color: 'var(--tw-teal-700)' }}>
                Admin account
              </span>
              <hr className="flex-grow-1 my-0" />
            </div>

            <div className="mb-3">
              <label htmlFor="name" className="form-label small fw-semibold">
                Full name
              </label>
              <input
                id="name"
                type="text"
                className={`form-control${errors.name ? ' is-invalid' : ''}`}
                placeholder="As per IC"
                value={form.name}
                onChange={setField('name')}
              />
              {errors.name && <div className="invalid-feedback">{errors.name}</div>}
            </div>

            <div className="row g-3 mb-3">
              <div className="col-12 col-sm-6">
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
                  autoCapitalize="none"
                />
                {errors.username && <div className="invalid-feedback">{errors.username}</div>}
              </div>
              <div className="col-12 col-sm-6">
                <label htmlFor="email" className="form-label small fw-semibold">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className={`form-control${errors.email ? ' is-invalid' : ''}`}
                  placeholder="you@polytechnic.edu.my"
                  value={form.email}
                  onChange={setField('email')}
                />
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
              </div>
            </div>

            <div className="row g-3 mb-4">
              <div className="col-12 col-sm-6">
                <label htmlFor="password" className="form-label small fw-semibold">
                  Password
                </label>
                <div className="input-group">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className={`form-control${errors.password ? ' is-invalid' : ''}`}
                    placeholder="Min. 8 characters"
                    value={form.password}
                    onChange={setField('password')}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                        <path d="M2 2l16 16M8.5 8.7a2.2 2.2 0 003 3M6.2 6.2C3.8 7.6 2.3 9.6 2 10c.7 1.3 3.7 5.5 8 5.5 1.4 0 2.6-.4 3.7-1M10 4.5c4.3 0 7.3 4.2 8 5.5-.3.5-1.1 1.7-2.4 2.9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                        <path d="M2 10c.7-1.3 3.7-5.5 8-5.5s7.3 4.2 8 5.5c-.7 1.3-3.7 5.5-8 5.5S2.7 11.3 2 10z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                        <circle cx="10" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.4" />
                      </svg>
                    )}
                  </button>
                  {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                </div>
              </div>
              <div className="col-12 col-sm-6">
                <label htmlFor="confirmPassword" className="form-label small fw-semibold">
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  className={`form-control${errors.confirmPassword ? ' is-invalid' : ''}`}
                  placeholder="Retype password"
                  value={form.confirmPassword}
                  onChange={setField('confirmPassword')}
                />
                {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
              </div>
            </div>

            {/* Organisation */}
            <div className="d-flex align-items-center gap-2 mb-3">
              <span className="text-uppercase small fw-semibold" style={{ ...fontMono, letterSpacing: '0.12em', color: 'var(--tw-teal-700)' }}>
                Organisation
              </span>
              <hr className="flex-grow-1 my-0" />
            </div>

            <div className="row g-3 mb-4">
              <div className="col-12 col-sm-7">
                <label htmlFor="companyName" className="form-label small fw-semibold">
                  Company / campus name
                </label>
                <input
                  id="companyName"
                  type="text"
                  className={`form-control${errors.companyName ? ' is-invalid' : ''}`}
                  placeholder="e.g. Politeknik Sultan Idris Shah"
                  value={form.companyName}
                  onChange={setField('companyName')}
                />
                {errors.companyName && <div className="invalid-feedback">{errors.companyName}</div>}
              </div>
              <div className="col-12 col-sm-5">
                <label htmlFor="companyAbbr" className="form-label small fw-semibold d-flex align-items-center justify-content-between">
                  <span>Abbreviation</span>
                  {abbrTouched && (
                    <button
                      type="button"
                      className="btn btn-link btn-sm p-0 text-decoration-none"
                      style={{ ...fontMono, fontSize: '0.7rem', color: 'var(--tw-orange-700)' }}
                      onClick={resetAbbrToAuto}
                    >
                      Auto-fill
                    </button>
                  )}
                </label>
                <input
                  id="companyAbbr"
                  type="text"
                  className={`form-control text-uppercase${errors.companyAbbr ? ' is-invalid' : ''}`}
                  style={fontMono}
                  placeholder="AUTO"
                  value={form.companyAbbr}
                  onChange={setAbbrField}
                  maxLength={8}
                />
                {errors.companyAbbr ? (
                  <div className="invalid-feedback">{errors.companyAbbr}</div>
                ) : (
                  <div className="form-text">
                    {abbrTouched ? 'Edited manually.' : 'Auto-generated \u2014 edit any time.'}
                  </div>
                )}
              </div>
            </div>

            {errors.form && <div className="alert alert-danger py-2 small">{errors.form}</div>}

            <button type="submit" className="btn w-100 rounded-2 fw-semibold py-2" style={orangeBtnVars} disabled={submitting}>
              {submitting ? 'Setting up…' : 'Complete setup'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
