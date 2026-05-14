import React from 'react'

export default function Home() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', backgroundColor: '#111827', overflow: 'hidden' }}>

      {/* TOP — Logo y título */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px 20px' }}>
        <p style={{ fontSize: 64, margin: '0 0 8px' }}>💰</p>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.02em', textAlign: 'center' }}>Gasto Tracker</h1>
        <p style={{ fontSize: 13, color: '#6B7280', fontFamily: 'monospace', margin: '6px 0 0', letterSpacing: '0.1em' }}>CONTROL FINANCIERO PERSONAL</p>

        {/* Línea separadora */}
        <div style={{ width: 40, height: 2, backgroundColor: '#F97316', borderRadius: 99, margin: '24px 0' }} />

        {/* Proyectos */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
          {[
            { emoji: '🔥', nombre: 'ANTA',     color: '#EA580C', bg: 'rgba(234,88,12,0.1)'  },
            { emoji: '⚙️', nombre: 'METALPAC', color: '#2563EB', bg: 'rgba(37,99,235,0.1)'  },
            { emoji: '🏠', nombre: 'CASA',     color: '#D97706', bg: 'rgba(217,119,6,0.1)'  },
            { emoji: '👤', nombre: 'PERSONAL', color: '#059669', bg: 'rgba(5,150,105,0.1)'  },
          ].map(p => (
            <div key={p.nombre} style={{ flex: 1, backgroundColor: p.bg, borderRadius: 14, padding: '14px 8px', textAlign: 'center', border: `1px solid ${p.color}30` }}>
              <p style={{ fontSize: 24, margin: 0 }}>{p.emoji}</p>
              <p style={{ fontSize: 9, fontWeight: 800, color: p.color, margin: '6px 0 0', fontFamily: 'monospace', letterSpacing: '0.05em' }}>{p.nombre}</p>
            </div>
          ))}
        </div>

        {/* Versión */}
        <p style={{ fontSize: 11, color: '#374151', fontFamily: 'monospace', margin: 0 }}>v1.0.0 · React + Supabase</p>
      </div>

      {/* BOTTOM — Firma */}
      <div style={{ padding: '20px 24px 32px', borderTop: '1px solid #1F2937', textAlign: 'center' }}>
        <p style={{ fontSize: 11, color: '#4B5563', fontFamily: 'monospace', margin: '0 0 4px', letterSpacing: '0.08em' }}>DISEÑADO Y DESARROLLADO POR</p>
        <p style={{ fontSize: 18, fontWeight: 900, color: '#F97316', margin: 0, letterSpacing: '-0.01em' }}>Wilman Herrera Figueroa</p>
        <p style={{ fontSize: 11, color: '#374151', fontFamily: 'monospace', margin: '4px 0 0' }}>Cuenca, Ecuador · 2026</p>
      </div>

    </div>
  )
}
