import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'

import App from './App.tsx'
import { analytics } from './firebase/config'
import './i18n'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <App />
      {analytics && null}
    </HelmetProvider>
  </StrictMode>,
)
