import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiJson } from '../../api.js'
import { useSiteConfig } from '../../siteConfig.jsx'
import { fontDisplay, fontMono, orangeBtnVars } from '../../theme.js'

const RESEND_COOLDOWN = 30 // seconds

export default function ForgotPassword() {
  const navigate = useNavigate()
  const { siteName } = useSiteConfig()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (cooldown <= 0) return undefined
    const timer = setInterval(() => setCooldown((s) => s - 1), 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  const sendResetLink = async () => {
    if (!email.trim()) {
      setError('Enter your email address.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email address.')
      return
    }
    setError('')
    setSending(true)
    try {
      // The backend always replies the same way whether or not the
      // address is on file, so there's nothing to branch on here.
      await apiJson('/password-reset', { method: 'POST', json: { email } })
    } catch {
      // Fall through -- still show the generic "check your email" screen
      // rather than leaking whether the request itself failed vs. the
      // address not existing.
    } finally {
      setSending(false)
    }
    setSent(true)
    setCooldown(RESEND_COOLDOWN)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    sendResetLink()
  }

  if (sent) {
    return (
      <div className="d-flex align-items-center justify-content-center vh-100 bg-teal-50 p-4">
        <div className="text-center" style={{ maxWidth: '28rem' }}>
          <div
            className="rounded-circle d-inline-flex align-items-center justify-content-center mb-4"
            style={{ width: '4rem', height: '4rem', backgroundColor: 'var(--tw-teal-700)' }}
          >
            <svg width="26" height="26" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                d="M2.5 5.5h15v9a1 1 0 01-1 1h-13a1 1 0 01-1-1v-9z"
                stroke="#fff"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
              <path d="M2.8 5.8l7.2 5.4 7.2-5.4" stroke="#fff" strokeWidth="1.4" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="fw-semibold" style={{ ...fontDisplay, fontSize: '2.5rem' }}>
            CHECK YOUR EMAIL
          </h1>
          <p className="text-body-secondary fs-5">
            If an account is registered with <strong>{email}</strong>, a password reset link is on its way. It can take
            a few minutes to arrive &mdash; check your spam folder too.
          </p>

          <button
            type="button"
            className="btn btn-outline-dark rounded-2 fw-semibold px-4 mt-2 mb-3"
            onClick={sendResetLink}
            disabled={cooldown > 0 || sending}
          >
            {cooldown > 0 ? `Resend email (${cooldown}s)` : 'Resend email'}
          </button>

          <p className="small text-body-secondary mb-0">
            <button type="button" className="btn btn-link btn-sm p-0 align-baseline" onClick={() => navigate('/login')}>
              Back to login
            </button>
          </p>
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
          {siteName}
        </span>

        <div>
          <span
            className="small text-uppercase fw-semibold d-block mb-3"
            style={{ ...fontMono, letterSpacing: '0.18em', color: 'var(--tw-amber-400)' }}
          >
            RESET PASSWORD
          </span>
          <h1 className="text-uppercase lh-1 fw-semibold" style={{ ...fontDisplay, fontSize: 'clamp(2.4rem, 4vw, 3.4rem)' }}>
            <span className="d-block">LOST YOUR</span>
            <span className="d-block">PASSWORD?</span>
          </h1>
          <p className="fs-5 opacity-75 mt-3" style={{ maxWidth: '30ch' }}>
            No sweat. Tell us your registered email and we&rsquo;ll send a reset link your way.
          </p>
        </div>

        <span className="small opacity-50" style={fontMono}>
          ACCOUNT RECOVERY
        </span>
      </div>

      {/* Form panel */}
      <div className="flex-grow-1 d-flex align-items-center overflow-auto">
        <div className="p-4 p-lg-5 mx-auto w-100" style={{ maxWidth: '28rem' }}>
          <div className="d-lg-none mb-4">
            <span className="fs-4" style={{ ...fontDisplay, letterSpacing: '0.06em' }}>
              {siteName}
            </span>
            <span
              className="small text-uppercase fw-semibold d-block mt-3"
              style={{ ...fontMono, letterSpacing: '0.18em', color: 'var(--tw-orange-700)' }}
            >
              RESET PASSWORD
            </span>
          </div>

          <h2 className="fw-semibold mb-2" style={{ ...fontDisplay, fontSize: 'clamp(1.8rem, 3vw, 2.2rem)' }}>
            Forgot your password?
          </h2>
          <p className="text-body-secondary mb-4">Enter the email on your account and we&rsquo;ll send you a reset link.</p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-4">
              <label htmlFor="email" className="form-label small fw-semibold">
                Email address
              </label>
              <input
                id="email"
                type="email"
                className={`form-control${error ? ' is-invalid' : ''}`}
                placeholder="you@polytechnic.edu.my"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (error) setError('')
                }}
                autoComplete="email"
                autoFocus
              />
              {error && <div className="invalid-feedback">{error}</div>}
            </div>

            <button type="submit" className="btn w-100 rounded-2 fw-semibold py-2" style={orangeBtnVars} disabled={sending}>
              {sending ? 'Sending…' : 'Send reset link'}
            </button>

            <p className="text-center small text-body-secondary mt-3 mb-0">
              Remembered it?{' '}
              <button type="button" className="btn btn-link btn-sm p-0 align-baseline" onClick={() => navigate('/login')}>
                Back to login
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
