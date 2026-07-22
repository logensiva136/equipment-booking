import { useEffect, useState } from 'react'
import AdminShell from '../../components/AdminShell.jsx'
import { apiJson, ApiError } from '../../api.js'
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

// This page manages the equipment *catalogue* only -- what exists and
// whether it's listed for booking at all (e.g. pulled for repair).
// Who's currently holding an item, and the pending/active/completed
// booking lifecycle around the ID card handover, lives in Manage
// Bookings instead -- keeping one source of truth for that state
// rather than duplicating it here.

const emptyForm = { name: '', iconKey: ICON_OPTIONS[0].key, listed: true }

export default function AdminEquipment() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [undo, setUndo] = useState(null) // { item, index }
  const [error, setError] = useState('')

  useEffect(() => {
    apiJson('/admin/equipment')
      .then(setItems)
      .catch(() => setError('Could not load the equipment catalogue.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!undo) return undefined
    const timer = setTimeout(() => setUndo(null), 6000)
    return () => clearTimeout(timer)
  }, [undo])

  if (loading) return <AdminShell><div className="p-3 p-lg-5" /></AdminShell>

  const openAddModal = () => {
    setEditingId(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEditModal = (item) => {
    setEditingId(item.id)
    setForm({ name: item.name, iconKey: item.iconKey, listed: item.listed })
    setModalOpen(true)
  }

  const closeModal = () => setModalOpen(false)

  const saveItem = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    setFormError('')
    try {
      if (editingId) {
        const updated = await apiJson(`/admin/equipment/${editingId}`, { method: 'PATCH', json: form })
        setItems((prev) => prev.map((it) => (it.id === editingId ? updated : it)))
      } else {
        const created = await apiJson('/admin/equipment', { method: 'POST', json: form })
        setItems((prev) => [...prev, created])
      }
      setModalOpen(false)
    } catch (err) {
      setFormError(err instanceof ApiError ? err.body?.detail || 'Could not save this item.' : 'Could not reach the server.')
    } finally {
      setSaving(false)
    }
  }

  const deleteItem = async (id) => {
    const index = items.findIndex((it) => it.id === id)
    const item = items[index]
    try {
      await apiJson(`/admin/equipment/${id}`, { method: 'DELETE' })
      setItems((prev) => prev.filter((it) => it.id !== id))
      setUndo({ item, index })
    } catch {
      setError('Could not delete that item.')
    }
  }

  const undoDelete = async () => {
    if (!undo) return
    try {
      const recreated = await apiJson('/admin/equipment', {
        method: 'POST',
        json: { name: undo.item.name, iconKey: undo.item.iconKey, listed: undo.item.listed },
      })
      setItems((prev) => {
        const next = [...prev]
        next.splice(undo.index, 0, recreated)
        return next
      })
    } catch {
      setError('Could not restore that item.')
    } finally {
      setUndo(null)
    }
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
            <p className="text-body-secondary mb-0" style={{ maxWidth: '52ch' }}>
              Add or edit gear in the catalogue. Live availability per slot, and returning items, happen in{' '}
              <strong>Manage Bookings</strong>.
            </p>
          </div>
          <button type="button" className="btn rounded-2 fw-semibold px-4" style={orangeBtnVars} onClick={openAddModal}>
            + Add equipment
          </button>
        </div>

        {error && <div className="alert alert-danger py-2 small">{error}</div>}

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
                  Catalogue status
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
                          item.listed
                            ? { backgroundColor: 'var(--tw-teal-700)', color: '#fff' }
                            : { backgroundColor: 'var(--tw-neutral-200)', color: 'var(--tw-neutral-700)' }
                        }
                      >
                        {item.listed ? 'Listed' : 'Unlisted'}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="d-inline-flex gap-2">
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
                      id="eq-listed"
                      checked={form.listed}
                      onChange={(e) => setForm((prev) => ({ ...prev, listed: e.target.checked }))}
                    />
                    <label className="form-check-label small" htmlFor="eq-listed">
                      Listed for booking (uncheck to pull it, e.g. for repair)
                    </label>
                  </div>

                  {formError && <div className="alert alert-danger py-2 small mt-3 mb-0">{formError}</div>}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-dark" onClick={closeModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn rounded-2 fw-semibold" style={orangeBtnVars} disabled={saving}>
                    {saving ? 'Saving…' : editingId ? 'Save changes' : 'Add equipment'}
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
