import React from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import Home from './pages/Home'
import Captura from './pages/Captura'
import Dashboard from './pages/Dashboard'
import Historial from './pages/Historial'
import Metas from './pages/Metas'
import Reportes from './pages/Reportes'
import AnalisisSRI from './pages/AnalisisSRI'
import './App.css'
import SplashScreen from './components/SplashScreen'

const NAV = [
  { path: '/',          emoji: '🏠', label: 'Inicio'    },
  { path: '/captura',   emoji: '📸', label: 'Captura'   },
  { path: '/dashboard', emoji: '📊', label: 'Dashboard'  },
  { path: '/historial', emoji: '📋', label: 'Historial'  },
  { path: '/metas',     emoji: '🎯', label: 'Metas'      },
  { path: '/reportes',  emoji: '📄', label: 'Reportes'   },
  { path: '/sri',       emoji: '🏛️', label: 'SRI'        },
]

function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#111827', display: 'flex', borderTop: '1px solid #374151', zIndex: 99, paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {NAV.map(item => {
        const activo = location.pathname === item.path
        return (
          <button key={item.path} onClick={() => navigate(item.path)}
            style={{ flex: 1, padding: '10px 0 8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <span style={{ fontSize: 22 }}>{item.emoji}</span>
            <span style={{ fontSize: 9, fontWeight: 700, fontFamily: 'monospace', color: activo ? '#F97316' : '#6B7280', letterSpacing: '0.04em' }}>{item.label.toUpperCase()}</span>
            {activo && <div style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: '#F97316' }} />}
          </button>
        )
      })}
    </div>
  )
}

function App() {
  const [splash, setSplash] = React.useState(true)
  if (splash) return <SplashScreen onDone={() => setSplash(false)} />
  return (
    <Router>
      <div style={{ paddingBottom: 72 }}>
        <Routes>
          <Route path="/"          element={<Home />} />
          <Route path="/captura"   element={<Captura />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/historial" element={<Historial />} />
          <Route path="/metas"     element={<Metas />} />
          <Route path="/reportes"  element={<Reportes />} />
          <Route path="/sri"       element={<AnalisisSRI />} />
        </Routes>
        <BottomNav />
      </div>
    </Router>
  )
}

export default App
