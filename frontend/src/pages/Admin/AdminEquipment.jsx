import { useEffect, useState } from 'react'
import AdminShell from '../../components/AdminShell.jsx'
import { fontDisplay, fontMono, orangeBtnVars } from '../../theme.js'
import { RacketIcon, BallIcon, PaddleIcon, RopeIcon, FrisbeeIcon } from '../Equipment/equipmentIcons.jsx'

const ICON_OPTIONS = [
  { key: 'racket', label: 'Racket', Icon: RacketIcon },
  { key: 'ball-orange', label: 'Ball (orange)', Icon: () => <BallIcon color="var(--tw-orange-600)" /> },
  { key: 'ball-teal', label: 'Ball (teal)', Icon: () => <BallIcon color="var(--tw-teal-700)" /> },
  { key: 'ball-dark', label: 'Ball (dark)', Icon: () => <BallIcon color="var(--tw-neutral-900)" /> },
  { key: 'ball-amber', label: 'Ball (amber)', Icon: () => <BallIcon color="var(--tw-amber-500)" /> },
  { key: 'paddle', label: 'Paddle', Icon: PaddleIcon },
  { key: 'rope', label: 'Rope', Icon: RopeIcon },
  { key: 'frisbee', label: 'Frisbee', Icon: FrisbeeIcon },
]

function iconFor(key) {
  return ICON_OPTIONS.find((opt) => opt.key === key)?.Icon ?? ICON_OPTIONS[0].Icon
}

// Mock catalogue -- real data via GET/POST/PATCH/DELETE /api/admin/equipment.
const INITIAL_EQUIPMENT = [
  { id: 'badminton-racket', name: 'Badminton Racket', iconKey: 'racket', available: true, borrower: null },
  { id: 'basketball', name: 'Basketball', iconKey: 'ball-orange', available: true, borrower: null },
  { id: 'futsal-ball', name: 'Futsal Ball', iconKey: 'ball-teal', available: true, borrower: null },
  { id: 'table-tennis-paddle', name: 'Table Tennis Paddle', iconKey: 'paddle', available: true, borrower: null },
  { id: 'jump-rope', name: 'Jump Rope', iconKey: 'rope', available: true, borrower: null },
  { id: 'football', name: 'Football', iconKey: 'ball-dark', available: false, borrower: { name: 'Ahmad Faiz', id: '21DTK21F1002' } },
  { id: 'volleyball', name: 'Volleyball', iconKey: 'ball-amber', available: false, borrower: { name: 'Nur Aisyah', id: 'STF-0031' } },
  { id: 'frisbee', name: 'Frisbee', iconKey: 'frisbee', available: false, borrower: { name: 'Haziq Rahman', id: '21DEE22F0456' } },
]

const emptyForm = { name: '', iconKey: ICON_OPTIONS[0].key, available: true }

export default function AdminEquipment() {
  const [items, setItems] = useState(INITIAL_EQUIPMENT)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [undo, setUndo] = useState(null) // { item, index }

  useEffect(() => {
    if (!undo) return undefined
    const timer = setTimeout(() => setUndo(null), 6000)
    return () => clearTimeout(timer)
  }, [undo])

  const openAddModal = () => {
    setEditingId(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEditModal = (item) => {
    setEditingId(item.id)
    setForm({ name: item.name, iconKey: item.iconKey, available: item.available })
    setModalOpen(true)
  }

  const closeModal = () => setModalOpen(false)

  const saveItem = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    // TODO: POST /api/admin/equipment (new) or PATCH /api/admin/equipment/:id (edit).
    if (editingId) {
      setItems((prev) =>
        prev.map((it) => (it.id === editingId ? { ...it, name: form.name, iconKey: form.iconKey, available: form.available } : it))
      )
    } else {
      const id = form.name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      setItems((prev) => [...prev, { id: id || `item-${Date.now()}`, name: form.name, iconKey: form.iconKey, available: form.available, borrower: null }])
    }
    setModalOpen(false)
  }

  const markReturned = (id) => {
    // TODO: PATCH /api/admin/equipment/:id, clearing the active booking too.
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, available: true, borrower: null } : it)))
  }

  const deleteItem = (id) => {
    const index = items.findIndex((it) => it.id === id)
    const item = items[index]
    // TODO: DELETE /api/admin/equipment/:id
    setItems((prev) => prev.filter((it) => it.id !== id))
    setUndo({ item, index })
  }

  const undoDelete = () => {
    if (!undo) return
    setItems((prev) => {
      const next = [...prev]
      next.splice(undo.index, 0, undo.item)
      return next
    })
    setUndo(null)
  }

  return (
    <AdminShell>
      <div className="p-3 p-lg-5">
        <div className="d-flex align-items-start justify-content-between flex-wrap gap-3 mb-4">
          <div>
            <span
              className="small text-uppercase fw-semibold d-block mb-2"
              style={{ ...fontMono, letterSpacing: '0.14em', color: 'var(--tw-orange-700)' }}
            >
              SPORTS AFFAIR
            </span>
            <h1 className="fw-semibold mb-2" style={{ ...fontDisplay, fontSize: 'clamp(2rem, 4vw, 2.8rem)' }}>
              Manage equipment
            </h1>
            <p className="text-body-secondary mb-0" style={{ maxWidth: '48ch' }}>
              Add new gear, and mark items returned or unavailable.
            </p>
          </div>
          <button type="button" className="btn rounded-2 fw-semibold px-4" style={orangeBtnVars} onClick={openAddModal}>
            + Add equipment
          </button>
        </div>

        {undo && (
          <div className="alert d-flex align-items-center justify-content-between mb-4" style={{ backgroundColor: 'var(--tw-neutral-100)' }} role="alert">
            <span className="small">Removed {undo.item.name}.</span>
            <button type="button" className="btn btn-link btn-sm p-0 text-decoration-none fw-semibold" onClick={undoDelete}>
              Undo
            </button>
          </div>
        )}

        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th className="small text-uppercase text-body-secondary fw-semibold" style={fontMono}>
                  &nbsp;
                </th>
                <th className="small text-uppercase text-body-secondary fw-semibold" style={fontMono}>
                  Name
                </th>
                <th className="small text-uppercase text-body-secondary fw-semibold" style={fontMono}>
                  Status
                </th>
                <th className="small text-uppercase text-body-secondary fw-semibold text-end" style={fontMono}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const Icon = iconFor(item.iconKey)
                return (
                  <tr key={item.id}>
                    <td style={{ width: '3.5rem' }}>
                      <div
                        className="d-flex align-items-center justify-content-center rounded-2 bg-teal-50"
                        style={{ width: '2.75rem', height: '2.75rem', padding: '0.5rem' }}
                      >
                        <Icon />
                      </div>
                    </td>
                    <td className="fw-semibold">{item.name}</td>
                    <td>
                      <span
                        className="badge rounded-pill"
                        style={
                          item.available
                            ? { backgroundColor: 'var(--tw-teal-700)', color: '#fff' }
                            : { backgroundColor: 'var(--tw-neutral-200)', color: 'var(--tw-neutral-700)' }
                        }
                      >
                        {item.available ? 'Available' : 'In use'}
                      </span>
                      {!item.available && item.borrower && (
                        <span className="d-block small text-body-secondary mt-1">
                          {item.borrower.name} ({item.borrower.id})
                        </span>
                      )}
                    </td>
                    <td className="text-end">
                      <div className="d-inline-flex gap-2">
                        {!item.available && (
                          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => markReturned(item.id)}>
                            Mark returned
                          </button>
                        )}
                        <button type="button" className="btn btn-outline-dark btn-sm" onClick={() => openEditModal(item)}>
                          Edit
                        </button>
                        <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => deleteItem(item.id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <>
          <div className="modal-backdrop show" onClick={closeModal} />
          <div className="modal d-block" tabIndex="-1" role="dialog" aria-modal="true" onClick={closeModal}>
            <div className="modal-dialog modal-dialog-centered" role="document" onClick={(e) => e.stopPropagation()}>
              <form className="modal-content" onSubmit={saveItem}>
                <div className="modal-header">
                  <h5 className="modal-title fw-semibold mb-0" style={fontDisplay}>
                    {editingId ? 'Edit equipment' : 'Add equipment'}
                  </h5>
                  <button type="button" className="btn-close" aria-label="Close" onClick={closeModal} />
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="eq-name" className="form-label small fw-semibold">
                      Name
                    </label>
                    <input
                      id="eq-name"
                      type="text"
                      className="form-control"
                      placeholder="e.g. Tennis Racket"
                      value={form.name}
                      onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                      autoFocus
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold d-block">Icon</label>
                    <div className="d-flex flex-wrap gap-2">
                      {ICON_OPTIONS.map((opt) => (
                        <button
                          key={opt.key}
                          type="button"
                          className="btn p-0 rounded-2"
                          onClick={() => setForm((prev) => ({ ...prev, iconKey: opt.key }))}
                          aria-label={opt.label}
                          aria-pressed={form.iconKey === opt.key}
                          style={{
                            width: '2.75rem',
                            height: '2.75rem',
                            padding: '0.5rem',
                            backgroundColor: 'var(--tw-teal-50)',
                            border: form.iconKey === opt.key ? '2px solid var(--tw-teal-700)' : '2px solid transparent',
                          }}
                        >
                          <opt.Icon />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="eq-available"
                      checked={form.available}
                      onChange={(e) => setForm((prev) => ({ ...prev, available: e.target.checked }))}
                    />
                    <label className="form-check-label small" htmlFor="eq-available">
                      Available for booking
                    </label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-dark" onClick={closeModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn rounded-2 fw-semibold" style={orangeBtnVars}>
                    {editingId ? 'Save changes' : 'Add equipment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </AdminShell>
  )
}
