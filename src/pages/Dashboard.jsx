import React, { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { supabase } from '../config/supabaseClient'

const PROYECTOS = [
  { nombre: 'ANTA',      emoji: '🔥', color: '#EA580C', bg: '#FFF7ED', border: '#FDBA74' },
  { nombre: 'METALPAC',  emoji: '⚙️', color: '#2563EB', bg: '#EFF6FF', border: '#93C5FD' },
  { nombre: 'CASA NUEVA',emoji: '🏠', color: '#D97706', bg: '#FFFBEB', border: '#FCD34D' },
  { nombre: 'PERSONAL',  emoji: '👤', color: '#059669', bg: '#ECFDF5', border: '#6EE7B7' },
]

const COLORES_CAT = ['#EA580C','#2563EB','#059669','#D97706','#7C3AED','#0EA5E9','#F43F5E']

export default function Dashboard() {
  const [tabIdx, setTabIdx] = useState(0)
  const [datos, setDatos] = useState({})
  const [cargando, setCargando] = useState(true)

  useEffect(() => { cargarDatos() }, [])

  const cargarDatos = async () => {
    setCargando(true)
    try {
      const { data: proyectos } = await supabase.from('proyectos').select('id, nombre')
      const { data: categorias } = await supabase.from('categorias').select('id, nombre, proyecto_id')
      const { data: txs } = await supabase.from('transacciones').select('*').eq('tipo', 'GASTO')

      const resultado = {}
      for (const p of proyectos) {
        const txProy = txs.filter(t => t.proyecto_id === p.id)
        const total = txProy.reduce((s, t) => s + parseFloat(t.monto || 0), 0)
        const catMap = {}
        for (const t of txProy) {
          const cat = categorias.find(c => c.id === t.categoria_id)
          const nombre = cat?.nombre || 'Otros'
          catMap[nombre] = (catMap[nombre] || 0) + parseFloat(t.monto || 0)
        }
        const porCategoria = Object.entries(catMap)
          .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5)

        resultado[p.nombre] = {
          total: parseFloat(total.toFixed(2)),
          count: txProy.length,
          porCategoria,
          recientes: txProy
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
            .slice(0, 3)
            .map(t => ({
              monto: parseFloat(t.monto),
              fecha: t.fecha,
              desc: t.descripcion || '—',
              cat: categorias.find(c => c.id === t.categoria_id)?.nombre || 'Otros'
            }))
        }
      }
      setDatos(resultado)
    } catch(e) { console.error(e) }
    finally { setCargando(false) }
  }

  const proy = PROYECTOS[tabIdx]
  const d = datos[proy.nombre] || { total: 0, count: 0, porCategoria: [], recientes: [] }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', backgroundColor: '#F9FAFB', overflow: 'hidden' }}>

      {/* HEADER */}
      <div style={{ backgroundColor: proy.color, padding: '14px 20px 10px', flexShrink: 0 }}>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 10, fontFamily: 'monospace', margin: 0, letterSpacing: '0.1em' }}>DASHBOARD</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ color: '#fff', fontSize: 20, fontWeight: 900, margin: '2px 0 0' }}>{proy.emoji} {proy.nombre}</h1>
          <button onClick={cargarDatos} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, padding: '4px 10px', cursor: 'pointer' }}>↺</button>
        </div>
      </div>

      {/* TABS */}
      <div style={{ display: 'flex', backgroundColor: '#fff', borderBottom: '1px solid #E5E7EB', flexShrink: 0 }}>
        {PROYECTOS.map((p, i) => (
          <button key={p.nombre} onClick={() => setTabIdx(i)} style={{ flex: 1, padding: '10px 0', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', fontSize: 18, borderBottom: tabIdx === i ? `3px solid ${p.color}` : '3px solid transparent', transition: 'all 0.15s' }}>
            {p.emoji}
          </button>
        ))}
      </div>

      {cargando ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: '#9CA3AF', fontFamily: 'monospace', fontSize: 13 }}>Cargando...</p>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '12px 16px', gap: 10, overflow: 'hidden' }}>

          {/* KPI */}
          <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
            <div style={{ flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: '12px 14px', border: `2px solid ${proy.border}` }}>
              <p style={{ fontSize: 10, color: '#9CA3AF', fontFamily: 'monospace', margin: 0, fontWeight: 700 }}>TOTAL GASTADO</p>
              <p style={{ fontSize: 26, fontWeight: 900, fontFamily: 'monospace', color: proy.color, margin: '2px 0 0' }}>${d.total.toFixed(2)}</p>
            </div>
            <div style={{ backgroundColor: '#fff', borderRadius: 14, padding: '12px 14px', border: '2px solid #E5E7EB', minWidth: 70, textAlign: 'center' }}>
              <p style={{ fontSize: 10, color: '#9CA3AF', fontFamily: 'monospace', margin: 0, fontWeight: 700 }}>REGISTROS</p>
              <p style={{ fontSize: 26, fontWeight: 900, color: '#374151', margin: '2px 0 0' }}>{d.count}</p>
            </div>
          </div>

          {/* CONTENIDO PRINCIPAL: gráfico + categorías */}
          <div style={{ display: 'flex', gap: 10, flex: 1, minHeight: 0 }}>

            {/* PIE CHART */}
            <div style={{ flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              {d.porCategoria.length > 0 ? (
                <>
                  <p style={{ fontSize: 10, color: '#9CA3AF', fontFamily: 'monospace', margin: '0 0 4px', fontWeight: 700, alignSelf: 'flex-start' }}>POR CATEGORÍA</p>
                  <ResponsiveContainer width="100%" height={130}>
                    <PieChart>
                      <Pie data={d.porCategoria} cx="50%" cy="50%" innerRadius={30} outerRadius={55} dataKey="value" paddingAngle={3}>
                        {d.porCategoria.map((_, i) => <Cell key={i} fill={COLORES_CAT[i % COLORES_CAT.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v) => `$${v.toFixed(2)}`} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ width: '100%' }}>
                    {d.porCategoria.map((c, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: COLORES_CAT[i % COLORES_CAT.length], flexShrink: 0 }} />
                        <span style={{ fontSize: 10, color: '#6B7280', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#111827', fontFamily: 'monospace' }}>${c.value.toFixed(0)}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p style={{ color: '#D1D5DB', fontSize: 12, textAlign: 'center' }}>Sin datos aún</p>
              )}
            </div>

            {/* RECIENTES */}
            <div style={{ flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: '10px', display: 'flex', flexDirection: 'column' }}>
              <p style={{ fontSize: 10, color: '#9CA3AF', fontFamily: 'monospace', margin: '0 0 8px', fontWeight: 700 }}>RECIENTES</p>
              {d.recientes.length > 0 ? d.recientes.map((t, i) => (
                <div key={i} style={{ paddingBottom: 8, marginBottom: 8, borderBottom: i < d.recientes.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 11, color: '#374151', fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: 6 }}>{t.desc}</span>
                    <span style={{ fontSize: 12, fontWeight: 800, fontFamily: 'monospace', color: proy.color, flexShrink: 0 }}>${t.monto.toFixed(2)}</span>
                  </div>
                  <span style={{ fontSize: 10, color: '#9CA3AF' }}>{t.cat} · {t.fecha}</span>
                </div>
              )) : (
                <p style={{ color: '#D1D5DB', fontSize: 12, textAlign: 'center', marginTop: 20 }}>Sin registros</p>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  )
}
