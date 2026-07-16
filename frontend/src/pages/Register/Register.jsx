import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fontDisplay, fontMono, orangeBtnVars, tealCheckVars } from '../../theme.js'

// Per user type, only the ID field's label/placeholder/help text
// change — everything else (name, email, phone, password) is shared.
// This ID also doubles as the username at login.
const USER_TYPES = {
  student: {
    label: 'Student',
    idLabel: 'Matrix No.',
    idPlaceholder: 'e.g. 21DTK21F1001',
    idHelp: 'Your Matrix No. is also your username at login.',
    uploadLabel: 'Matrix Card / Student ID',
    uploadHelp: 'A clear photo or scan of your Matrix Card, for verification.',
  },
  staff: {
    label: 'Staff',
    idLabel: 'Staff ID',
    idPlaceholder: 'e.g. STF-0245',
    idHelp: 'Your Staff ID is also your username at login.',
    uploadLabel: 'Staff ID Card',
    uploadHelp: 'A clear photo or scan of your Staff ID Card, for verification.',
  },
}

const initialForm = {
  name: '',
  idNumber: '',
  email: '',
  phone: '',
  password: '',
  idFile: null,
  gender: '',
  height: '',
  weight: '',
}

export default function Register() {
  const navigate = useNavigate()
  const [userType, setUserType] = useState('student')
  const [form, setForm] = useState(initialForm)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [idPreviewUrl, setIdPreviewUrl] = useState(null)
  const fileInputRef = useRef(null)

  const config = USER_TYPES[userType]

  // Revoke the object URL when it's replaced or the page unmounts,
  // so the browser doesn't hold onto the file in memory.
  useEffect(() => {
    return () => {
      if (idPreviewUrl) URL.revokeObjectURL(idPreviewUrl)
    }
  }, [idPreviewUrl])

  const setField = (field) => (e) => {
    const value = e.target.value
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null
    setForm((prev) => ({ ...prev, idFile: file }))
    setErrors((prev) => ({ ...prev, idFile: undefined }))
    setIdPreviewUrl((prevUrl) => {
      if (prevUrl) URL.revokeObjectURL(prevUrl)
      return file && file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    })
  }

  const removeFile = () => {
    setForm((prev) => ({ ...prev, idFile: null }))
    setIdPreviewUrl((prevUrl) => {
      if (prevUrl) URL.revokeObjectURL(prevUrl)
      return null
    })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const switchType = (type) => {
    setUserType(type)
    // A student's Matrix No./Card and a staff's Staff ID/Card aren't
    // interchangeable, so clear the ID fields when switching.
    setForm((prev) => ({ ...prev, idNumber: '', idFile: null }))
    setIdPreviewUrl((prevUrl) => {
      if (prevUrl) URL.revokeObjectURL(prevUrl)
      return null
    })
    if (fileInputRef.current) fileInputRef.current.value = ''
    setErrors({})
  }

  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = 'Enter your full name.'
    if (!form.idNumber.trim()) next.idNumber = `Enter your ${config.idLabel.toLowerCase()}.`
    if (!form.email.trim()) next.email = 'Enter an email address.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Enter a valid email address.'
    if (form.phone.replace(/\D/g, '').length < 9) next.phone = 'Enter a valid phone number.'
    if (form.password.length < 8) next.password = 'Use at least 8 characters.'
    if (!form.idFile) next.idFile = `Upload a photo of your ${config.uploadLabel}.`
    if (!form.gender) next.gender = 'Select your gender.'
    if (!form.height || Number(form.height) <= 0) next.height = 'Enter your height in cm.'
    if (!form.weight || Number(form.weight) <= 0) next.weight = 'Enter your body weight in kg.'
    return next
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length === 0) {
      // TODO: POST to the Django Ninja backend, e.g. /api/register, as
      // multipart/form-data (not JSON) since idFile is a real file —
      // build a FormData with { userType, ...form } and append idFile
      // separately. The backend treats idNumber as the username for
      // both roles, and stores idFile for admin verification.
      setSubmitted(true)
    }
  }

  if (submitted) {
    return (
      <div className="d-flex align-items-center justify-content-center vh-100 bg-teal-50 p-4">
        <div className="text-center" style={{ maxWidth: '28rem' }}>
          <div
            className="rounded-circle d-inline-flex align-items-center justify-content-center mb-4"
            style={{ width: '4rem', height: '4rem', backgroundColor: 'var(--tw-teal-700)' }}
          >
            <svg width="28" height="28" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M4 10.5L8 14.5L16 5.5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="fw-semibold" style={{ ...fontDisplay, fontSize: '2.5rem' }}>
            YOU&rsquo;RE IN
          </h1>
          <p className="text-body-secondary fs-5">
            Welcome, <strong>{form.name}</strong>. Sign in any time with your {config.idLabel.toLowerCase()}{' '}
            <strong>{form.idNumber}</strong> as your username.
          </p>
          <button type="button" className="btn rounded-2 fw-semibold px-4 mt-2" style={orangeBtnVars} onClick={() => navigate('/login')}>
            Go to login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="d-flex flex-column flex-lg-row vh-100 overflow-hidden">
      {/* Brand panel */}
      <div
        className="d-none d-lg-flex flex-column justify-content-between p-5 text-white"
        style={{
          flex: '0 0 38%',
          background: 'radial-gradient(120% 140% at 20% 15%, var(--tw-teal-700) 0%, var(--tw-teal-900) 72%)',
        }}
      >
        <span className="fs-4" style={{ ...fontDisplay, letterSpacing: '0.06em' }}>
          FitPoly
        </span>

        <div>
          <span
            className="small text-uppercase fw-semibold d-block mb-3"
            style={{ ...fontMono, letterSpacing: '0.18em', color: 'var(--tw-amber-400)' }}
          >
            CREATE ACCOUNT
          </span>
          <h1 className="text-uppercase lh-1 fw-semibold" style={{ ...fontDisplay, fontSize: 'clamp(2.4rem, 4vw, 3.4rem)' }}>
            <span className="d-block">JOIN THE</span>
            <span className="d-block">CAMPUS SQUAD.</span>
          </h1>
          <p className="fs-5 opacity-75 mt-3" style={{ maxWidth: '30ch' }}>
            One account tracks your steps and books your court time &mdash; whether you study here or work here.
          </p>
        </div>

        <span className="small opacity-50" style={fontMono}>
          STEP 1 &middot; ACCOUNT DETAILS
        </span>
      </div>

      {/* Form panel */}
      <div className="flex-grow-1 overflow-auto">
        <div className="p-4 p-lg-5 mx-auto" style={{ maxWidth: '32rem' }}>
          <div className="d-lg-none mb-4">
            <span className="fs-4" style={{ ...fontDisplay, letterSpacing: '0.06em' }}>
              FitPoly
            </span>
            <span
              className="small text-uppercase fw-semibold d-block mt-3"
              style={{ ...fontMono, letterSpacing: '0.18em', color: 'var(--tw-orange-700)' }}
            >
              CREATE ACCOUNT
            </span>
          </div>

          <h2 className="fw-semibold mb-2" style={{ ...fontDisplay, fontSize: 'clamp(1.8rem, 3vw, 2.2rem)' }}>
            Register for FitPoly
          </h2>
          <p className="text-body-secondary mb-4">Tell us who you are, and we&rsquo;ll set up the right account.</p>

          {/* User type segmented control */}
          <div className="btn-group w-100 mb-4" role="group" aria-label="Register as">
            {Object.entries(USER_TYPES).map(([key, type]) => (
              <div key={key} className="w-50">
                <input
                  type="radio"
                  className="btn-check"
                  name="userType"
                  id={`type-${key}`}
                  autoComplete="off"
                  checked={userType === key}
                  onChange={() => switchType(key)}
                />
                <label className="btn btn-outline-dark w-100 fw-semibold" htmlFor={`type-${key}`} style={tealCheckVars}>
                  {type.label}
                </label>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label htmlFor="name" className="form-label small fw-semibold">
                Full name
              </label>
              <input
                id="name"
                type="text"
                className={`form-control${errors.name ? ' is-invalid' : ''}`}
                placeholder="As per IC"
                value={form.name}
                onChange={setField('name')}
              />
              {errors.name && <div className="invalid-feedback">{errors.name}</div>}
            </div>

            <div className="mb-3">
              <label htmlFor="idNumber" className="form-label small fw-semibold">
                {config.idLabel}
              </label>
              <input
                id="idNumber"
                type="text"
                className={`form-control${errors.idNumber ? ' is-invalid' : ''}`}
                placeholder={config.idPlaceholder}
                value={form.idNumber}
                onChange={setField('idNumber')}
              />
              {errors.idNumber ? (
                <div className="invalid-feedback">{errors.idNumber}</div>
              ) : (
                <div className="form-text">{config.idHelp}</div>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="idFile" className="form-label small fw-semibold">
                Upload {config.uploadLabel}
              </label>

              {form.idFile ? (
                <div className="d-flex align-items-center gap-3 border rounded-2 p-2">
                  {idPreviewUrl ? (
                    <img
                      src={idPreviewUrl}
                      alt={`Preview of uploaded ${config.uploadLabel}`}
                      className="rounded-1 flex-shrink-0"
                      style={{ width: '3.5rem', height: '3.5rem', objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      className="rounded-1 flex-shrink-0 d-flex align-items-center justify-content-center bg-teal-50"
                      style={{ width: '3.5rem', height: '3.5rem' }}
                    >
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                        <path
                          d="M5 2.5h6.5L15 6v11a.5.5 0 01-.5.5h-9a.5.5 0 01-.5-.5v-14a.5.5 0 01.5-.5z"
                          stroke="var(--tw-teal-700)"
                          strokeWidth="1.4"
                          strokeLinejoin="round"
                        />
                        <path d="M11.5 2.5V6H15" stroke="var(--tw-teal-700)" strokeWidth="1.4" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                  <div className="flex-grow-1 text-truncate small">
                    <div className="text-truncate fw-semibold">{form.idFile.name}</div>
                    <div className="text-body-secondary">{(form.idFile.size / 1024).toFixed(0)} KB</div>
                  </div>
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={removeFile}>
                    Remove
                  </button>
                </div>
              ) : (
                <input
                  id="idFile"
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  className={`form-control${errors.idFile ? ' is-invalid' : ''}`}
                  onChange={handleFileChange}
                />
              )}

              {errors.idFile ? (
                <div className="invalid-feedback d-block">{errors.idFile}</div>
              ) : (
                <div className="form-text">{config.uploadHelp}</div>
              )}
            </div>

            <div className="d-flex align-items-center gap-2 mb-3">
              <span className="text-uppercase small fw-semibold" style={{ ...fontMono, letterSpacing: '0.12em', color: 'var(--tw-teal-700)' }}>
                Fitness profile
              </span>
              <hr className="flex-grow-1 my-0" />
            </div>

            <div className="row g-3 mb-3">
              <div className="col-12 col-sm-4">
                <label htmlFor="gender" className="form-label small fw-semibold">
                  Gender
                </label>
                <select
                  id="gender"
                  className={`form-select${errors.gender ? ' is-invalid' : ''}`}
                  value={form.gender}
                  onChange={setField('gender')}
                >
                  <option value="" disabled>
                    Select
                  </option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
                {errors.gender && <div className="invalid-feedback">{errors.gender}</div>}
              </div>
              <div className="col-6 col-sm-4">
                <label htmlFor="height" className="form-label small fw-semibold">
                  Height
                </label>
                <div className="input-group">
                  <input
                    id="height"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.1"
                    className={`form-control${errors.height ? ' is-invalid' : ''}`}
                    placeholder="170"
                    value={form.height}
                    onChange={setField('height')}
                  />
                  <span className="input-group-text">cm</span>
                  {errors.height && <div className="invalid-feedback">{errors.height}</div>}
                </div>
              </div>
              <div className="col-6 col-sm-4">
                <label htmlFor="weight" className="form-label small fw-semibold">
                  Body weight
                </label>
                <div className="input-group">
                  <input
                    id="weight"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.1"
                    className={`form-control${errors.weight ? ' is-invalid' : ''}`}
                    placeholder="60"
                    value={form.weight}
                    onChange={setField('weight')}
                  />
                  <span className="input-group-text">kg</span>
                  {errors.weight && <div className="invalid-feedback">{errors.weight}</div>}
                </div>
              </div>
              <div className="col-12">
                <div className="form-text">Used to calculate your BMI and personalise diet and exercise guidance.</div>
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-12 col-sm-7">
                <label htmlFor="email" className="form-label small fw-semibold">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className={`form-control${errors.email ? ' is-invalid' : ''}`}
                  placeholder="you@polytechnic.edu.my"
                  value={form.email}
                  onChange={setField('email')}
                />
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
              </div>
              <div className="col-12 col-sm-5">
                <label htmlFor="phone" className="form-label small fw-semibold">
                  Phone number
                </label>
                <input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  className={`form-control${errors.phone ? ' is-invalid' : ''}`}
                  placeholder="012-3456789"
                  value={form.phone}
                  onChange={setField('phone')}
                />
                {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="form-label small fw-semibold">
                Password
              </label>
              <div className="input-group">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className={`form-control${errors.password ? ' is-invalid' : ''}`}
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={setField('password')}
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                      <path
                        d="M2 2l16 16M8.5 8.7a2.2 2.2 0 003 3M6.2 6.2C3.8 7.6 2.3 9.6 2 10c.7 1.3 3.7 5.5 8 5.5 1.4 0 2.6-.4 3.7-1M10 4.5c4.3 0 7.3 4.2 8 5.5-.3.5-1.1 1.7-2.4 2.9"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                      <path
                        d="M2 10c.7-1.3 3.7-5.5 8-5.5s7.3 4.2 8 5.5c-.7 1.3-3.7 5.5-8 5.5S2.7 11.3 2 10z"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinejoin="round"
                      />
                      <circle cx="10" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.4" />
                    </svg>
                  )}
                </button>
                {errors.password && <div className="invalid-feedback">{errors.password}</div>}
              </div>
            </div>

            <button type="submit" className="btn w-100 rounded-2 fw-semibold py-2" style={orangeBtnVars}>
              Create {config.label.toLowerCase()} account
            </button>

            <p className="text-center small text-body-secondary mt-3 mb-0">
              Already have an account?{' '}
              <button type="button" className="btn btn-link btn-sm p-0 align-baseline" onClick={() => navigate('/login')}>
                Log in
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
