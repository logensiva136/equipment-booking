import { useEffect, useRef, useState } from 'react'
import AppHeader from '../../components/AppHeader.jsx'
import { apiJson } from '../../api.js'
import { fontDisplay, fontMono, orangeBtnVars, tealCheckVars } from '../../theme.js'

const DAILY_GOAL = 10000

// Rough per-mode constants for turning elapsed time into steps, distance
// and calories -- good enough for a prototype; a real device/GPS feed
// or the phone's step-counter API replaces this once wired up.
const MODES = {
  walk: { label: 'Walk', stepsPerMin: 100, strideM: 0.75, calPerStep: 0.04 },
  jog: { label: 'Jog', stepsPerMin: 150, strideM: 0.95, calPerStep: 0.055 },
  run: { label: 'Run', stepsPerMin: 180, strideM: 1.1, calPerStep: 0.07 },
}

// Mon=0 .. Sun=6, matching GET /api/steps/weekly's day order.
const TODAY_INDEX = (new Date().getDay() + 6) % 7

function formatClock(totalSeconds) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function StepTracker() {
  const [mode, setMode] = useState('walk')
  const [todaySteps, setTodaySteps] = useState(0)
  const [week, setWeek] = useState([])
  const [tracking, setTracking] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [sessionSteps, setSessionSteps] = useState(0)
  const intervalRef = useRef(null)

  const loadWeek = () => {
    return apiJson('/steps/weekly').then((data) => {
      setWeek(data)
      setTodaySteps(data[TODAY_INDEX]?.steps || 0)
    })
  }

  useEffect(() => {
    loadWeek().catch(() => {})
  }, [])

  useEffect(() => {
    if (!tracking) return undefined
    intervalRef.current = setInterval(() => {
      setElapsedSeconds((s) => s + 1)
      setSessionSteps((steps) => {
        const perSecond = MODES[mode].stepsPerMin / 60
        // small jitter so it doesn't tick up in a perfectly straight line
        const jitter = 0.75 + Math.random() * 0.5
        return steps + perSecond * jitter
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [tracking, mode])

  const startTracking = () => {
    setElapsedSeconds(0)
    setSessionSteps(0)
    setTracking(true)
  }

  const stopTracking = async () => {
    setTracking(false)
    const steps = Math.round(sessionSteps)
    setSessionSteps(0)
    setElapsedSeconds(0)
    try {
      await apiJson('/steps/sessions', { method: 'POST', json: { mode, elapsedSeconds, steps } })
      await loadWeek()
    } catch {
      // Keep the local tally moving even if the save failed, so the UI
      // doesn't silently lose the session the user just did.
      setTodaySteps((prev) => prev + steps)
    }
  }

  const { strideM, calPerStep } = MODES[mode]
  const liveSteps = todaySteps + Math.round(sessionSteps)
  const distanceKm = (liveSteps * strideM) / 1000
  const calories = Math.round(liveSteps * calPerStep)
  const paceMinPerKm = distanceKm > 0 ? elapsedSeconds / 60 / (sessionSteps > 0 ? (sessionSteps * strideM) / 1000 : distanceKm) : 0

  const goalPct = Math.min(100, Math.round((liveSteps / DAILY_GOAL) * 100))

  const displayWeek = week.map((d, i) => (i === TODAY_INDEX ? { ...d, steps: liveSteps } : d))
  const maxSteps = Math.max(...displayWeek.map((d) => d.steps || 0), 1)

  const stats = [
    { label: 'STEPS', value: liveSteps.toLocaleString(), unit: '' },
    { label: 'DISTANCE', value: distanceKm.toFixed(2), unit: 'km' },
    { label: 'PACE', value: tracking && sessionSteps > 20 ? paceMinPerKm.toFixed(1) : '\u2014', unit: 'min/km' },
    { label: 'CALORIES', value: calories.toLocaleString(), unit: 'kcal' },
  ]

  return (
    <div className="min-vh-100 bg-white">
      <AppHeader />

      <div className="p-3 p-lg-5">
        <span
          className="small text-uppercase fw-semibold d-block mb-2"
          style={{ ...fontMono, letterSpacing: '0.14em', color: 'var(--tw-orange-700)' }}
        >
          STEP TRACKER
        </span>
        <h1 className="fw-semibold mb-2" style={{ ...fontDisplay, fontSize: 'clamp(2rem, 4vw, 2.8rem)' }}>
          Every step counts
        </h1>
        <p className="text-body-secondary mb-4" style={{ maxWidth: '48ch' }}>
          Pick a pace, start tracking, and watch today&rsquo;s numbers move.
        </p>

        {/* Mode selector */}
        <div className="btn-group mb-4" role="group" aria-label="Tracking mode">
          {Object.entries(MODES).map(([key, m]) => (
            <div key={key}>
              <input
                type="radio"
                className="btn-check"
                name="mode"
                id={`mode-${key}`}
                autoComplete="off"
                checked={mode === key}
                disabled={tracking}
                onChange={() => setMode(key)}
              />
              <label
                className={`btn btn-outline-dark fw-semibold px-4${tracking ? ' disabled' : ''}`}
                htmlFor={`mode-${key}`}
                style={tealCheckVars}
              >
                {m.label}
              </label>
            </div>
          ))}
        </div>

        {/* Scoreboard-style stat cards */}
        <div className="row row-cols-2 row-cols-lg-4 g-3 mb-4">
          {stats.map((stat) => (
            <div className="col" key={stat.label}>
              <div className="rounded-3 p-3 h-100" style={{ backgroundColor: 'var(--tw-neutral-900)' }}>
                <span className="d-block small text-white-50" style={{ ...fontMono, letterSpacing: '0.14em' }}>
                  {stat.label}
                </span>
                <span className="d-block text-white fw-semibold lh-1 mt-1" style={{ ...fontDisplay, fontSize: '2.4rem' }}>
                  {stat.value}
                  {stat.unit && (
                    <span className="fs-6 ms-1" style={{ ...fontMono, opacity: 0.6 }}>
                      {stat.unit}
                    </span>
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Start/stop + live clock */}
        <div className="d-flex align-items-center gap-3 mb-5 flex-wrap">
          {tracking ? (
            <>
              <span className="fs-3 fw-semibold" style={fontDisplay}>
                {formatClock(elapsedSeconds)}
              </span>
              <span
                className="badge rounded-pill"
                style={{ backgroundColor: 'var(--tw-orange-100)', color: 'var(--tw-orange-700)' }}
              >
                Tracking {MODES[mode].label.toLowerCase()}&hellip;
              </span>
              <button type="button" className="btn btn-outline-dark rounded-2 fw-semibold px-4" onClick={stopTracking}>
                Stop
              </button>
            </>
          ) : (
            <button type="button" className="btn rounded-2 fw-semibold px-4" style={orangeBtnVars} onClick={startTracking}>
              Start tracking
            </button>
          )}
        </div>

        {/* Daily goal */}
        <div className="mb-5" style={{ maxWidth: '32rem' }}>
          <div className="d-flex align-items-center justify-content-between mb-2">
            <span className="small fw-semibold text-uppercase" style={{ ...fontMono, letterSpacing: '0.1em' }}>
              Daily goal
            </span>
            <span className="small text-body-secondary">
              {liveSteps.toLocaleString()} / {DAILY_GOAL.toLocaleString()} steps
            </span>
          </div>
          <div
            className="progress"
            role="progressbar"
            aria-valuenow={goalPct}
            aria-valuemin="0"
            aria-valuemax="100"
            style={{ height: '10px', '--bs-progress-bg': 'var(--tw-neutral-100)' }}
          >
            <div
              className="progress-bar"
              style={{ width: `${goalPct}%`, backgroundColor: goalPct >= 100 ? 'var(--tw-teal-700)' : 'var(--tw-orange-500)' }}
            />
          </div>
          {goalPct >= 100 && (
            <span className="small mt-2 d-block" style={{ color: 'var(--tw-teal-700)' }}>
              Goal reached &mdash; nice work today.
            </span>
          )}
        </div>

        {/* Weekly chart */}
        <div style={{ maxWidth: '40rem' }}>
          <span className="small fw-semibold text-uppercase d-block mb-3" style={{ ...fontMono, letterSpacing: '0.1em' }}>
            This week
          </span>
          <div className="d-flex align-items-end gap-2 gap-lg-3" style={{ height: '160px' }}>
            {displayWeek.map((d, i) => (
              <div key={d.day} className="d-flex flex-column align-items-center flex-fill h-100 justify-content-end">
                <span className="small text-body-secondary mb-1">{d.steps == null ? '—' : `${(d.steps / 1000).toFixed(1)}k`}</span>
                <div
                  className="w-100 rounded-top-2"
                  style={{
                    height: `${Math.max(4, ((d.steps || 0) / maxSteps) * 100)}%`,
                    backgroundColor: i === TODAY_INDEX ? 'var(--tw-orange-500)' : 'var(--tw-teal-200)',
                    transition: 'height .3s ease',
                  }}
                />
                <span
                  className="small mt-2 fw-semibold"
                  style={i === TODAY_INDEX ? { color: 'var(--tw-orange-700)' } : { color: 'var(--tw-neutral-500)' }}
                >
                  {d.day}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
