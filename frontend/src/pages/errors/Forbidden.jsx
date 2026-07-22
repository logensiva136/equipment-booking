import { useNavigate } from 'react-router-dom'
import ErrorPage from './ErrorPage.jsx'
import { orangeBtnVars } from '../../theme.js'

// Shown when a signed-in user is authenticated but lacks the required
// role/permission (e.g. a student/staff account hitting an admin-only
// route) -- distinct from Unauthorized, which is for no session at all.
export default function Forbidden() {
  const navigate = useNavigate()
  return (
    <ErrorPage
      code={403}
      title="ACCESS DENIED"
      message="You don’t have permission to view this page."
      actions={
        <button type="button" className="btn btn-outline-dark rounded-2 fw-semibold px-4" onClick={() => navigate('/')}>
          Go home
        </button>
      }
    />
  )
}
