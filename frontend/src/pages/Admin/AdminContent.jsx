import { useState } from 'react'
import AdminShell from '../../components/AdminShell.jsx'
import { fontDisplay, fontMono, orangeBtnVars, tealCheckVars } from '../../theme.js'

const SECTIONS = [
  { key: 'bmi', label: 'BMI & Diet Posts' },
  { key: 'exercise', label: 'Exercise Tutorials' },
]

/* ---------------------------------------------------------------- */
/* BMI & Diet posts -- fixed taxonomy (4 categories x 4 post types), */
/* so this is an in-place editor rather than free-form add/delete.   */
/* ---------------------------------------------------------------- */

const BMI_CATEGORIES = [
  { key: 'underweight', label: 'Underweight' },
  { key: 'normal', label: 'Normal' },
  { key: 'overweight', label: 'Overweight' },
  { key: 'obese', label: 'Obese' },
]

const INITIAL_GUIDANCE_POSTS = {
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

function BmiPostsEditor() {
  const [posts, setPosts] = useState(INITIAL_GUIDANCE_POSTS)
  const [category, setCategory] = useState('normal')
  const [savedKey, setSavedKey] = useState(null)

  const updateBody = (postKey, value) => {
    setPosts((prev) => ({
      ...prev,
      [category]: prev[category].map((p) => (p.key === postKey ? { ...p, body: value } : p)),
    }))
  }

  const savePost = (postKey) => {
    // TODO: PATCH /api/admin/content/bmi/:category/:postKey { body }
    setSavedKey(postKey)
    setTimeout(() => setSavedKey((k) => (k === postKey ? null : k)), 2000)
  }

  return (
    <div>
      <div className="btn-group mb-4 flex-wrap" role="group" aria-label="BMI category">
        {BMI_CATEGORIES.map((c) => (
          <div key={c.key}>
            <input
              type="radio"
              className="btn-check"
              name="bmi-category"
              id={`cat-${c.key}`}
              autoComplete="off"
              checked={category === c.key}
              onChange={() => setCategory(c.key)}
            />
            <label className="btn btn-outline-dark fw-semibold px-3" htmlFor={`cat-${c.key}`} style={tealCheckVars}>
              {c.label}
            </label>
          </div>
        ))}
      </div>

      <div className="row row-cols-1 row-cols-sm-2 g-3">
        {posts[category].map((post) => (
          <div className="col" key={post.key}>
            <div className="card h-100">
              <div className="card-body d-flex flex-column">
                <h3 className="fw-semibold mb-2" style={{ ...fontDisplay, fontSize: '1.3rem' }}>
                  {post.title}
                </h3>
                <textarea
                  className="form-control mb-3 flex-grow-1"
                  rows={4}
                  value={post.body}
                  onChange={(e) => updateBody(post.key, e.target.value)}
                />
                <div className="d-flex align-items-center gap-3">
                  <button type="button" className="btn btn-outline-dark btn-sm" onClick={() => savePost(post.key)}>
                    Save
                  </button>
                  {savedKey === post.key && (
                    <span className="small" style={{ color: 'var(--tw-teal-700)' }}>
                      Saved
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- */
/* Exercise tutorials -- open-ended list, full add/edit/delete.       */
/* ---------------------------------------------------------------- */

const EXERCISE_CATEGORIES = [
  { key: 'stretching', label: 'Stretching' },
  { key: 'strength', label: 'Strength Training' },
]

const INITIAL_EXERCISES = [
  { id: 'ex-1', title: '5-Minute Full Body Stretch', category: 'stretching', duration: '5 min', level: 'Beginner', description: 'A quick head-to-toe stretch routine to loosen up before or after activity.' },
  { id: 'ex-2', title: 'Dynamic Warm-Up Routine', category: 'stretching', duration: '8 min', level: 'Beginner', description: 'Mobility-focused movement to prep your joints before a workout.' },
  { id: 'ex-3', title: 'Post-Workout Cool Down', category: 'stretching', duration: '6 min', level: 'Beginner', description: 'Static stretches to bring your heart rate down and ease muscle soreness.' },
  { id: 'ex-4', title: 'Bodyweight Strength Circuit', category: 'strength', duration: '20 min', level: 'Intermediate', description: 'A no-equipment circuit covering push, pull and leg movements.' },
  { id: 'ex-5', title: 'Beginner Push-Up Progression', category: 'strength', duration: '10 min', level: 'Beginner', description: 'Step-by-step push-up variations to build up to a full rep.' },
  { id: 'ex-6', title: 'Core Stability Basics', category: 'strength', duration: '12 min', level: 'Beginner', description: 'Planks, dead bugs and bird dogs for a stronger core.' },
]

const emptyExerciseForm = { title: '', category: 'stretching', duration: '', level: 'Beginner', description: '' }

function ExerciseTutorialsEditor() {
  const [exercises, setExercises] = useState(INITIAL_EXERCISES)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyExerciseForm)

  const openAdd = () => {
    setEditingId(null)
    setForm(emptyExerciseForm)
    setModalOpen(true)
  }

  const openEdit = (ex) => {
    setEditingId(ex.id)
    setForm({ title: ex.title, category: ex.category, duration: ex.duration, level: ex.level, description: ex.description })
    setModalOpen(true)
  }

  const save = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    // TODO: POST /api/admin/content/exercises (new) or PATCH .../:id (edit)
    if (editingId) {
      setExercises((prev) => prev.map((ex) => (ex.id === editingId ? { ...ex, ...form } : ex)))
    } else {
      setExercises((prev) => [...prev, { id: `ex-${Date.now()}`, ...form }])
    }
    setModalOpen(false)
  }

  const remove = (id) => {
    // TODO: DELETE /api/admin/content/exercises/:id
    setExercises((prev) => prev.filter((ex) => ex.id !== id))
  }

  return (
    <div>
      <div className="d-flex justify-content-end mb-4">
        <button type="button" className="btn rounded-2 fw-semibold px-4" style={orangeBtnVars} onClick={openAdd}>
          + Add tutorial
        </button>
      </div>

      <div className="table-responsive">
        <table className="table align-middle">
          <thead>
            <tr>
              <th className="small text-uppercase text-body-secondary fw-semibold" style={fontMono}>
                Title
              </th>
              <th className="small text-uppercase text-body-secondary fw-semibold" style={fontMono}>
                Category
              </th>
              <th className="small text-uppercase text-body-secondary fw-semibold" style={fontMono}>
                Duration &amp; Level
              </th>
              <th className="small text-uppercase text-body-secondary fw-semibold text-end" style={fontMono}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {exercises.map((ex) => (
              <tr key={ex.id}>
                <td>
                  <span className="d-block fw-semibold">{ex.title}</span>
                  <span className="d-block small text-body-secondary text-truncate" style={{ maxWidth: '28rem' }}>
                    {ex.description}
                  </span>
                </td>
                <td>
                  <span
                    className="badge rounded-pill"
                    style={{
                      backgroundColor: ex.category === 'strength' ? 'var(--tw-orange-600)' : 'var(--tw-teal-700)',
                      color: '#fff',
                    }}
                  >
                    {EXERCISE_CATEGORIES.find((c) => c.key === ex.category)?.label}
                  </span>
                </td>
                <td className="small text-body-secondary">
                  {ex.duration} &middot; {ex.level}
                </td>
                <td className="text-end">
                  <div className="d-inline-flex gap-2">
                    <button type="button" className="btn btn-outline-dark btn-sm" onClick={() => openEdit(ex)}>
                      Edit
                    </button>
                    <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => remove(ex.id)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <>
          <div className="modal-backdrop show" onClick={() => setModalOpen(false)} />
          <div className="modal d-block" tabIndex="-1" role="dialog" aria-modal="true" onClick={() => setModalOpen(false)}>
            <div className="modal-dialog modal-dialog-centered" role="document" onClick={(e) => e.stopPropagation()}>
              <form className="modal-content" onSubmit={save}>
                <div className="modal-header">
                  <h5 className="modal-title fw-semibold mb-0" style={fontDisplay}>
                    {editingId ? 'Edit tutorial' : 'Add tutorial'}
                  </h5>
                  <button type="button" className="btn-close" aria-label="Close" onClick={() => setModalOpen(false)} />
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="ex-title" className="form-label small fw-semibold">
                      Title
                    </label>
                    <input
                      id="ex-title"
                      type="text"
                      className="form-control"
                      value={form.title}
                      onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                      autoFocus
                      required
                    />
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label htmlFor="ex-category" className="form-label small fw-semibold">
                        Category
                      </label>
                      <select
                        id="ex-category"
                        className="form-select"
                        value={form.category}
                        onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                      >
                        {EXERCISE_CATEGORIES.map((c) => (
                          <option key={c.key} value={c.key}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-6">
                      <label htmlFor="ex-level" className="form-label small fw-semibold">
                        Level
                      </label>
                      <select
                        id="ex-level"
                        className="form-select"
                        value={form.level}
                        onChange={(e) => setForm((prev) => ({ ...prev, level: e.target.value }))}
                      >
                        <option>Beginner</option>
                        <option>Intermediate</option>
                        <option>Advanced</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="ex-duration" className="form-label small fw-semibold">
                      Duration
                    </label>
                    <input
                      id="ex-duration"
                      type="text"
                      className="form-control"
                      placeholder="e.g. 10 min"
                      value={form.duration}
                      onChange={(e) => setForm((prev) => ({ ...prev, duration: e.target.value }))}
                    />
                  </div>
                  <div className="mb-1">
                    <label htmlFor="ex-description" className="form-label small fw-semibold">
                      Description
                    </label>
                    <textarea
                      id="ex-description"
                      className="form-control"
                      rows={3}
                      value={form.description}
                      onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-dark" onClick={() => setModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn rounded-2 fw-semibold" style={orangeBtnVars}>
                    {editingId ? 'Save changes' : 'Add tutorial'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

/* ---------------------------------------------------------------- */
/* Page shell                                                         */
/* ---------------------------------------------------------------- */

export default function AdminContent() {
  const [section, setSection] = useState('bmi')

  return (
    <AdminShell>
      <div className="p-3 p-lg-5">
        <span
          className="small text-uppercase fw-semibold d-block mb-2"
          style={{ ...fontMono, letterSpacing: '0.14em', color: 'var(--tw-orange-700)' }}
        >
          CONTENT
        </span>
        <h1 className="fw-semibold mb-2" style={{ ...fontDisplay, fontSize: 'clamp(2rem, 4vw, 2.8rem)' }}>
          Manage content
        </h1>
        <p className="text-body-secondary mb-4" style={{ maxWidth: '48ch' }}>
          Edit the guidance students and staff see on the BMI &amp; Exercise Guide page.
        </p>

        <div className="btn-group mb-4" role="group" aria-label="Content section">
          {SECTIONS.map((s) => (
            <div key={s.key}>
              <input
                type="radio"
                className="btn-check"
                name="content-section"
                id={`content-section-${s.key}`}
                autoComplete="off"
                checked={section === s.key}
                onChange={() => setSection(s.key)}
              />
              <label className="btn btn-outline-dark fw-semibold px-4" htmlFor={`content-section-${s.key}`} style={tealCheckVars}>
                {s.label}
              </label>
            </div>
          ))}
        </div>

        {section === 'bmi' ? <BmiPostsEditor /> : <ExerciseTutorialsEditor />}
      </div>
    </AdminShell>
  )
}
