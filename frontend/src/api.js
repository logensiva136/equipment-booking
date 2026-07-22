// Shared fetch client for the Django Ninja backend. Auth is session-cookie
// based (see backend/accounts/api.py), so every request sends credentials,
// and unsafe methods attach the CSRF token Django expects.

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

function getCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

let csrfPrimed = false

async function ensureCsrf() {
  if (csrfPrimed) return
  await fetch(`${API_BASE}/csrf`, { credentials: 'include' })
  csrfPrimed = true
}

// Thin wrapper around fetch: prefixes API_BASE, sends cookies, and (for
// non-GET requests) primes + attaches the CSRF token automatically. Pass a
// plain object as `json` for a JSON body, or `form` (a FormData instance)
// for multipart requests (file uploads).
export async function apiFetch(path, { method = 'GET', json, form, headers = {} } = {}) {
  const isUnsafe = method !== 'GET' && method !== 'HEAD'
  if (isUnsafe) await ensureCsrf()

  const finalHeaders = { ...headers }
  if (isUnsafe) finalHeaders['X-CSRFToken'] = getCookie('csrftoken')

  let body
  if (form) {
    body = form // browser sets the multipart Content-Type + boundary itself
  } else if (json !== undefined) {
    body = JSON.stringify(json)
    finalHeaders['Content-Type'] = 'application/json'
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    credentials: 'include',
    headers: finalHeaders,
    body,
  })
  return res
}

// Parses a Ninja JSON response, throwing an ApiError (with .status and
// .body) on non-2xx so callers can branch on status / show field errors.
export class ApiError extends Error {
  constructor(status, body) {
    super(body?.detail || `Request failed with status ${status}`)
    this.status = status
    this.body = body
  }
}

export async function apiJson(path, options) {
  const res = await apiFetch(path, options)
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new ApiError(res.status, data)
  return data
}
