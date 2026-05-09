import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  const opciones = [
    {
      to: '/captura',
      icon: '📸',
      titulo: 'Capturar Gasto',
      descripcion: 'Fotografía o manual',
      color: 'bg-gray-700 hover:bg-gray-800'
    },
    {
      to: '/dashboard',
      icon: '📊',
      titulo: 'Dashboard',
      descripcion: 'Resumen financiero',
      color: 'bg-orange-600 hover:bg-orange-700'
    },
    {
      to: '/historial',
      icon: '📋',
      titulo: 'Historial',
      descripcion: 'Transacciones',
      color: 'bg-gray-500 hover:bg-gray-600'
    },
    {
      to: '/metas',
      icon: '💰',
      titulo: 'Metas',
      descripcion: 'Objetivos ahorro',
      color: 'bg-gray-700 hover:bg-gray-800'
    },
    {
      to: '/reportes',
      icon: '📄',
      titulo: 'Reportes',
      descripcion: 'CSV / PDF',
      color: 'bg-orange-500 hover:bg-orange-600'
    },
    {
      to: '/sri',
      icon: '🏛️',
      titulo: 'Análisis SRI',
      descripcion: 'Códigos tributarios',
      color: 'bg-gray-500 hover:bg-gray-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER */}
        <div className="text-center mb-8 mt-4">
          <div className="text-3xl mb-3">💰</div>
          <h1 className="text-3xl font-bold text-gray-800">Gasto Tracker</h1>
          <p className="text-gray-500 text-sm mt-2">Sistema de Inteligencia Financiera</p>
        </div>

        {/* GRID 2x3 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {opciones.map((opcion, idx) => (
            <Link
              key={idx}
              to={opcion.to}
              className={`${opcion.color} text-white rounded-lg p-6 text-center transition transform hover:scale-105 active:scale-95 shadow-md`}
            >
              <div className="text-lg mb-2">{opcion.icon}</div>
              <h2 className="font-bold text-base">{opcion.titulo}</h2>
              <p className="text-xs text-gray-100 mt-1">{opcion.descripcion}</p>
            </Link>
          ))}
        </div>

        {/* STATUS */}
        <div className="bg-white rounded-lg p-4 text-center shadow-md border-t-4 border-orange-500">
          <h3 className="text-gray-700 font-medium">✅ App Desplegada</h3>
          <p className="text-gray-500 text-xs mt-1">Tu aplicación está VIVA en Vercel</p>
          <p className="text-gray-400 text-xs mt-2">Versión: 1.0.0</p>
        </div>
      </div>
    </div>
  );
}
