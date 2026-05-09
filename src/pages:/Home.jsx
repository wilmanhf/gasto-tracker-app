import React from 'react'
import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="text-6xl mb-4">💰</div>
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Gasto Tracker</h1>
        <p className="text-gray-500 mb-8 text-lg">Sistema de Inteligencia Financiera</p>

        <div className="space-y-3">
          <Link 
            to="/captura"
            className="block w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 px-6 rounded-xl hover:shadow-lg transition text-lg"
          >
            📸 Capturar Gasto
          </Link>

          <Link 
            to="/dashboard"
            className="block w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 px-6 rounded-xl hover:shadow-lg transition text-lg"
          >
            📊 Ver Dashboard
          </Link>

          <Link 
            to="/historial"
            className="block w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 px-6 rounded-xl hover:shadow-lg transition text-lg"
          >
            💾 Historial
          </Link>
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-xl">
          <h3 className="font-bold text-gray-800">✅ App Desplegada</h3>
          <p className="text-gray-600 text-sm mt-2">Tu aplicación está VIVA en Vercel</p>
          <p className="text-gray-500 text-xs mt-2">Versión: 1.0.0</p>
        </div>
      </div>
    </div>
  )
}
