import { useEffect, useState } from 'react'
import { fontDisplay, fontMono, orangeBtnVars } from '../../theme.js'
import { RacketIcon, BallIcon, PaddleIcon, RopeIcon, FrisbeeIcon } from './equipmentIcons.jsx'
import AppHeader from '../../components/AppHeader.jsx'
import { apiJson, ApiError } from '../../api.js'
import { useAuth } from '../../auth.jsx'

// Matches the Sports Affair collaboration's fixed slots from the brief.
// Weekends aren't wired up on their end yet. Each equipment item has
// its own booking per slot, so booking Mon & Thu for an item leaves
// Tue/Wed/Fri still bookable for someone else (or you).
const SLOTS = [
  { id: 'mon-thu', label: 'Monday & Thursday', time: '5:00 PM – 6:30 PM', bookable: true },
  { id: 'tue-wed-fri', label: 'Tuesday, Wednesday & Friday', time: '5:00 PM – 7:00 PM', bookable: true },
  { id: 'weekend', label: 'Saturday & Sunday', time: 'Not ready yet', bookable: false },
]
const BOOKABLE_SLOT_IDS = SLOTS.filter((s) => s.bookable).map((s) => s.id)

// Maps the backend's iconKey (see equipment/models.py's Equipment.IconKey)
// to the actual icon component rendered on each card.
const ICON_BY_KEY = {
  racket: RacketIcon,
  'ball-orange': () => <BallIcon color="var(--tw-orange-600)" />,
  'ball-teal': () => <BallIcon color="var(--tw-teal-700)" />,
  'ball-dark': () => <BallIcon color="var(--tw-neutral-900)" />,
  'ball-amber': () => <BallIcon color="var(--tw-amber-500)" />,
  paddle: PaddleIcon,
  rope: RopeIcon,
  frisbee: FrisbeeIcon,
}

const STATUS_META = {
  pending: { label: 'Pending', badgeBg: 'var(--tw-sky-100)', badgeColor: 'var(--tw-sky-700)' },
  active: { label: 'In use', badgeBg: 'var(--tw-neutral-200)', badgeColor: 'var(--tw-neutral-700)' },
}

export default function EquipmentBooking() {
  const { user } = useAuth()
  const [equipment, setEquipment] = useState([])
  const [availability, setAvailability] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedEquipment, setSelectedEquipment] = useState(null)
  const [selectedSlotId, setSelectedSlotId] = useState(null)
  const [banner, setBanner] = useState(null)
  const [confirming, setConfirming] = useState(false)
  const [modalError, setModalError] = useState('')

  const loadData = () => {
    return Promise.all([apiJson('/equipment'), apiJson('/bookings/availability')]).then(
      ([equipmentData, availabilityData]) => {
        setEquipment(equipmentData)
        setAvailability(availabilityData)
      }
    )
  }

  useEffect(() => {
    loadData().finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!banner) return undefined
    const timer = setTimeout(() => setBanner(null), 7000)
    return () => clearTimeout(timer)
  }, [banner])

  const bookingFor = (equipmentId, slotId) =>
    availability.find((b) => b.equipmentId === equipmentId && b.slotId === slotId)

  const equipmentWithAvailability = equipment.map((item) => {
    const occupiedSlots = BOOKABLE_SLOT_IDS.map((slotId) => bookingFor(item.id, slotId)).filter(Boolean)
    const fullyBooked = occupiedSlots.length === BOOKABLE_SLOT_IDS.length
    return { ...item, fullyBooked, occupiedCount: occupiedSlots.length }
  })

  // Anything with at least one open slot first (that's the point of
  // the page); fully booked items pushed to the bottom, alphabetical
  // within each group.
  const sortedEquipment = [...equipmentWithAvailability].sort((a, b) => {
    if (a.fullyBooked !== b.fullyBooked) return a.fullyBooked ? 1 : -1
    return a.name.localeCompare(b.name)
  })

  const openModal = (item) => {
    if (item.fullyBooked) return
    setModalError('')
    setSelectedEquipment(item)
    setSelectedSlotId(null)
  }

  const closeModal = () => {
    setSelectedEquipment(null)
    setSelectedSlotId(null)
  }

  const confirmBooking = async () => {
    if (!selectedEquipment || !selectedSlotId) return
    const slot = SLOTS.find((s) => s.id === selectedSlotId)
    setConfirming(true)
    setModalError('')
    try {
      await apiJson('/bookings', {
        method: 'POST',
        json: { equipmentId: selectedEquipment.id, slotId: selectedSlotId },
      })
      await loadData()
      setBanner(
        `Booking pending: ${selectedEquipment.name} for ${slot.label}, ${slot.time}. Bring your Matrix / Staff card to the Sports Affair counter -- the item won't be released until admin has your card on file.`
      )
      closeModal()
    } catch (err) {
      setModalError(err instanceof ApiError ? err.body?.detail || 'Could not book that slot.' : 'Could not reach the server.')
    } finally {
      setConfirming(false)
    }
  }

  if (loading) return null

  return (
    <div className="min-vh-100 bg-white">
      <AppHeader />

      {banner && (
        <div
          className="alert d-flex align-items-center justify-content-between m-3 mb-0"
          style={{ backgroundColor: 'var(--tw-teal-50)', border: '1px solid var(--tw-teal-200)', color: 'var(--tw-teal-900)' }}
          role="alert"
        >
          <span className="small">{banner}</span>
          <button type="button" className="btn-close" aria-label="Close" onClick={() => setBanner(null)} />
        </div>
      )}

      <div className="p-3 p-lg-5">
        <span
          className="small text-uppercase fw-semibold d-block mb-2"
          style={{ ...fontMono, letterSpacing: '0.14em', color: 'var(--tw-orange-700)' }}
        >
          SPORTS AFFAIR
        </span>
        <h1 className="fw-semibold mb-2" style={{ ...fontDisplay, fontSize: 'clamp(2rem, 4vw, 2.8rem)' }}>
          Book your gear
        </h1>
        <p className="text-body-secondary mb-4" style={{ maxWidth: '48ch' }}>
          Pick a slot below. You'll need to bring your Matrix or Staff card to the counter before the item is released to you.
        </p>

        <div className="row row-cols-2 row-cols-sm-3 row-cols-lg-4 g-3 g-lg-4">
          {sortedEquipment.map((item) => {
            const Icon = ICON_BY_KEY[item.iconKey] || RacketIcon
            const slotLines = BOOKABLE_SLOT_IDS.map((slotId) => {
              const booking = bookingFor(item.id, slotId)
              if (!booking) return null
              const slot = SLOTS.find((s) => s.id === slotId)
              const meta = STATUS_META[booking.status]
              return { slot, booking, meta }
            }).filter(Boolean)

            return (
              <div className="col" key={item.id}>
                <div
                  role="button"
                  tabIndex={item.fullyBooked ? -1 : 0}
                  aria-disabled={item.fullyBooked}
                  aria-label={item.fullyBooked ? `${item.name}, fully booked` : `Book ${item.name}`}
                  onClick={() => openModal(item)}
                  onKeyDown={(e) => {
                    if (!item.fullyBooked && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault()
                      openModal(item)
                    }
                  }}
                  className="card h-100"
                  style={item.fullyBooked ? { cursor: 'not-allowed', opacity: 0.55, filter: 'grayscale(0.6)' } : { cursor: 'pointer' }}
                >
                  <div
                    className="d-flex align-items-center justify-content-center bg-teal-50 rounded-top"
                    style={{ aspectRatio: '1 / 1', padding: '1.25rem' }}
                  >
                    <div style={{ width: '60%' }}>
                      <Icon />
                    </div>
                  </div>
                  <div className="card-body p-2 p-lg-3">
                    <div className="d-flex align-items-start justify-content-between gap-2">
                      <span className="fw-semibold small">{item.name}</span>
                      <span
                        className="badge rounded-pill flex-shrink-0"
                        style={
                          item.fullyBooked
                            ? { backgroundColor: 'var(--tw-neutral-200)', color: 'var(--tw-neutral-700)' }
                            : { backgroundColor: 'var(--tw-teal-700)', color: '#fff' }
                        }
                      >
                        {item.fullyBooked ? 'Fully booked' : 'Available'}
                      </span>
                    </div>
                    {slotLines.map(({ slot, booking, meta }) => (
                      <p key={slot.id} className="small text-body-secondary mb-0 mt-1">
                        {slot.label.split(' ')[0]}: {booking.mine ? `You (${user?.name})` : 'Booked'} &middot; {meta.label}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Slot-selection modal -- rendered/controlled directly by React
          state rather than Bootstrap's JS, so no bootstrap.bundle.js
          dependency is needed just for this one dialog. */}
      {selectedEquipment && (
        <>
          <div className="modal-backdrop show" onClick={closeModal} />
          <div className="modal d-block" tabIndex="-1" role="dialog" aria-modal="true" onClick={closeModal}>
            <div className="modal-dialog modal-dialog-centered" role="document" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title fw-semibold mb-0" style={fontDisplay}>
                    {selectedEquipment.name}
                  </h5>
                  <button type="button" className="btn-close" aria-label="Close" onClick={closeModal} />
                </div>
                <div className="modal-body">
                  <p className="text-body-secondary small mb-3">
                    Choose an open slot. Your Matrix / Staff card must be handed to the counter before the item is released.
                  </p>
                  <div className="list-group">
                    {SLOTS.map((slot) => {
                      const isSelected = selectedSlotId === slot.id
                      const existing = slot.bookable ? bookingFor(selectedEquipment.id, slot.id) : null
                      const disabled = !slot.bookable || Boolean(existing)
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          disabled={disabled}
                          className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center${
                            isSelected ? ' active' : ''
                          }`}
                          style={
                            isSelected
                              ? {
                                  '--bs-list-group-active-bg': 'var(--tw-teal-700)',
                                  '--bs-list-group-active-border-color': 'var(--tw-teal-700)',
                                }
                              : undefined
                          }
                          onClick={() => setSelectedSlotId(slot.id)}
                        >
                          <span>
                            <span className="d-block fw-semibold">{slot.label}</span>
                            <span className={`d-block small ${isSelected ? '' : 'text-body-secondary'}`}>
                              {slot.time}
                              {existing && ` — ${existing.mine ? 'You' : 'Booked'}`}
                            </span>
                          </span>
                          {!slot.bookable && <span className="badge bg-secondary-subtle text-secondary-emphasis">Coming soon</span>}
                          {slot.bookable && existing && (
                            <span
                              className="badge"
                              style={{ backgroundColor: STATUS_META[existing.status].badgeBg, color: STATUS_META[existing.status].badgeColor }}
                            >
                              {STATUS_META[existing.status].label}
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                  {modalError && <div className="alert alert-danger py-2 small mt-3 mb-0">{modalError}</div>}
                </div>
                <div className="modal-footer d-flex align-items-center justify-content-between">
                  <span className="small text-body-secondary">
                    {selectedSlotId ? `Selected: ${SLOTS.find((s) => s.id === selectedSlotId).label}` : 'Select an open slot to continue'}
                  </span>
                  <div className="d-flex gap-2">
                    <button type="button" className="btn btn-outline-dark" onClick={closeModal}>
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn rounded-2 fw-semibold"
                      style={orangeBtnVars}
                      disabled={!selectedSlotId || confirming}
                      onClick={confirmBooking}
                    >
                      {confirming ? 'Booking…' : 'Confirm booking'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
