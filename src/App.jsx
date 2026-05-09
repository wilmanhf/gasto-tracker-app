import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Captura from './pages/Captura';
import Dashboard from './pages/Dashboard';
import Historial from './pages/Historial';
import Metas from './pages/Metas';
import Reportes from './pages/Reportes';
import AnalisisSRI from './pages/AnalisisSRI';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="bg-gradient-to-r from-gray-700 to-gray-800 text-white px-4 py-4 shadow-md">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link to="/" className="nav-logo">💰 Gasto Tracker</Link>
            <div className="nav-links space-x-4 text-sm overflow-x-auto">
              <Link to="/" className="text-gray-200 hover:text-white transition whitespace-nowrap">Home</Link>
              <Link to="/captura" className="text-gray-200 hover:text-white transition whitespace-nowrap">Captura</Link>
              <Link to="/dashboard" className="text-gray-200 hover:text-white transition whitespace-nowrap">Dashboard</Link>
              <Link to="/historial" className="text-gray-200 hover:text-white transition whitespace-nowrap">Historial</Link>
              <Link to="/metas" className="text-gray-200 hover:text-white transition whitespace-nowrap">Metas</Link>
              <Link to="/reportes" className="text-gray-200 hover:text-white transition whitespace-nowrap">Reportes</Link>
              <Link to="/sri" className="text-gray-200 hover:text-white transition whitespace-nowrap">SRI</Link>
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/captura" element={<Captura />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/historial" element={<Historial />} />
          <Route path="/metas" element={<Metas />} />
          <Route path="/reportes" element={<Reportes />} />
          <Route path="/sri" element={<AnalisisSRI />} />
        </Routes>

        <footer className="app-footer bg-gray-800 text-gray-400 text-center py-6 mt-10 relative">
          <div className="max-w-6xl mx-auto flex items-center justify-between px-4 mb-4">
            <div className="flex-1">
              <img src="/logo-metalpac.jpg" alt="METALPAC" className="h-12 object-contain" />
            </div>
            <div className="flex-1 text-center">
              <p>💰 Gasto Tracker v1.0.0-beta</p>
              <p className="text-xs mt-1">Sistema de Inteligencia Financiera</p>
            </div>
            <div className="flex-1 flex justify-end">
              <img src="/logo-anta.png" alt="ANTA" className="h-12 object-contain" />
            </div>
          </div>
          <p className="text-xs text-gray-300 mt-3 text-center">Diseñado por Wilman Herrera Figueroa</p>
        </footer>
      </div>
    </Router>
  );
}

export default App
