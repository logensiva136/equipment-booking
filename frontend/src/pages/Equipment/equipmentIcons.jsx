// Small flat icons used as equipment "photos" on the booking grid.
// Same hand-built SVG approach as the onboarding illustrations, reusing
// the brand's Tailwind-color CSS variables so everything stays in sync.

export function RacketIcon() {
  return (
    <svg viewBox="0 0 64 64" width="100%" height="100%" role="img" aria-label="Badminton racket">
      <ellipse cx="32" cy="24" rx="18" ry="20" fill="none" stroke="var(--tw-teal-700)" strokeWidth="3" />
      {Array.from({ length: 4 }).map((_, i) => (
        <line key={`h${i}`} x1="16" y1={12 + i * 8} x2="48" y2={12 + i * 8} stroke="var(--tw-teal-700)" strokeOpacity="0.45" strokeWidth="1.3" />
      ))}
      {Array.from({ length: 4 }).map((_, i) => (
        <line key={`v${i}`} x1={20 + i * 8} y1="6" x2={20 + i * 8} y2="42" stroke="var(--tw-teal-700)" strokeOpacity="0.45" strokeWidth="1.3" />
      ))}
      <rect x="28" y="42" width="8" height="18" rx="3" fill="var(--tw-teal-700)" />
    </svg>
  )
}

export function BallIcon({ color = 'var(--tw-orange-500)' }) {
  return (
    <svg viewBox="0 0 64 64" width="100%" height="100%" role="img" aria-label="Ball">
      <circle cx="32" cy="32" r="24" fill="none" stroke={color} strokeWidth="3" />
      <path
        d="M32 8c8 8 8 40 0 48M8 32c8-8 40-8 48 0"
        fill="none"
        stroke={color}
        strokeOpacity="0.45"
        strokeWidth="1.6"
      />
    </svg>
  )
}

export function PaddleIcon() {
  return (
    <svg viewBox="0 0 64 64" width="100%" height="100%" role="img" aria-label="Table tennis paddle">
      <circle cx="30" cy="24" r="16" fill="var(--tw-orange-500)" fillOpacity="0.15" stroke="var(--tw-orange-600)" strokeWidth="3" />
      <rect x="27" y="38" width="6" height="18" rx="3" fill="var(--tw-orange-600)" />
    </svg>
  )
}

export function RopeIcon() {
  return (
    <svg viewBox="0 0 64 64" width="100%" height="100%" role="img" aria-label="Jump rope">
      <path d="M10 44c8-24 36-24 44 0" fill="none" stroke="var(--tw-amber-500)" strokeWidth="3" strokeLinecap="round" strokeDasharray="1 7" />
      <circle cx="10" cy="44" r="6" fill="var(--tw-neutral-900)" />
      <circle cx="54" cy="44" r="6" fill="var(--tw-neutral-900)" />
    </svg>
  )
}

export function FrisbeeIcon() {
  return (
    <svg viewBox="0 0 64 64" width="100%" height="100%" role="img" aria-label="Frisbee">
      <ellipse cx="32" cy="35" rx="26" ry="9" fill="var(--tw-teal-600)" fillOpacity="0.2" stroke="var(--tw-teal-700)" strokeWidth="3" />
      <ellipse cx="32" cy="29" rx="26" ry="9" fill="none" stroke="var(--tw-teal-700)" strokeWidth="3" />
    </svg>
  )
}
