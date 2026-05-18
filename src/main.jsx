import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { AuthProvider } from './components/contexts/auth.jsx'
import { ConfigProvider } from './components/contexts/config.jsx'
import { NotificationProvider } from './components/contexts/notification.jsx'

import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <NotificationProvider>
        <AuthProvider>
          <ConfigProvider>
            <App />
          </ConfigProvider>
        </AuthProvider>
      </NotificationProvider>
    </BrowserRouter>
  </StrictMode>,
)
