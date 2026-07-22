import { fontDisplay, fontMono } from '../../theme.js'

// Shared centered-card layout for the 401/403/404 pages — same visual
// language as the "SETUP COMPLETE" / "YOU'RE IN" confirmation screens
// elsewhere in the app (AdminSetup.jsx, Register.jsx).
export default function ErrorPage({ code, title, message, actions }) {
  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-teal-50 p-4">
      <div className="text-center" style={{ maxWidth: '28rem' }}>
        <span
          className="d-block small text-uppercase fw-semibold mb-2"
          style={{ ...fontMono, letterSpacing: '0.18em', color: 'var(--tw-orange-700)' }}
        >
          ERROR {code}
        </span>
        <h1 className="fw-semibold" style={{ ...fontDisplay, fontSize: '3rem' }}>
          {title}
        </h1>
        <p className="text-body-secondary fs-5">{message}</p>
        <div className="d-flex gap-2 justify-content-center mt-2">{actions}</div>
      </div>
    </div>
  )
}
