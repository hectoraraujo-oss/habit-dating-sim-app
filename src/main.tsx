import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Tipografía Baloo 2 (Fase 4 Ola 5, feel Duolingo §4) — local vía @fontsource (offline,
// sin @import de Google Fonts). Pesos 500/600/700/800: medium para el chrome, bold/extra
// para títulos. La mono pixel (--font-display) NO se toca: es la identidad.
import '@fontsource/baloo-2/500.css'
import '@fontsource/baloo-2/600.css'
import '@fontsource/baloo-2/700.css'
import '@fontsource/baloo-2/800.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
