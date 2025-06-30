import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App.jsx'
import { LanguageProvider } from './contexts/LanguageContext.jsx'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('app')).render(
  <StrictMode>
    <BrowserRouter>
     <LanguageProvider> 
      <App />
     </LanguageProvider>
    </BrowserRouter>
  </StrictMode>,
)
