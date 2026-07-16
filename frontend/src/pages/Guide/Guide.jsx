import { useState } from 'react'
import AppHeader from '../../components/AppHeader.jsx'
import { fontDisplay, fontMono, tealCheckVars } from '../../theme.js'

const SECTIONS = [
  { key: 'bmi', label: 'BMI & Diet Guide' },
  { key: 'exercise', label: 'Exercise Guide' },
]

/* ---------------------------------------------------------------- */
/* BMI & Diet Guide                                                  */
/* ---------------------------------------------------------------- */

const BMI_CATEGORIES = [
  { key: 'underweight', label: 'Underweight', range: 'below 18.5', color: 'var(--tw-sky-600)' },
  { key: 'normal', label: 'Normal', range: '18.5 \u2013 24.9', color: 'var(--tw-teal-700)' },
  { key: 'overweight', label: 'Overweight', range: '25 \u2013 29.9', color: 'var(--tw-amber-500)' },
  { key: 'obese', label: 'Obese', range: '30 and above', color: 'var(--tw-orange-600)' },
]

function classifyBmi(bmi) {
  if (bmi < 18.5) return BMI_CATEGORIES[0]
  if (bmi < 25) return BMI_CATEGORIES[1]
  if (bmi < 30) return BMI_CATEGORIES[2]
  return BMI_CATEGORIES[3]
}

// Modelled as "posts" on purpose: an admin panel will eventually edit
// this content per category, so the page reads it from data rather
// than hardcoding it into the layout.
const GUIDANCE_POSTS = {
  underweight: [
    { key: 'exercise', title: 'Exercise', body: 'Focus on strength training 3\u20134x a week to build muscle, alongside light cardio.' },
    { key: 'meals', title: 'Meal recommendations', body: 'Add calorie-dense, nutrient-rich foods \u2014 nuts, whole milk, avocado \u2014 and an extra meal or snack a day.' },
    { key: 'water', title: 'Water intake', body: 'Aim for about 2.5L a day, spaced through meals rather than all at once.' },
    { key: 'calories', title: 'Daily calories', body: 'Target roughly 300\u2013500 kcal above your maintenance level to gain weight steadily.' },
  ],
  normal: [
    { key: 'exercise', title: 'Exercise', body: 'Keep a balanced mix: 2\u20133 strength sessions and 2\u20133 cardio sessions a week.' },
    { key: 'meals', title: 'Meal recommendations', body: 'Aim for a balanced plate \u2014 half vegetables, a quarter protein, a quarter whole grains.' },
    { key: 'water', title: 'Water intake', body: 'Aim for about 2\u20132.5L a day, more on training days.' },
    { key: 'calories', title: 'Daily calories', body: 'Eat around your maintenance level to stay at your current, healthy weight.' },
  ],
  overweight: [
    { key: 'exercise', title: 'Exercise', body: 'Prioritise cardio 4\u20135x a week (brisk walking, jogging) plus 2 strength sessions.' },
    { key: 'meals', title: 'Meal recommendations', body: 'Cut back on refined carbs and sugary drinks; fill half your plate with vegetables.' },
    { key: 'water', title: 'Water intake', body: 'Aim for about 2.5\u20133L a day \u2014 a glass before meals can help with portion control.' },
    { key: 'calories', title: 'Daily calories', body: 'Target a modest deficit of 300\u2013500 kcal below maintenance for gradual, sustainable loss.' },
  ],
  obese: [
    { key: 'exercise', title: 'Exercise', body: 'Start with low-impact cardio (walking, swimming) 4\u20135x a week; add strength training gradually.' },
    { key: 'meals', title: 'Meal recommendations', body: 'Work with whole foods and smaller portions, and cut back processed or fried food first.' },
    { key: 'water', title: 'Water intake', body: 'Aim for about 3L a day, and swap sugary drinks for water where you can.' },
    { key: 'calories', title: 'Daily calories', body: 'Aim for a steady deficit of 500\u2013750 kcal below maintenance \u2014 worth checking in with a doctor first.' },
  ],
}

function BmiDietSection() {
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')

  const h = Number(height)
  const w = Number(weight)
  const bmi = h > 0 && w > 0 ? w / (h / 100) ** 2 : null
  const category = bmi ? classifyBmi(bmi) : null
  const posts = category ? GUIDANCE_POSTS[category.key] : null

  return (
    <div>
      {/* Calculator */}
      <div className="row g-3 align-items-end mb-4" style={{ maxWidth: '36rem' }}>
        <div className="col-6 col-sm-4">
          <label htmlFor="bmi-height" className="form-label small fw-semibold">
            Height
          </label>
          <div className="input-group">
            <input
              id="bmi-height"
              type="number"
              inputMode="decimal"
              min="0"
              className="form-control"
              placeholder="170"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
            />
            <span className="input-group-text">cm</span>
          </div>
        </div>
        <div className="col-6 col-sm-4">
          <label htmlFor="bmi-weight" className="form-label small fw-semibold">
            Weight
          </label>
          <div className="input-group">
            <input
              id="bmi-weight"
              type="number"
              inputMode="decimal"
              min="0"
              className="form-control"
              placeholder="60"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
            <span className="input-group-text">kg</span>
          </div>
        </div>
        <div className="col-12 col-sm-4">
          {bmi ? (
            <div className="rounded-3 p-2 px-3 d-inline-flex flex-column" style={{ backgroundColor: 'var(--tw-neutral-900)' }}>
              <span className="small text-white-50" style={fontMono}>
                YOUR BMI
              </span>
              <span className="text-white fw-semibold lh-1" style={{ ...fontDisplay, fontSize: '2rem' }}>
                {bmi.toFixed(1)}
                <span className="fs-6 ms-2" style={{ color: category.color }}>
                  {category.label}
                </span>
              </span>
            </div>
          ) : (
            <p className="small text-body-secondary mb-0">Enter your height and weight to see your BMI.</p>
          )}
        </div>
      </div>

      {/* BMI scale reference */}
      <div className="d-flex flex-wrap gap-2 mb-5">
        {BMI_CATEGORIES.map((c) => (
          <span
            key={c.key}
            className="badge rounded-pill"
            style={
              category?.key === c.key
                ? { backgroundColor: c.color, color: '#fff' }
                : { backgroundColor: 'var(--tw-neutral-100)', color: 'var(--tw-neutral-600)' }
            }
          >
            {c.label} &middot; {c.range}
          </span>
        ))}
      </div>

      {/* Guidance posts */}
      <span className="small fw-semibold text-uppercase d-block mb-3" style={{ ...fontMono, letterSpacing: '0.1em' }}>
        {category ? `Recommended for ${category.label.toLowerCase()} BMI` : 'Guidance'}
      </span>

      {!posts ? (
        <p className="text-body-secondary" style={{ maxWidth: '48ch' }}>
          Calculate your BMI above to see tailored exercise, meal, water and calorie guidance.
        </p>
      ) : (
        <div className="row row-cols-1 row-cols-sm-2 g-3">
          {posts.map((post) => (
            <div className="col" key={post.key}>
              <div className="card h-100 border-0" style={{ backgroundColor: 'var(--tw-teal-50)' }}>
                <div className="card-body">
                  <h3 className="fw-semibold mb-2" style={{ ...fontDisplay, fontSize: '1.4rem' }}>
                    {post.title}
                  </h3>
                  <p className="mb-3 text-body-secondary">{post.body}</p>
                  <span className="small" style={{ ...fontMono, color: 'var(--tw-teal-700)', opacity: 0.7 }}>
                    Updated by admin &middot; 1 Jul 2026
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ---------------------------------------------------------------- */
/* Exercise Guide                                                     */
/* ---------------------------------------------------------------- */

const EXERCISE_CATEGORIES = {
  stretching: { label: 'Stretching', color: 'var(--tw-teal-700)' },
  strength: { label: 'Strength Training', color: 'var(--tw-orange-600)' },
}

const EXERCISE_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'stretching', label: 'Stretching' },
  { key: 'strength', label: 'Strength Training' },
]

const EXERCISES = [
  {
    id: 'ex-1',
    title: '5-Minute Full Body Stretch',
    category: 'stretching',
    duration: '5 min',
    level: 'Beginner',
    description: 'A quick head-to-toe stretch routine to loosen up before or after activity.',
  },
  {
    id: 'ex-2',
    title: 'Dynamic Warm-Up Routine',
    category: 'stretching',
    duration: '8 min',
    level: 'Beginner',
    description: 'Mobility-focused movement to prep your joints before a workout.',
  },
  {
    id: 'ex-3',
    title: 'Post-Workout Cool Down',
    category: 'stretching',
    duration: '6 min',
    level: 'Beginner',
    description: 'Static stretches to bring your heart rate down and ease muscle soreness.',
  },
  {
    id: 'ex-4',
    title: 'Bodyweight Strength Circuit',
    category: 'strength',
    duration: '20 min',
    level: 'Intermediate',
    description: 'A no-equipment circuit covering push, pull and leg movements.',
  },
  {
    id: 'ex-5',
    title: 'Beginner Push-Up Progression',
    category: 'strength',
    duration: '10 min',
    level: 'Beginner',
    description: 'Step-by-step push-up variations to build up to a full rep.',
  },
  {
    id: 'ex-6',
    title: 'Core Stability Basics',
    category: 'strength',
    duration: '12 min',
    level: 'Beginner',
    description: 'Planks, dead bugs and bird dogs for a stronger core.',
  },
]

function youtubeSearchUrl(title) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(`${title} tutorial`)}`
}

function ExerciseGuideSection() {
  const [filter, setFilter] = useState('all')
  const filtered = filter === 'all' ? EXERCISES : EXERCISES.filter((ex) => ex.category === filter)

  return (
    <div>
      <div className="btn-group mb-4 flex-wrap" role="group" aria-label="Filter exercises">
        {EXERCISE_FILTERS.map((f) => (
          <div key={f.key}>
            <input
              type="radio"
              className="btn-check"
              name="exercise-filter"
              id={`ex-filter-${f.key}`}
              autoComplete="off"
              checked={filter === f.key}
              onChange={() => setFilter(f.key)}
            />
            <label className="btn btn-outline-dark fw-semibold px-3" htmlFor={`ex-filter-${f.key}`} style={tealCheckVars}>
              {f.label}
            </label>
          </div>
        ))}
      </div>

      <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-3 g-lg-4">
        {filtered.map((ex) => {
          const meta = EXERCISE_CATEGORIES[ex.category]
          return (
            <div className="col" key={ex.id}>
              <div className="card h-100">
                <div
                  className="d-flex align-items-center justify-content-center"
                  style={{ aspectRatio: '16 / 9', backgroundColor: 'var(--tw-neutral-900)' }}
                >
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: '3rem', height: '3rem', backgroundColor: 'rgba(255,255,255,0.15)' }}
                  >
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                      <path d="M6 4.5l10 5.5-10 5.5v-11z" fill="#fff" />
                    </svg>
                  </div>
                </div>
                <div className="card-body d-flex flex-column">
                  <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                    <span className="badge rounded-pill" style={{ backgroundColor: meta.color, color: '#fff' }}>
                      {meta.label}
                    </span>
                    <span className="small text-body-secondary">
                      {ex.duration} &middot; {ex.level}
                    </span>
                  </div>
                  <h3 className="fw-semibold mb-2" style={{ ...fontDisplay, fontSize: '1.3rem' }}>
                    {ex.title}
                  </h3>
                  <p className="small text-body-secondary mb-3 flex-grow-1">{ex.description}</p>
                  <a
                    href={youtubeSearchUrl(ex.title)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-dark btn-sm rounded-2 align-self-start"
                  >
                    Watch on YouTube
                  </a>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- */
/* Page shell                                                         */
/* ---------------------------------------------------------------- */

export default function Guide() {
  const [section, setSection] = useState('bmi')

  return (
    <div className="min-vh-100 bg-white">
      <AppHeader />

      <div className="p-3 p-lg-5">
        <span
          className="small text-uppercase fw-semibold d-block mb-2"
          style={{ ...fontMono, letterSpacing: '0.14em', color: 'var(--tw-orange-700)' }}
        >
          KNOW YOUR NUMBERS
        </span>
        <h1 className="fw-semibold mb-2" style={{ ...fontDisplay, fontSize: 'clamp(2rem, 4vw, 2.8rem)' }}>
          BMI &amp; Exercise Guide
        </h1>
        <p className="text-body-secondary mb-4" style={{ maxWidth: '48ch' }}>
          Check your BMI status, and browse simple tutorials to get moving.
        </p>

        <div className="btn-group mb-4" role="group" aria-label="Guide section">
          {SECTIONS.map((s) => (
            <div key={s.key}>
              <input
                type="radio"
                className="btn-check"
                name="section"
                id={`section-${s.key}`}
                autoComplete="off"
                checked={section === s.key}
                onChange={() => setSection(s.key)}
              />
              <label className="btn btn-outline-dark fw-semibold px-4" htmlFor={`section-${s.key}`} style={tealCheckVars}>
                {s.label}
              </label>
            </div>
          ))}
        </div>

        {section === 'bmi' ? <BmiDietSection /> : <ExerciseGuideSection />}
      </div>
    </div>
  )
}
