import { useEffect, useState } from 'react'
import { fontDisplay, fontMono, orangeBtnVars } from '../../theme.js'
import { RacketIcon, BallIcon, PaddleIcon, RopeIcon, FrisbeeIcon } from './equipmentIcons.jsx'
import AppHeader from '../../components/AppHeader.jsx'

// Matches the Sports Affair collaboration's fixed slots from the brief.
// Weekends aren't wired up on their end yet.
const SLOTS = [
  { id: 'mon-thu', label: 'Monday & Thursday', time: '5:00 PM \u2013 6:30 PM', available: true },
  { id: 'tue-wed-fri', label: 'Tuesday, Wednesday & Friday', time: '5:00 PM \u2013 7:00 PM', available: true },
  { id: 'weekend', label: 'Saturday & Sunday', time: 'Not ready yet', available: false },
]

// Mock catalogue -- the real list + live availability will come from
// the Django Ninja backend (e.g. GET /api/equipment).
const EQUIPMENT = [
  { id: 'badminton-racket', name: 'Badminton Racket', Icon: RacketIcon, available: true },
  { id: 'basketball', name: 'Basketball', Icon: () => <BallIcon color="var(--tw-orange-600)" />, available: true },
  { id: 'futsal-ball', name: 'Futsal Ball', Icon: () => <BallIcon color="var(--tw-teal-700)" />, available: true },
  { id: 'table-tennis-paddle', name: 'Table Tennis Paddle', Icon: PaddleIcon, available: true },
  { id: 'jump-rope', name: 'Jump Rope', Icon: RopeIcon, available: true },
  {
    id: 'football',
    name: 'Football',
    Icon: () => <BallIcon color="var(--tw-neutral-900)" />,
    available: false,
    borrower: { name: 'Ahmad Faiz', id: '21DTK21F1002' },
  },
  {
    id: 'volleyball',
    name: 'Volleyball',
    Icon: () => <BallIcon color="var(--tw-amber-500)" />,
    available: false,
    borrower: { name: 'Nur Aisyah', id: 'STF-0031' },
  },
  {
    id: 'frisbee',
    name: 'Frisbee',
    Icon: FrisbeeIcon,
    available: false,
    borrower: { name: 'Haziq Rahman', id: '21DEE22F0456' },
  },
]

// Available equipment first (booking is the point), then whatever's
// currently in use pushed to the bottom, alphabetical within each group.
const sortedEquipment = [...EQUIPMENT].sort((a, b) => {
  if (a.available !== b.available) return a.available ? -1 : 1
  return a.name.localeCompare(b.name)
})

export default function EquipmentBooking() {
  const [selectedEquipment, setSelectedEquipment] = useState(null)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [banner, setBanner] = useState(null)

  useEffect(() => {
    if (!banner) return undefined
    const timer = setTimeout(() => setBanner(null), 6000)
    return () => clearTimeout(timer)
  }, [banner])

  const openModal = (item) => {
    if (!item.available) return
    setSelectedEquipment(item)
    setSelectedSlot(null)
  }

  const closeModal = () => {
    setSelectedEquipment(null)
    setSelectedSlot(null)
  }

  const confirmBooking = () => {
    if (!selectedEquipment || !selectedSlot) return
    // TODO: POST to the Django Ninja backend, e.g. /api/bookings, with
    // { equipmentId: selectedEquipment.id, slotId: selectedSlot.id }.
    setBanner(
      `${selectedEquipment.name} booked for ${selectedSlot.label}, ${selectedSlot.time}. Bring your Matrix / Staff card to collect it.`
    )
    closeModal()
  }

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
          Pick a slot below. Remember to bring your Matrix or Staff card when you collect equipment.
        </p>

        <div className="row row-cols-2 row-cols-sm-3 row-cols-lg-4 g-3 g-lg-4">
          {sortedEquipment.map((item) => (
            <div className="col" key={item.id}>
              <div
                role="button"
                tabIndex={item.available ? 0 : -1}
                aria-disabled={!item.available}
                aria-label={item.available ? `Book ${item.name}` : `${item.name}, currently in use`}
                onClick={() => openModal(item)}
                onKeyDown={(e) => {
                  if (item.available && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault()
                    openModal(item)
                  }
                }}
                className="card h-100"
                style={
                  item.available
                    ? { cursor: 'pointer' }
                    : { cursor: 'not-allowed', opacity: 0.55, filter: 'grayscale(0.6)' }
                }
              >
                <div
                  className="d-flex align-items-center justify-content-center bg-teal-50 rounded-top"
                  style={{ aspectRatio: '1 / 1', padding: '1.25rem' }}
                >
                  <div style={{ width: '60%' }}>
                    <item.Icon />
                  </div>
                </div>
                <div className="card-body p-2 p-lg-3">
                  <div className="d-flex align-items-start justify-content-between gap-2">
                    <span className="fw-semibold small">{item.name}</span>
                    <span
                      className="badge rounded-pill flex-shrink-0"
                      style={
                        item.available
                          ? { backgroundColor: 'var(--tw-teal-700)', color: '#fff' }
                          : { backgroundColor: 'var(--tw-neutral-200)', color: 'var(--tw-neutral-700)' }
                      }
                    >
                      {item.available ? 'Available' : 'In use'}
                    </span>
                  </div>
                  {!item.available && item.borrower && (
                    <p className="small text-body-secondary mb-0 mt-1">
                      Borrower: {item.borrower.name} ({item.borrower.id})
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
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
                    Choose a slot to book this equipment. Bring your Matrix / Staff card to collect it.
                  </p>
                  <div className="list-group">
                    {SLOTS.map((slot) => {
                      const isActive = selectedSlot?.id === slot.id
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          disabled={!slot.available}
                          className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center${
                            isActive ? ' active' : ''
                          }`}
                          style={
                            isActive
                              ? {
                                  '--bs-list-group-active-bg': 'var(--tw-teal-700)',
                                  '--bs-list-group-active-border-color': 'var(--tw-teal-700)',
                                }
                              : undefined
                          }
                          onClick={() => setSelectedSlot(slot)}
                        >
                          <span>
                            <span className="d-block fw-semibold">{slot.label}</span>
                            <span className={`d-block small ${isActive ? '' : 'text-body-secondary'}`}>{slot.time}</span>
                          </span>
                          {!slot.available && <span className="badge bg-secondary-subtle text-secondary-emphasis">Coming soon</span>}
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div className="modal-footer d-flex align-items-center justify-content-between">
                  <span className="small text-body-secondary">
                    {selectedSlot ? `Selected: ${selectedSlot.label}` : 'Select a slot to continue'}
                  </span>
                  <div className="d-flex gap-2">
                    <button type="button" className="btn btn-outline-dark" onClick={closeModal}>
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn rounded-2 fw-semibold"
                      style={orangeBtnVars}
                      disabled={!selectedSlot}
                      onClick={confirmBooking}
                    >
                      Confirm booking
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
