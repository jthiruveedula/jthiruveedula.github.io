import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import ErrorBoundary from '@/components/ErrorBoundary'
import JourneyApp from './JourneyApp'
import '@/styles/globals.css'
import './journey.css'

createRoot(document.getElementById('journey-root')!).render(
  <StrictMode>
    <ErrorBoundary label="journey">
      <JourneyApp />
    </ErrorBoundary>
  </StrictMode>,
)
