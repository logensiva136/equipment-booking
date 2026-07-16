// Hand-built flat illustrations for the onboarding flow.
// Each one uses the shared FitPoly palette via CSS variables so they
// stay in lockstep with the rest of the theme.

export function WelcomeIllustration() {
  return (
    <svg viewBox="0 0 300 300" width="100%" height="100%" role="img" aria-label="Runner crossing a court center line">
      <circle cx="150" cy="150" r="118" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="2" />
      <line x1="20" y1="150" x2="280" y2="150" stroke="#fff" strokeOpacity="0.35" strokeWidth="2" strokeDasharray="10 10" />

      {/* footprints trailing behind the runner */}
      <ellipse cx="78" cy="205" rx="7" ry="11" fill="var(--tw-amber-400)" opacity="0.85" transform="rotate(-18 78 205)" />
      <ellipse cx="104" cy="188" rx="7" ry="11" fill="var(--tw-amber-400)" opacity="0.7" transform="rotate(-14 104 188)" />
      <ellipse cx="128" cy="172" rx="7" ry="11" fill="var(--tw-amber-400)" opacity="0.55" transform="rotate(-10 128 172)" />

      {/* runner silhouette, mid-stride */}
      <g transform="translate(148 88)">
        <circle cx="30" cy="10" r="14" fill="#fff" />
        <path
          d="M18 30
             C10 40 4 52 10 66
             C14 76 24 82 20 96
             C17 108 8 112 2 118
             L14 122
             C24 112 34 104 34 90
             C34 78 26 70 30 58
             C40 66 46 74 58 78
             C66 81 76 80 84 74
             L80 62
             C72 66 64 66 58 62
             C48 55 44 42 32 32
             C28 29 22 28 18 30 Z"
          fill="#fff"
        />
      </g>
    </svg>
  )
}

export function StepTrackerIllustration() {
  return (
    <svg viewBox="0 0 300 300" width="100%" height="100%" role="img" aria-label="Winding route with a step readout card">
      <path
        d="M30 240 C 70 240, 70 190, 110 190 S 150 130, 190 130 S 230 70, 270 70"
        fill="none"
        stroke="#fff"
        strokeOpacity="0.4"
        strokeWidth="3"
        strokeDasharray="2 14"
        strokeLinecap="round"
      />
      <circle cx="30" cy="240" r="6" fill="var(--tw-amber-400)" />
      <circle cx="270" cy="70" r="8" fill="var(--tw-orange-500)" />

      {/* floating stat readout, scoreboard style */}
      <g transform="translate(60 40)">
        <rect x="0" y="0" width="150" height="86" rx="10" fill="var(--tw-neutral-900)" opacity="0.92" />
        <text x="16" y="26" fontFamily="'Space Mono, monospace'" fontSize="10" fill="var(--tw-amber-400)" letterSpacing="2">TODAY</text>
        <text x="16" y="64" fontFamily="'Teko, sans-serif'" fontSize="40" fill="#fff">6,482</text>
        <text x="16" y="80" fontFamily="'Space Mono, monospace'" fontSize="9" fill="#fff" opacity="0.7" letterSpacing="1">STEPS · 3.9 KM</text>
      </g>
    </svg>
  )
}

export function BookingIllustration() {
  return (
    <svg viewBox="0 0 300 300" width="100%" height="100%" role="img" aria-label="Badminton racket with a QR booking ticket">
      <circle cx="150" cy="150" r="118" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="2" />

      {/* racket */}
      <g transform="translate(60 40) rotate(-18 90 120)">
        <ellipse cx="90" cy="70" rx="52" ry="62" fill="none" stroke="#fff" strokeWidth="6" />
        {Array.from({ length: 5 }).map((_, i) => (
          <line key={`h${i}`} x1={48} y1={28 + i * 22} x2={132} y2={28 + i * 22} stroke="#fff" strokeOpacity="0.55" strokeWidth="2" />
        ))}
        {Array.from({ length: 5 }).map((_, i) => (
          <line key={`v${i}`} x1={58 + i * 16} y1={16} x2={58 + i * 16} y2={124} stroke="#fff" strokeOpacity="0.55" strokeWidth="2" />
        ))}
        <rect x="82" y="128" width="16" height="90" rx="7" fill="#fff" />
      </g>

      {/* shuttlecock */}
      <g transform="translate(196 176)">
        <circle cx="0" cy="0" r="9" fill="var(--tw-amber-400)" />
        <path d="M0 -4 L18 -30 M0 0 L26 -20 M0 4 L18 -8" stroke="var(--tw-amber-400)" strokeWidth="2" opacity="0.8" />
      </g>

      {/* QR / booking ticket */}
      <g transform="translate(24 190)">
        <rect x="0" y="0" width="92" height="80" rx="8" fill="var(--tw-neutral-900)" opacity="0.92" />
        <rect x="12" y="12" width="24" height="24" fill="#fff" />
        <rect x="17" y="17" width="14" height="14" fill="var(--tw-neutral-900)" />
        <rect x="44" y="12" width="8" height="8" fill="#fff" />
        <rect x="56" y="12" width="8" height="8" fill="#fff" />
        <rect x="44" y="24" width="8" height="8" fill="#fff" />
        <rect x="12" y="44" width="68" height="6" fill="var(--tw-orange-500)" />
        <text x="12" y="68" fontFamily="'Space Mono, monospace'" fontSize="9" fill="#fff" letterSpacing="1">5–7 PM SLOT</text>
      </g>
    </svg>
  )
}

export function RewardsIllustration() {
  return (
    <svg viewBox="0 0 300 300" width="100%" height="100%" role="img" aria-label="BMI gauge, trophy and chat bubble">
      {/* BMI gauge */}
      <g transform="translate(30 150)">
        <path d="M0 40 A 60 60 0 0 1 120 40" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="10" />
        <path d="M0 40 A 60 60 0 0 1 70 -14" fill="none" stroke="var(--tw-amber-400)" strokeWidth="10" strokeLinecap="round" />
        <line x1="60" y1="40" x2="88" y2="4" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
        <circle cx="60" cy="40" r="6" fill="#fff" />
        <text x="60" y="66" textAnchor="middle" fontFamily="'Space Mono, monospace'" fontSize="10" fill="#fff" opacity="0.75">BMI 21.4</text>
      </g>

      {/* trophy */}
      <g transform="translate(168 44)">
        <path d="M10 0 H70 V26 C70 46 54 58 40 58 C26 58 10 46 10 26 Z" fill="var(--tw-orange-500)" />
        <path d="M10 8 C-8 8 -8 38 14 34" fill="none" stroke="var(--tw-orange-500)" strokeWidth="6" />
        <path d="M70 8 C88 8 88 38 66 34" fill="none" stroke="var(--tw-orange-500)" strokeWidth="6" />
        <rect x="32" y="58" width="16" height="16" fill="var(--tw-orange-500)" />
        <rect x="20" y="74" width="40" height="10" rx="3" fill="var(--tw-orange-500)" />
      </g>

      {/* chat bubble */}
      <g transform="translate(150 160)">
        <rect x="0" y="0" width="118" height="70" rx="14" fill="var(--tw-neutral-900)" opacity="0.92" />
        <path d="M20 70 L20 88 L42 70 Z" fill="var(--tw-neutral-900)" opacity="0.92" />
        <circle cx="26" cy="35" r="6" fill="#fff" />
        <circle cx="59" cy="35" r="6" fill="var(--tw-amber-400)" />
        <circle cx="92" cy="35" r="6" fill="#fff" />
      </g>
    </svg>
  )
}
