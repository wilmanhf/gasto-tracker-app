import React, { useState, useEffect } from 'react'
import { supabase } from '../config/supabaseClient'

const PROYECTOS_CONFIG = {
  'ANTA':       { emoji: '🔥', color: '#EA580C', bg: '#FFF7ED', border: '#FDBA74' },
  'METALPAC':   { emoji: '⚙️', color: '#2563EB', bg: '#EFF6FF', border: '#93C5FD' },
  'CASA NUEVA': { emoji: '🏠', color: '#D97706', bg: '#FFFBEB', border: '#FCD34D' },
  'PERSONAL':   { emoji: '👤', color: '#059669', bg: '#ECFDF5', border: '#6EE7B7' },
}

export default function Historial() {
  const [txs, setTxs] = useState([])
  const [proyectos, setProyectos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [filtroProyecto, setFiltroProyecto] = useState('TODOS')
  const [busqueda, setBusqueda] = useState('')
  const [eliminando, setEliminando] = useState(null)

  useEffect(() => { cargarDatos() }, [])

  const cargarDatos = async () => {
    setCargando(true)
    const [{ data: p }, { data: c }, { data: t }] = await Promise.all([
      supabase.from('proyectos').select('id, nombre'),
      supabase.from('categorias').select('id, nombre'),
      supabase.from('transacciones').select('*').order('fecha', { ascending: false })
    ])
    setProyectos(p || [])
    setCategorias(c || [])
    setTxs(t || [])
    setCargando(false)
  }

  const getNombreProy = (id) => proyectos.find(p => p.id === id)?.nombre || '—'
  const getNombreCat  = (id) => categorias.find(c => c.id === id)?.nombre || '—'

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar este registro?')) return
    setEliminando(id)
    const { error } = await supabase.from('transacciones').delete().eq('id', id)
    if (!error) setTxs(prev => prev.filter(t => t.id !== id))
    setEliminando(null)
  }

  const filtradas = txs.filter(t => {
    const pNombre = getNombreProy(t.proyecto_id)
    const cNombre = getNombreCat(t.categoria_id)
    const matchProy = filtroProyecto === 'TODOS' || pNombre === filtroProyecto
    const matchBusq = !busqueda ||
      (t.descripcion || '').toLowerCase().includes(busqueda.toLowerCase()) ||
      cNombre.toLowerCase().includes(busqueda.toLowerCase())
    return matchProy && matchBusq
  })

  const totalFiltrado = filtradas.reduce((s, t) => s + parseFloat(t.monto || 0), 0)

  const pillStyle = (activo, cfg) => ({
    flexShrink: 0,
    padding: '6px 14px',
    borderRadius: 99,
    border: `2px solid ${activo ? (cfg?.color || '#111827') : '#E5E7EB'}`,
    backgroundColor: activo ? (cfg?.color || '#111827') : '#fff',
    color: activo ? '#fff' : '#9CA3AF',
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', backgroundColor: '#F3F4F6', overflow: 'hidden' }}>

      {/* HEADER */}
      <div style={{ backgroundColor: '#111827', padding: '14px 20px 12px', flexShrink: 0 }}>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, fontFamily: 'monospace', margin: 0 }}>HISTORIAL</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ color: '#fff', fontSize: 22, fontWeight: 900, fontFamily: 'monospace', margin: '2px 0 0' }}>
            {filtradas.length} registros
          </p>
          <p style={{ color: '#F97316', fontSize: 20, fontWeight: 900, fontFamily: 'monospace', margin: 0 }}>
            ${totalFiltrado.toFixed(2)}
          </p>
        </div>
      </div>

      {/* BÚSQUEDA */}
      <div style={{ padding: '10px 12px 0', flexShrink: 0 }}>
        <input
          type="text"
          placeholder="🔍 Buscar descripción o categoría..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '2px solid #E5E7EB', fontSize: 14, backgroundColor: '#fff', boxSizing: 'border-box', outline: 'none' }}
        />
      </div>

      {/* FILTRO PROYECTOS — pills horizontales */}
      <div style={{ display: 'flex', gap: 8, padding: '10px 12px', overflowX: 'auto', flexShrink: 0, scrollbarWidth: 'none' }}>
        <button onClick={() => setFiltroProyecto('TODOS')} style={pillStyle(filtroProyecto === 'TODOS', null)}>
          📋 TODOS
        </button>
        {Object.entries(PROYECTOS_CONFIG).map(([nombre, cfg]) => (
          <button key={nombre} onClick={() => setFiltroProyecto(nombre)} style={pillStyle(filtroProyecto === nombre, cfg)}>
            {cfg.emoji} {nombre}
          </button>
        ))}
      </div>

      {/* LISTA */}
      <div style={{ flex: 1, overflow: 'auto', padding: '0 12px 16px' }}>
        {cargando ? (
          <p style={{ textAlign: 'center', color: '#9CA3AF', fontFamily: 'monospace', marginTop: 40 }}>Cargando...</p>
        ) : filtradas.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#D1D5DB', marginTop: 40, fontSize: 14 }}>Sin transacciones</p>
        ) : filtradas.map(t => {
          const pNombre = getNombreProy(t.proyecto_id)
          const cNombre = getNombreCat(t.categoria_id)
          const cfg = PROYECTOS_CONFIG[pNombre] || { emoji: '📋', color: '#6B7280', bg: '#F9FAFB', border: '#E5E7EB' }
          const esEliminando = eliminando === t.id
          return (
            <div key={t.id} style={{ backgroundColor: '#fff', borderRadius: 14, padding: '12px 14px', marginBottom: 8, border: `1.5px solid ${cfg.border}`, display: 'flex', alignItems: 'center', gap: 10, opacity: esEliminando ? 0.4 : 1 }}>
              {/* Icono proyecto */}
              <div style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                {cfg.emoji}
              </div>
              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {t.descripcion || cNombre}
                </p>
                <p style={{ fontSize: 11, color: '#9CA3AF', margin: '2px 0 0' }}>
                  {cNombre} · {t.fecha}
                  {t.es_split && <span style={{ marginLeft: 6, fontSize: 9, backgroundColor: '#F3F4F6', color: '#6B7280', borderRadius: 4, padding: '1px 5px', fontFamily: 'monospace' }}>🔀 SPLIT</span>}
                </p>
              </div>
              {/* Monto */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ fontSize: 15, fontWeight: 900, fontFamily: 'monospace', color: cfg.color, margin: 0 }}>
                  ${parseFloat(t.monto).toFixed(2)}
                </p>
                <p style={{ fontSize: 11, color: '#9CA3AF', margin: '1px 0 0' }}>
                  {t.tipo_comprobante === 'FACTURA_LEGAL' ? '🧾' : t.tipo_comprobante === 'NOTA_VENTA' ? '📄' : '🚫'}
                </p>
              </div>
              {/* Eliminar */}
              <button onClick={() => handleEliminar(t.id)} disabled={esEliminando}
                style={{ flexShrink: 0, width: 32, height: 32, borderRadius: 8, border: 'none', backgroundColor: '#FEF2F2', color: '#EF4444', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                🗑️
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
