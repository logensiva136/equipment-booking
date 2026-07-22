import { useNavigate } from 'react-router-dom'
import ErrorPage from './ErrorPage.jsx'
import { orangeBtnVars } from '../../theme.js'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <ErrorPage
      code={404}
      title="PAGE NOT FOUND"
      message="That page doesn’t exist, or it may have moved."
      actions={
        <button type="button" className="btn rounded-2 fw-semibold px-4" style={orangeBtnVars} onClick={() => navigate('/')}>
          Go home
        </button>
      }
    />
  )
}
