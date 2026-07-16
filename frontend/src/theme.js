// Shared inline-style tokens for the FitPoly frontend.
// Bootstrap utility classes (+ the Tailwind color extension in
// tailwind-colors.css) handle almost everything; these cover the
// handful of things no utility class can express — the two custom
// fonts, and per-instance button theming via Bootstrap 5.3's own
// CSS-variable API (--bs-btn-*), so no bespoke classes/stylesheets
// are needed anywhere in the app.

export const fontDisplay = { fontFamily: "'Teko', sans-serif" }
export const fontMono = { fontFamily: "'Space Mono', monospace" }

// Primary action buttons (whistle-orange).
export const orangeBtnVars = {
  '--bs-btn-color': '#fff',
  '--bs-btn-bg': 'var(--tw-orange-500)',
  '--bs-btn-border-color': 'var(--tw-orange-500)',
  '--bs-btn-hover-color': '#fff',
  '--bs-btn-hover-bg': 'var(--tw-orange-700)',
  '--bs-btn-hover-border-color': 'var(--tw-orange-700)',
  '--bs-btn-active-bg': 'var(--tw-orange-800)',
  '--bs-btn-active-border-color': 'var(--tw-orange-800)',
  '--bs-btn-disabled-bg': 'var(--tw-orange-300)',
  '--bs-btn-disabled-border-color': 'var(--tw-orange-300)',
}

// Segmented controls (btn-check + label.btn pairs) — checked state
// goes court-teal so selection controls read differently from the
// orange primary actions.
export const tealCheckVars = {
  '--bs-btn-active-color': '#fff',
  '--bs-btn-active-bg': 'var(--tw-teal-700)',
  '--bs-btn-active-border-color': 'var(--tw-teal-700)',
}
