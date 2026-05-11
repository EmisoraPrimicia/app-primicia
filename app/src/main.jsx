import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// PrimeFlex — utilidades de layout (grid, flex, spacing, surface) del ecosistema PrimeReact
import 'primeflex/primeflex.css'
// El SCSS del layout se importa aquí para que Vite lo procese con Sass directamente
import '../styles/layout/layout.scss'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
