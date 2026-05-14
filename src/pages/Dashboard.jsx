import React, { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { supabase } from '../config/supabaseClient'

const PROYECTOS = [
  { nombre: 'ANTA',       emoji: '🔥', color: '#EA580C', bg: '#FFF7ED', border: '#FDBA74' },
  { nombre: 'METALPAC',   emoji: '⚙️', color: '#2563EB', bg: '#EFF6FF', border: '#93C5FD' },
  { nombre: 'CASA NUEVA', emoji: '🏠', color: '#D97706', bg: '#FFFBEB', border: '#FCD34D' },
  { nombre: 'PERSONAL',   emoji: '👤', color: '#059669', bg: '#ECFDF5', border: '#6EE7B7' },
]

const COLORES = ['#EA580C','#2563EB','#059669','#D97706','#7C3AED','#0EA5E9','#F43F5E']

export default function Dashboard() {
  const [datos, setDatos] = useState({})
  const [cargando, setCargando] = useState(true)
  const [detalle, setDetalle] = useState(null)

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
        resultado[p.nombre] = {
          total: parseFloat(total.toFixed(2)),
          count: txProy.length,
          porCategoria,
          recientes: txProy
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
            .slice(0, 5)
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

  const totalGlobal = Object.values(datos).reduce((s, d) => s + (d?.total || 0), 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', backgroundColor: '#F3F4F6', overflow: 'hidden' }}>
      <div style={{ backgroundColor: '#111827', padding: '14px 20px 12px', flexShrink: 0 }}>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, fontFamily: 'monospace', margin: 0 }}>RESUMEN TOTAL</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ color: '#fff', fontSize: 28, fontWeight: 900, fontFamily: 'monospace', margin: '2px 0 0' }}>${totalGlobal.toFixed(2)}</p>
          <button onClick={cargarDatos} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, padding: '5px 12px', cursor: 'pointer' }}>↺</button>
        </div>
      </div>
      {cargando ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: '#9CA3AF', fontFamily: 'monospace' }}>Cargando...</p>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 10, padding: 10, overflow: 'hidden' }}>
          {PROYECTOS.map(p => {
            const d = datos[p.nombre] || { total: 0, count: 0, porCategoria: [] }
            const pct = totalGlobal > 0 ? ((d.total / totalGlobal) * 100).toFixed(0) : 0
            return (
              <div key={p.nombre} onClick={() => setDetalle(p.nombre)}
                style={{ backgroundColor: '#fff', borderRadius: 16, padding: '12px', border: `2px solid ${p.border}`, cursor: 'pointer', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <div>
                    <p style={{ fontSize: 18, margin: 0 }}>{p.emoji}</p>
                    <p style={{ fontSize: 10, fontWeight: 800, color: p.color, margin: '2px 0 0', fontFamily: 'monospace' }}>{p.nombre}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 9, color: '#9CA3AF', margin: 0, fontFamily: 'monospace' }}>{pct}% total</p>
                    <p style={{ fontSize: 8, color: '#D1D5DB', margin: '1px 0 0', fontFamily: 'monospace' }}>{d.count} reg.</p>
                  </div>
                </div>
                <p style={{ fontSize: 20, fontWeight: 900, fontFamily: 'monospace', color: '#111827', margin: '0 0 4px' }}>${d.total.toFixed(2)}</p>
                {d.porCategoria.length > 0 ? (
                  <div style={{ flex: 1, minHeight: 0 }}>
                    <ResponsiveContainer width="100%" height={70}>
                      <PieChart>
                        <Pie data={d.porCategoria} cx="50%" cy="50%" innerRadius={18} outerRadius={32} dataKey="value" paddingAngle={2}>
                          {d.porCategoria.map((_, i) => <Cell key={i} fill={COLORES[i % COLORES.length]} />)}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <p style={{ fontSize: 9, color: '#9CA3AF', textAlign: 'center', margin: 0 }}>tap para detalle</p>
                  </div>
                ) : (
                  <p style={{ fontSize: 10, color: '#D1D5DB', textAlign: 'center', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 0 }}>Sin registros</p>
                )}
              </div>
            )
          })}
        </div>
      )}
      {detalle && (() => {
        const p = PROYECTOS.find(x => x.nombre === detalle)
        const d = datos[detalle] || { total: 0, count: 0, porCategoria: [], recientes: [] }
        return (
          <div onClick={() => setDetalle(null)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 50, display: 'flex', alignItems: 'flex-end' }}>
            <div onClick={e => e.stopPropagation()} style={{ width: '100%', backgroundColor: '#fff', borderRadius: '20px 20px 0 0', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 8px' }}>
                <div style={{ width: 36, height: 4, borderRadius: 99, backgroundColor: '#E5E7EB' }} />
              </div>
              <div style={{ padding: '0 20px 16px', borderBottom: '1px solid #F3F4F6' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: 22, margin: 0 }}>{p.emoji}</p>
                    <p style={{ fontSize: 18, fontWeight: 900, color: p.color, margin: '2px 0 0' }}>{p.nombre}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 28, fontWeight: 900, fontFamily: 'monospace', color: '#111827', margin: 0 }}>${d.total.toFixed(2)}</p>
                    <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0 }}>{d.count} transacciones</p>
                  </div>
                </div>
              </div>
              <div style={{ overflow: 'auto', flex: 1, padding: '16px 20px 32px' }}>
                {d.porCategoria.length > 0 && (
                  <>
                    <p style={{ fontSize: 10, fontFamily: 'monospace', color: '#9CA3AF', fontWeight: 700, margin: '0 0 8px' }}>POR CATEGORÍA</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                      <div style={{ flexShrink: 0 }}>
                        <ResponsiveContainer width={110} height={110}>
                          <PieChart>
                            <Pie data={d.porCategoria} cx="50%" cy="50%" innerRadius={28} outerRadius={50} dataKey="value" paddingAngle={3}>
                              {d.porCategoria.map((_, i) => <Cell key={i} fill={COLORES[i % COLORES.length]} />)}
                            </Pie>
                            <Tooltip formatter={v => `$${v.toFixed(2)}`} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div style={{ flex: 1 }}>
                        {d.porCategoria.map((c, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: COLORES[i % COLORES.length], flexShrink: 0 }} />
                            <span style={{ fontSize: 11, color: '#374151', flex: 1 }}>{c.name}</span>
                            <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'monospace' }}>${c.value.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                <p style={{ fontSize: 10, fontFamily: 'monospace', color: '#9CA3AF', fontWeight: 700, margin: '0 0 10px' }}>ÚLTIMAS TRANSACCIONES</p>
                {d.recientes.length > 0 ? d.recientes.map((t, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #F3F4F6' }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: 0 }}>{t.desc}</p>
                      <p style={{ fontSize: 11, color: '#9CA3AF', margin: '2px 0 0' }}>{t.cat} · {t.fecha}</p>
                    </div>
                    <p style={{ fontSize: 15, fontWeight: 800, fontFamily: 'monospace', color: p.color, margin: 0 }}>${t.monto.toFixed(2)}</p>
                  </div>
                )) : <p style={{ color: '#D1D5DB', fontSize: 13 }}>Sin transacciones</p>}
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
