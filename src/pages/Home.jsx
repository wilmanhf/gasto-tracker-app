import React from 'react'

export default function Home() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', backgroundColor: '#111827', overflow: 'hidden' }}>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px 16px' }}>
        <p style={{ fontSize: 56, margin: '0 0 6px' }}>💰</p>
        <h1 style={{ fontSize: 30, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>Gasto Tracker</h1>
        <p style={{ fontSize: 11, color: '#6B7280', fontFamily: 'monospace', margin: '4px 0 0', letterSpacing: '0.1em' }}>CONTROL FINANCIERO PERSONAL</p>
        <div style={{ width: 40, height: 2, backgroundColor: '#F97316', borderRadius: 99, margin: '20px 0' }} />

        <div style={{ display: 'flex', gap: 12, width: '100%', maxWidth: 360, justifyContent: 'center' }}>

          {/* ANTA */}
          <div style={{ flex: 1, backgroundColor: '#1F2937', borderRadius: 18, aspectRatio: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 10, border: '1px solid #EA580C40' }}>
            <img src="/logos/anta.png" alt="ANTA" style={{ width: '75%', height: '70%', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
            <p style={{ fontSize: 9, fontWeight: 800, color: '#EA580C', margin: '6px 0 0', fontFamily: 'monospace', letterSpacing: '0.1em' }}>ANTA</p>
          </div>

          {/* METALPAC */}
          <div style={{ flex: 1, backgroundColor: '#1F2937', borderRadius: 18, aspectRatio: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 10, border: '1px solid #2563EB40' }}>
            <img src="/logos/metalpac.png" alt="METALPAC" style={{ width: '85%', height: '70%', objectFit: 'contain', borderRadius: 8 }} />
            <p style={{ fontSize: 9, fontWeight: 800, color: '#2563EB', margin: '6px 0 0', fontFamily: 'monospace', letterSpacing: '0.1em' }}>METALPAC</p>
          </div>

          {/* CASA */}
          <div style={{ flex: 1, backgroundColor: '#1F2937', borderRadius: 18, aspectRatio: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid #D9770640' }}>
            <p style={{ fontSize: 36, margin: 0 }}>🏠</p>
            <p style={{ fontSize: 9, fontWeight: 800, color: '#D97706', margin: '6px 0 0', fontFamily: 'monospace', letterSpacing: '0.1em' }}>CASA</p>
          </div>

          {/* PERSONAL — foto familia */}
          <div style={{ flex: 1, backgroundColor: '#1F2937', borderRadius: 18, aspectRatio: '1', overflow: 'hidden', position: 'relative', border: '1px solid #05966940' }}>
            <img src="/logos/familia.jpg" alt="Familia" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.6)', padding: '4px' }}>
              <p style={{ fontSize: 9, fontWeight: 800, color: '#10B981', margin: 0, fontFamily: 'monospace', letterSpacing: '0.05em', textAlign: 'center' }}>PERSONAL</p>
            </div>
          </div>

        </div>

        <p style={{ fontSize: 11, color: '#374151', fontFamily: 'monospace', margin: '20px 0 0' }}>v1.0.0 · React + Supabase</p>
      </div>

      {/* FIRMA */}
      <div style={{ padding: '16px 24px 28px', borderTop: '1px solid #1F2937', textAlign: 'center' }}>
        <p style={{ fontSize: 11, color: '#4B5563', fontFamily: 'monospace', margin: '0 0 4px', letterSpacing: '0.08em' }}>DISEÑADO Y DESARROLLADO POR</p>
        <p style={{ fontSize: 20, fontWeight: 900, color: '#F97316', margin: 0 }}>Wilman Herrera Figueroa</p>
        <p style={{ fontSize: 11, color: '#374151', fontFamily: 'monospace', margin: '4px 0 0' }}>Cuenca, Ecuador · 2026</p>
      </div>

    </div>
  )
}
