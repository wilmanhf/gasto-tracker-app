import React, { useState, useEffect } from 'react'

export default function SplashScreen({ onDone }) {
  const [fase, setFase] = useState(0)

  useEffect(() => {
    const t1 = setTimeout(() => setFase(1), 100)
    const t2 = setTimeout(() => setFase(2), 1200)
    const t3 = setTimeout(() => setFase(3), 3800)
    const t4 = setTimeout(() => onDone(), 4800)
    return () => [t1,t2,t3,t4].forEach(clearTimeout)
  }, [])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      backgroundColor: '#111827',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      transition: 'opacity 0.6s ease',
      opacity: fase === 3 ? 0 : 1,
    }}>
      {/* Escudo */}
      <div style={{
        transform: fase >= 1 ? 'scale(1)' : 'scale(0.3)',
        opacity: fase >= 1 ? 1 : 0,
        transition: 'transform 0.6s cubic-bezier(0.34,1.56,0.64,1), opacity 0.4s ease',
      }}>
        <svg width="160" height="160" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
          <rect width="512" height="512" rx="112" fill="#1F2937"/>
          <path d="M40 61 Q256 36 472 61 L472 272 Q256 460 40 272 Z" fill="#374151"/>
          <path d="M60 82 Q256 58 452 82 L452 266 Q256 432 60 266 Z" fill="#F97316"/>
          <path d="M82 106 Q256 82 430 106 L430 258 Q256 408 82 258 Z" fill="#EA580C"/>
          <text x="256" y="272" fontFamily="Georgia,serif" fontSize="180" fontWeight="700" fill="#ffffff" textAnchor="middle">GT</text>
        </svg>
      </div>

      {/* Nombre */}
      <div style={{
        marginTop: 24,
        opacity: fase >= 2 ? 1 : 0,
        transform: fase >= 2 ? 'translateY(0)' : 'translateY(16px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: 28, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>Gasto Tracker</p>
        <p style={{ fontSize: 12, color: '#6B7280', fontFamily: 'monospace', margin: '6px 0 0', letterSpacing: '0.15em' }}>CONTROL FINANCIERO PERSONAL</p>
      </div>

      {/* Línea naranja animada */}
      <div style={{
        marginTop: 32,
        height: 3,
        borderRadius: 99,
        backgroundColor: '#F97316',
        width: fase >= 2 ? 80 : 0,
        transition: 'width 0.8s ease',
      }} />

      {/* Firma */}
      <div style={{
        position: 'absolute', bottom: 48,
        opacity: fase >= 2 ? 1 : 0,
        transition: 'opacity 0.5s ease 0.3s',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: 11, color: '#374151', fontFamily: 'monospace', margin: 0, letterSpacing: '0.08em' }}>DISEÑADO POR</p>
        <p style={{ fontSize: 14, fontWeight: 700, color: '#F97316', margin: '4px 0 0' }}>Wilman Herrera Figueroa</p>
      </div>
    </div>
  )
}
