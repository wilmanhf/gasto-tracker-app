import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-md p-8 text-center space-y-6">
        <div className="text-5xl">💰</div>
        
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gasto Tracker</h1>
          <p className="text-gray-500 text-sm mt-1">Sistema de Inteligencia Financiera</p>
        </div>

        <div className="space-y-2">
          <Link 
            to="/captura" 
            className="w-full bg-gray-700 text-white rounded-lg py-3 font-medium text-center hover:bg-gray-800 transition block"
          >
            📸 Capturar Gasto
          </Link>
          
          <Link 
            to="/dashboard" 
            className="w-full bg-orange-600 text-white rounded-lg py-3 font-medium text-center hover:bg-orange-700 transition block"
          >
            📊 Ver Dashboard
          </Link>
          
          <Link 
            to="/historial" 
            className="w-full bg-gray-600 text-white rounded-lg py-3 font-medium text-center hover:bg-gray-700 transition block"
          >
            📋 Historial
          </Link>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-gray-600 font-medium text-sm">✅ App Desplegada</h3>
          <p className="text-gray-500 text-xs mt-1">Tu aplicación está VIVA en Vercel</p>
          <p className="text-gray-400 text-xs mt-2">Versión: 1.0.0</p>
        </div>
      </div>
    </div>
  );
}
