import { useEffect, useRef, useState } from 'react'
import AppHeader from '../../components/AppHeader.jsx'
import { fontDisplay, fontMono, orangeBtnVars, tealCheckVars } from '../../theme.js'

const SECTIONS = [
  { key: 'chat', label: 'Chat' },
  { key: 'announcements', label: 'Announcements' },
  { key: 'journal', label: 'Journal' },
  { key: 'rewards', label: 'Rewards' },
]

/* ---------------------------------------------------------------- */
/* AI Chat                                                             */
/* ---------------------------------------------------------------- */

const CHAT_SUGGESTIONS = [
  'How much water should I drink daily?',
  'Suggest a 5-minute stretch routine',
  "What's a healthy BMI range?",
  'How do I improve my running pace?',
]

// Simple keyword-matched canned replies for the prototype. Swap for a
// real call to the Django Ninja backend once it proxies to an LLM,
// e.g. POST /api/chat { message }.
function craftReply(message) {
  const m = message.toLowerCase()
  if (m.includes('water')) {
    return 'Most adults do well with about 2\u20132.5L a day, more on days you train. Spreading it through the day works better than chugging it all at once.'
  }
  if (m.includes('stretch')) {
    return "Try this: neck rolls (30s), shoulder circles (30s), standing quad stretch (30s each side), forward fold (30s), and calf stretch against a wall (30s each side). You'll find the full routine under the Exercise Guide too."
  }
  if (m.includes('bmi')) {
    return 'A BMI between 18.5 and 24.9 is generally considered the normal range. You can calculate yours on the BMI & Diet Guide page \u2014 it\u2019ll also show tailored exercise and meal guidance.'
  }
  if (m.includes('pace') || m.includes('run')) {
    return 'To improve pace, mix in interval sessions (short fast bursts with recovery jogs) once or twice a week, alongside your regular easy runs. Track it on the Step Tracker to see your trend.'
  }
  if (m.includes('sleep')) {
    return 'Aim for 7\u20139 hours. Recovery (including sleep) matters as much as training for actually getting fitter.'
  }
  return "Good question! I'm a simple demo assistant for now \u2014 once connected to the real backend I'll be able to give more tailored answers based on your profile and activity."
}

function ChatSection() {
  const [messages, setMessages] = useState([
    { id: 'm0', from: 'assistant', text: 'Hi! Ask me anything about health, fitness or sports on campus.' },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, typing])

  const send = (text) => {
    const trimmed = text.trim()
    if (!trimmed) return
    const userMsg = { id: `u-${Date.now()}`, from: 'user', text: trimmed }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setTyping(true)
    // TODO: replace with a real request to the backend's chat endpoint.
    setTimeout(() => {
      setMessages((prev) => [...prev, { id: `a-${Date.now()}`, from: 'assistant', text: craftReply(trimmed) }])
      setTyping(false)
    }, 700)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    send(input)
  }

  return (
    <div style={{ maxWidth: '40rem' }}>
      <div className="d-flex flex-wrap gap-2 mb-3">
        {CHAT_SUGGESTIONS.map((s) => (
          <button key={s} type="button" className="btn btn-outline-dark btn-sm rounded-pill" onClick={() => send(s)}>
            {s}
          </button>
        ))}
      </div>

      <div
        ref={scrollRef}
        className="rounded-3 p-3 mb-3 d-flex flex-column gap-2"
        style={{ height: '22rem', overflowY: 'auto', backgroundColor: 'var(--tw-neutral-50)' }}
      >
        {messages.map((msg) => (
          <div key={msg.id} className={`d-flex ${msg.from === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
            <div
              className="rounded-3 px-3 py-2"
              style={{
                maxWidth: '80%',
                backgroundColor: msg.from === 'user' ? 'var(--tw-orange-500)' : '#fff',
                color: msg.from === 'user' ? '#fff' : 'inherit',
                border: msg.from === 'user' ? 'none' : '1px solid var(--tw-neutral-200)',
              }}
            >
              {msg.from === 'assistant' && (
                <span className="d-block small fw-semibold mb-1" style={{ ...fontMono, color: 'var(--tw-teal-700)' }}>
                  FITPOLY ASSISTANT
                </span>
              )}
              <span className="small">{msg.text}</span>
            </div>
          </div>
        ))}
        {typing && (
          <div className="d-flex justify-content-start">
            <div className="rounded-3 px-3 py-2 small text-body-secondary" style={{ backgroundColor: '#fff', border: '1px solid var(--tw-neutral-200)' }}>
              FitPoly Assistant is typing&hellip;
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="d-flex gap-2">
        <input
          type="text"
          className="form-control"
          placeholder="Ask about health, fitness or sports&hellip;"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" className="btn rounded-2 fw-semibold px-4" style={orangeBtnVars} disabled={!input.trim()}>
          Send
        </button>
      </form>
    </div>
  )
}

/* ---------------------------------------------------------------- */
/* Announcements                                                       */
/* ---------------------------------------------------------------- */

const ANNOUNCEMENTS = [
  { id: 'a1', title: 'Inter-Poly Futsal Tournament', date: '25 Jul 2026', category: 'Tournament', body: 'Sign-ups are open for the annual inter-poly futsal tournament. Teams of 7, register through Sports Affair.' },
  { id: 'a2', title: 'Badminton Court Resurfacing', date: '22 Jul 2026', category: 'Notice', body: 'Court 2 will be closed for resurfacing from 22\u201324 Jul. Bookings during this period will use Court 1 only.' },
  { id: 'a3', title: 'Free Stretch & Mobility Workshop', date: '20 Jul 2026', category: 'Workshop', body: 'Drop in for a free 45-minute mobility workshop run by the Sports Affair coaching team, no booking needed.' },
  { id: 'a4', title: 'New Equipment: Yoga Mats', date: '17 Jul 2026', category: 'Notice', body: 'Yoga mats have been added to the equipment list and are now available to book.' },
]

const ANNOUNCEMENT_COLORS = {
  Tournament: 'var(--tw-orange-600)',
  Workshop: 'var(--tw-teal-700)',
  Notice: 'var(--tw-sky-600)',
}

function AnnouncementsSection() {
  return (
    <div className="d-flex flex-column gap-3" style={{ maxWidth: '40rem' }}>
      {ANNOUNCEMENTS.map((a) => (
        <div className="card" key={a.id}>
          <div className="card-body">
            <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
              <span className="badge rounded-pill" style={{ backgroundColor: ANNOUNCEMENT_COLORS[a.category], color: '#fff' }}>
                {a.category}
              </span>
              <span className="small text-body-secondary">{a.date}</span>
            </div>
            <h3 className="fw-semibold mb-2" style={{ ...fontDisplay, fontSize: '1.3rem' }}>
              {a.title}
            </h3>
            <p className="small text-body-secondary mb-0">{a.body}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ---------------------------------------------------------------- */
/* Journal                                                              */
/* ---------------------------------------------------------------- */

const MOODS = [
  { key: 'great', emoji: '\ud83d\ude04', label: 'Great' },
  { key: 'good', emoji: '\ud83d\ude42', label: 'Good' },
  { key: 'okay', emoji: '\ud83d\ude10', label: 'Okay' },
  { key: 'tired', emoji: '\ud83d\ude2b', label: 'Tired' },
]

const INITIAL_ENTRIES = [
  { id: 'j1', date: '16 Jul 2026', mood: 'good', text: 'Booked the futsal court after class. Legs a bit sore but felt good to move.' },
  { id: 'j2', date: '14 Jul 2026', mood: 'great', text: 'Hit my step goal for the third day in a row. Feeling more energetic overall.' },
]

function JournalSection() {
  const [entries, setEntries] = useState(INITIAL_ENTRIES)
  const [draft, setDraft] = useState('')
  const [mood, setMood] = useState('good')

  const saveEntry = (e) => {
    e.preventDefault()
    if (!draft.trim()) return
    // TODO: POST /api/journal { mood, text }
    const entry = {
      id: `j-${Date.now()}`,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      mood,
      text: draft.trim(),
    }
    setEntries((prev) => [entry, ...prev])
    setDraft('')
  }

  return (
    <div style={{ maxWidth: '40rem' }}>
      <form onSubmit={saveEntry} className="card mb-4">
        <div className="card-body">
          <label className="form-label small fw-semibold d-block">How are you feeling today?</label>
          <div className="d-flex gap-2 mb-3">
            {MOODS.map((m) => (
              <button
                key={m.key}
                type="button"
                className="btn rounded-2"
                onClick={() => setMood(m.key)}
                style={{
                  border: mood === m.key ? '2px solid var(--tw-teal-700)' : '2px solid var(--tw-neutral-200)',
                  backgroundColor: mood === m.key ? 'var(--tw-teal-50)' : 'transparent',
                }}
                aria-pressed={mood === m.key}
              >
                <span style={{ fontSize: '1.25rem' }}>{m.emoji}</span>
                <span className="d-block small mt-1">{m.label}</span>
              </button>
            ))}
          </div>
          <textarea
            className="form-control mb-3"
            rows={3}
            placeholder="Write a quick note about today&hellip;"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <button type="submit" className="btn rounded-2 fw-semibold px-4" style={orangeBtnVars} disabled={!draft.trim()}>
            Save entry
          </button>
        </div>
      </form>

      <div className="d-flex flex-column gap-2">
        {entries.map((entry) => {
          const moodMeta = MOODS.find((m) => m.key === entry.mood)
          return (
            <div className="card" key={entry.id}>
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between mb-1">
                  <span className="small fw-semibold">
                    {moodMeta?.emoji} {moodMeta?.label}
                  </span>
                  <span className="small text-body-secondary">{entry.date}</span>
                </div>
                <p className="small mb-0">{entry.text}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- */
/* Rewards                                                              */
/* ---------------------------------------------------------------- */

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const TODAY_INDEX = 3 // Thursday

const BADGES = [
  { key: 'first-booking', label: 'First Booking', earned: true },
  { key: '7-day-streak', label: '7-Day Streak', earned: true },
  { key: 'step-goal-5x', label: 'Step Goal x5', earned: false },
  { key: 'journal-keeper', label: 'Journal Keeper', earned: false },
]

function RewardsSection() {
  const [points, setPoints] = useState(320)
  const [streak, setStreak] = useState(3)
  const [claimedToday, setClaimedToday] = useState(false)

  const claim = () => {
    if (claimedToday) return
    // TODO: POST /api/rewards/daily-claim
    setPoints((p) => p + 10)
    setStreak((s) => s + 1)
    setClaimedToday(true)
  }

  return (
    <div style={{ maxWidth: '40rem' }}>
      <div className="row row-cols-2 g-3 mb-4">
        <div className="col">
          <div className="rounded-3 p-3 h-100" style={{ backgroundColor: 'var(--tw-neutral-900)' }}>
            <span className="d-block small text-white-50" style={{ ...fontMono, letterSpacing: '0.14em' }}>
              POINTS
            </span>
            <span className="d-block text-white fw-semibold lh-1 mt-1" style={{ ...fontDisplay, fontSize: '2.4rem' }}>
              {points}
            </span>
          </div>
        </div>
        <div className="col">
          <div className="rounded-3 p-3 h-100" style={{ backgroundColor: 'var(--tw-neutral-900)' }}>
            <span className="d-block small text-white-50" style={{ ...fontMono, letterSpacing: '0.14em' }}>
              LOGIN STREAK
            </span>
            <span className="d-block text-white fw-semibold lh-1 mt-1" style={{ ...fontDisplay, fontSize: '2.4rem' }}>
              {streak} <span className="fs-6" style={{ ...fontMono, opacity: 0.6 }}>days</span>
            </span>
          </div>
        </div>
      </div>

      <div className="d-flex align-items-center gap-3 mb-2">
        {WEEK_DAYS.map((day, i) => (
          <div key={day} className="d-flex flex-column align-items-center gap-1">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{
                width: '2rem',
                height: '2rem',
                backgroundColor: i < TODAY_INDEX || (i === TODAY_INDEX && claimedToday) ? 'var(--tw-teal-700)' : 'var(--tw-neutral-100)',
                color: i < TODAY_INDEX || (i === TODAY_INDEX && claimedToday) ? '#fff' : 'var(--tw-neutral-400)',
              }}
            >
              {(i < TODAY_INDEX || (i === TODAY_INDEX && claimedToday)) && (
                <svg width="12" height="12" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M4 10.5L8 14.5L16 5.5" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span className="small text-body-secondary">{day}</span>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="btn rounded-2 fw-semibold px-4 mb-5"
        style={orangeBtnVars}
        onClick={claim}
        disabled={claimedToday}
      >
        {claimedToday ? "Today's reward claimed" : 'Claim daily reward (+10 pts)'}
      </button>

      <span className="small fw-semibold text-uppercase d-block mb-3" style={{ ...fontMono, letterSpacing: '0.1em' }}>
        Badges
      </span>
      <div className="row row-cols-2 row-cols-sm-4 g-3">
        {BADGES.map((b) => (
          <div className="col" key={b.key}>
            <div
              className="card h-100 text-center"
              style={!b.earned ? { opacity: 0.5, filter: 'grayscale(0.6)' } : undefined}
            >
              <div className="card-body py-3">
                <div
                  className="rounded-circle d-inline-flex align-items-center justify-content-center mb-2"
                  style={{ width: '2.5rem', height: '2.5rem', backgroundColor: 'var(--tw-amber-100)' }}
                >
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path
                      d="M10 2l2.2 4.5 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5L2.8 7.2l5-.7L10 2z"
                      fill="var(--tw-amber-500)"
                    />
                  </svg>
                </div>
                <span className="d-block small fw-semibold">{b.label}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- */
/* Page shell                                                          */
/* ---------------------------------------------------------------- */

export default function ChatRewards() {
  const [section, setSection] = useState('chat')

  return (
    <div className="min-vh-100 bg-white">
      <AppHeader />

      <div className="p-3 p-lg-5">
        <span
          className="small text-uppercase fw-semibold d-block mb-2"
          style={{ ...fontMono, letterSpacing: '0.14em', color: 'var(--tw-orange-700)' }}
        >
          CHAT &amp; REWARDS
        </span>
        <h1 className="fw-semibold mb-2" style={{ ...fontDisplay, fontSize: 'clamp(2rem, 4vw, 2.8rem)' }}>
          Ask, log, and earn
        </h1>
        <p className="text-body-secondary mb-4" style={{ maxWidth: '48ch' }}>
          Chat about health and sports, catch up on announcements, journal your day, and keep your streak going.
        </p>

        <div className="btn-group mb-4 flex-wrap" role="group" aria-label="Section">
          {SECTIONS.map((s) => (
            <div key={s.key}>
              <input
                type="radio"
                className="btn-check"
                name="chat-rewards-section"
                id={`crs-${s.key}`}
                autoComplete="off"
                checked={section === s.key}
                onChange={() => setSection(s.key)}
              />
              <label className="btn btn-outline-dark fw-semibold px-3 px-lg-4" htmlFor={`crs-${s.key}`} style={tealCheckVars}>
                {s.label}
              </label>
            </div>
          ))}
        </div>

        {section === 'chat' && <ChatSection />}
        {section === 'announcements' && <AnnouncementsSection />}
        {section === 'journal' && <JournalSection />}
        {section === 'rewards' && <RewardsSection />}
      </div>
    </div>
  )
}
