import { useNavigate } from 'react-router-dom'
import ErrorPage from './ErrorPage.jsx'
import { orangeBtnVars } from '../../theme.js'

// Shown when a route requires sign-in and no session exists at all
// (distinct from Forbidden, which is for a signed-in user without the
// required role/permission).
export default function Unauthorized({ loginPath = '/login' }) {
  const navigate = useNavigate()
  return (
    <ErrorPage
      code={401}
      title="SIGN IN REQUIRED"
      message="You need to be signed in to view this page."
      actions={
        <button type="button" className="btn rounded-2 fw-semibold px-4" style={orangeBtnVars} onClick={() => navigate(loginPath)}>
          Log in
        </button>
      }
    />
  )
}
