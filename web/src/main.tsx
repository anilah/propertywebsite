import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { runAutomaticClientRecovery } from './lib/clientRecovery'

async function boot() {
  // Auto-heal stale SW / desktop shell — may reload once, no manual steps
  await runAutomaticClientRecovery()
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
}

void boot()
