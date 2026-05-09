import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Captura from './pages/Captura'
import Dashboard from './pages/Dashboard'
import Historial from './pages/Historial'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <Link to="/" className="nav-logo">💰 Gasto Tracker</Link>
          <div className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/captura">Captura</Link>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/historial">Historial</Link>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/captura" element={<Captura />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/historial" element={<Historial />} />
        </Routes>

        <footer className="app-footer">
          <p>💰 Gasto Tracker v1.0.0-beta | Sistema de Inteligencia Financiera</p>
          <p>Desarrollado con React + Supabase + Claude Vision</p>
        </footer>
      </div>
    </Router>
  )
}

export default App
