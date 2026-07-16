import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

// Bootstrap first, then the Tailwind color utility extension, then our
// minimal base reset — everything else is styled inline with Bootstrap
// (+ Tailwind color) utility classes directly in components.
import 'bootstrap/dist/css/bootstrap.min.css'
import './tailwind-colors.css'
import './index.css'

import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
