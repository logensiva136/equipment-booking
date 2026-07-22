import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  WelcomeIllustration,
  StepTrackerIllustration,
  BookingIllustration,
  RewardsIllustration,
} from './illustrations.jsx'
import { useSiteConfig } from '../../siteConfig.jsx'
import { fontDisplay, fontMono, orangeBtnVars } from '../../theme.js'

// Everything below is styled with Bootstrap utility classes (+ the
// Tailwind color extension for teal/orange/amber, which Bootstrap's
// own 8-color theme palette doesn't cover). The only inline `style`
// props left are for things no utility class can express: the radial
// gradient, the dashed center-court line, drop-shadow, and the two
// custom display/mono fonts (see ../../theme.js).

const SLIDES = [
  {
    id: '01',
    eyebrow: 'FITPOLY',
    heading: ['YOUR CAMPUS.', 'YOUR GAME.'],
    body: 'One app for every polytechnic student to track fitness and book sports equipment on campus — no paperwork, no guesswork.',
    Illustration: WelcomeIllustration,
  },
  {
    id: '02',
    eyebrow: 'STEP TRACKER',
    heading: ['EVERY STEP', 'COUNTS.'],
    body: 'Track your steps, distance, pace and calories automatically. Choose walk, jog or run, and watch your weekly chart climb.',
    Illustration: StepTrackerIllustration,
  },
  {
    id: '03',
    eyebrow: 'EQUIPMENT BOOKING',
    heading: ["COURT'S YOURS.", 'BOOK IT.'],
    body: 'Scan the Sports Affair QR code, pick your slot, and go — your Matrix No. is already on file. Bring your Matrix card to collect.',
    Illustration: BookingIllustration,
  },
  {
    id: '04',
    eyebrow: 'BMI, CHAT & REWARDS',
    heading: ['KNOW YOUR NUMBERS.', 'EARN YOUR STRIPES.'],
    body: 'Get your BMI status with tailored meals and workouts, ask the health chat anything, and log daily wins for rewards.',
    Illustration: RewardsIllustration,
  },
]

export default function Onboarding() {
  const { siteName } = useSiteConfig()
  const [index, setIndex] = useState(0)
  const navigate = useNavigate()
  const isLast = index === SLIDES.length - 1
  const slide = SLIDES[index]

  const goNext = () => {
    if (isLast) {
      navigate('/register')
    } else {
      setIndex((i) => i + 1)
    }
  }

  const skip = () => navigate('/login')

  return (
    <div className="position-relative d-flex flex-column flex-lg-row vh-100 overflow-hidden">
      {/* Art panel — court-teal gradient */}
      <div
        className="d-flex align-items-center justify-content-center position-relative p-4 p-lg-5"
        style={{
          flex: '1 1 50%',
          minHeight: '38vh',
          background:
            'radial-gradient(120% 140% at 20% 15%, var(--tw-teal-700) 0%, var(--tw-teal-900) 72%)',
        }}
      >
        <div
          style={{
            width: 'min(320px, 70%)',
            aspectRatio: '1 / 1',
            filter: 'drop-shadow(0 18px 30px rgba(8, 69, 59, 0.45))',
          }}
        >
          <slide.Illustration />
        </div>

        {/* scorecard-style slide counter */}
        <div className="position-absolute bottom-0 start-0 m-4 d-flex align-items-baseline gap-2 text-white">
          <span className="fs-1 fw-semibold lh-1" style={fontDisplay}>
            {slide.id}
          </span>
          <span className="small opacity-50" style={fontMono}>
            / 0{SLIDES.length}
          </span>
        </div>
      </div>

      {/* Center court line, desktop only */}
      <div
        className="d-none d-lg-flex position-absolute top-0 bottom-0 start-50 translate-middle-x align-items-center justify-content-center"
        style={{
          width: '2px',
          background: 'repeating-linear-gradient(to bottom, #fff 0 14px, transparent 14px 26px)',
          opacity: 0.55,
          zIndex: 2,
        }}
        aria-hidden="true"
      >
        <span
          className="rounded-circle"
          style={{ width: 14, height: 14, border: '2px solid #fff', backgroundColor: 'var(--tw-teal-900)' }}
        />
      </div>

      {/* Content panel */}
      <div className="d-flex flex-column justify-content-between gap-4 p-4 p-lg-5 bg-white" style={{ flex: '1 1 50%' }}>
        <div className="d-flex align-items-center justify-content-between">
          <span className="fs-4" style={{ ...fontDisplay, letterSpacing: '0.06em' }}>
            {siteName}
          </span>
          {!isLast && (
            <button
              type="button"
              className="btn btn-link text-dark text-decoration-none text-uppercase small p-0 opacity-50"
              style={{ ...fontMono, letterSpacing: '0.12em' }}
              onClick={skip}
            >
              Skip
            </button>
          )}
        </div>

        <div className="d-flex flex-column gap-3" style={{ maxWidth: '34rem' }}>
          <span
            className="small text-uppercase fw-semibold"
            style={{ ...fontMono, letterSpacing: '0.18em', color: 'var(--tw-orange-700)' }}
          >
            {slide.eyebrow}
          </span>

          <h1 className="text-uppercase lh-1 fw-semibold mb-0" style={{ ...fontDisplay, fontSize: 'clamp(2.6rem, 6vw, 4.2rem)' }}>
            {slide.heading.map((line) => (
              <span className="d-block" key={line}>
                {line}
              </span>
            ))}
          </h1>

          <p className="fs-5 text-body-secondary" style={{ maxWidth: '36ch' }}>
            {slide.body}
          </p>
        </div>

        <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap">
          {/* tally-mark progress, echoes a scoreboard tally rather than generic dots */}
          <ol className="d-flex align-items-center gap-2 list-unstyled mb-0" aria-label={`Slide ${index + 1} of ${SLIDES.length}`}>
            {SLIDES.map((s, i) => (
              <li key={s.id}>
                <button
                  type="button"
                  className={`border-0 p-0 rounded-1 ${i === index ? '' : 'bg-secondary bg-opacity-25'}`}
                  style={{
                    width: 6,
                    height: i === index ? 28 : 22,
                    backgroundColor: i === index ? 'var(--tw-orange-500)' : undefined,
                    transition: 'background-color .2s ease, height .2s ease',
                  }}
                  aria-label={`Go to slide ${i + 1}`}
                  aria-current={i === index}
                  onClick={() => setIndex(i)}
                />
              </li>
            ))}
          </ol>

          {isLast ? (
            <div className="d-flex gap-2 flex-wrap">
              <button type="button" className="btn btn-outline-dark rounded-2 fw-semibold px-4" onClick={() => navigate('/login')}>
                Log in
              </button>
              <button
                type="button"
                className="btn rounded-2 fw-semibold px-4"
                style={orangeBtnVars}
                onClick={() => navigate('/register')}
              >
                Create account
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="btn rounded-circle d-inline-flex align-items-center justify-content-center p-0"
              style={{ width: '3.25rem', height: '3.25rem', ...orangeBtnVars }}
              onClick={goNext}
              aria-label="Next slide"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path
                  d="M4 10H16M16 10L11 5M16 10L11 15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
