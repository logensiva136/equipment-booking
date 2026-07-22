import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { apiJson } from './api.js'
import Unauthorized from './pages/errors/Unauthorized.jsx'
import Forbidden from './pages/errors/Forbidden.jsx'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(() => {
    return apiJson('/me')
      .then((data) => {
        setUser(data)
        return data
      })
      .catch(() => {
        setUser(null)
        return null
      })
  }, [])

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [refresh])

  const logout = useCallback(async () => {
    try {
      await apiJson('/logout', { method: 'POST' })
    } catch {
      // Session may already be gone -- clear local state regardless.
    }
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, setUser, loading, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}

// Gates student/staff-facing pages -- bounces to the onboarding carousel
// (which itself offers "Log in" / "Create account") if not signed in,
// rather than dropping an unknown visitor straight onto a bare login form.
export function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return null
  if (!user) return <Navigate to="/" state={{ from: location }} replace />
  return children
}

// Gates admin-facing pages: no session at all -> 401 (sign in required);
// signed in but not an admin -> 403 (a regular student/staff account is
// a different session/role entirely, not just a missing permission).
export function RequireAdmin({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Unauthorized loginPath="/admin/login" />
  if (!user.isAdmin) return <Forbidden />
  return children
}
