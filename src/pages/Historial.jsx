import React, { useState, useEffect } from 'react'
import { supabase } from '../config/supabaseClient'

const PROYECTOS_CONFIG = {
  'ANTA':       { emoji: '🔥', color: '#EA580C', bg: '#FFF7ED', border: '#FDBA74' },
  'METALPAC':   { emoji: '⚙️', color: '#2563EB', bg: '#EFF6FF', border: '#93C5FD' },
  'CASA NUEVA': { emoji: '🏠', color: '#D97706', bg: '#FFFBEB', border: '#FCD34D' },
  'PERSONAL':   { emoji: '👤', color: '#059669', bg: '#ECFDF5', border: '#6EE7B7' },
}

const COMPROBANTE = { FACTURA_LEGAL: '🧾 Factura legal', NOTA_VENTA: '📄 Nota de venta', SIN_DOCUMENTO: '🚫 Sin documento' }

export default function Historial() {
  const [txs, setTxs] = useState([])
  const [proyectos, setProyectos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [filtroProyecto, setFiltroProyecto] = useState('TODOS')
  const [busqueda, setBusqueda] = useState('')
  const [eliminando, setEliminando] = useState(null)
  const [detalle, setDetalle] = useState(null)
  const [editando, setEditando] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [guardandoEdit, setGuardandoEdit] = useState(false)

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

  const handleAbrirEditar = (t) => {
    setEditForm({
      monto: parseFloat(t.monto).toFixed(2),
      descripcion: t.descripcion || "",
      fecha: t.fecha,
      tipo_comprobante: t.tipo_comprobante || "SIN_DOCUMENTO",
      proyecto_id: t.proyecto_id || "",
      categoria_id: t.categoria_id || "",
    })
    setEditando(true)
  }

  const handleGuardarEdit = async () => {
    setGuardandoEdit(true)
    const { error } = await supabase.from("transacciones").update({
      monto: parseFloat(editForm.monto),
      descripcion: editForm.descripcion,
      fecha: editForm.fecha,
      tipo_comprobante: editForm.tipo_comprobante,
      proyecto_id: editForm.proyecto_id || null,
      categoria_id: editForm.categoria_id || null,
    }).eq("id", detalle.id)
    if (!error) { await cargarDatos(); setEditando(false); setDetalle(null) }
    setGuardandoEdit(false)
  }

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar este registro?')) return
    setEliminando(id)
    const { error } = await supabase.from('transacciones').delete().eq('id', id)
    if (!error) {
      setTxs(prev => prev.filter(t => t.id !== id))
      setDetalle(null)
    }
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

  const pillStyle = (activo, color) => ({
    flexShrink: 0, padding: "6px 14px", borderRadius: 99, flexShrink: 0,
    border: `2px solid ${activo ? color : '#E5E7EB'}`,
    backgroundColor: activo ? color : '#fff',
    color: activo ? '#fff' : '#9CA3AF',
    fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', backgroundColor: '#F3F4F6', overflow: 'hidden' }}>

      {/* HEADER */}
      <div style={{ backgroundColor: '#111827', padding: '14px 20px 12px', flexShrink: 0 }}>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, fontFamily: 'monospace', margin: 0 }}>HISTORIAL</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ color: '#fff', fontSize: 22, fontWeight: 900, fontFamily: 'monospace', margin: '2px 0 0' }}>{filtradas.length} registros</p>
          <p style={{ color: '#F97316', fontSize: 20, fontWeight: 900, fontFamily: 'monospace', margin: 0 }}>${totalFiltrado.toFixed(2)}</p>
        </div>
      </div>

      {/* BÚSQUEDA */}
      <div style={{ padding: '10px 12px 0', flexShrink: 0 }}>
        <input type="text" placeholder="🔍 Buscar descripción o categoría..." value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '2px solid #E5E7EB', fontSize: 14, backgroundColor: '#fff', boxSizing: 'border-box', outline: 'none' }} />
      </div>

      {/* FILTRO PILLS */}
      <div style={{ display: 'flex', gap: 6, padding: '10px 12px', flexShrink: 0 }}>
        {[{nombre:'TODOS', emoji:'📋', color:'#111827'}, ...Object.entries(PROYECTOS_CONFIG).map(([nombre,cfg])=>({nombre,...cfg}))].map(p => (
          <button key={p.nombre} onClick={() => setFiltroProyecto(p.nombre)}
            style={{ flex: 1, padding: '8px 0', borderRadius: 10, border: `2px solid ${filtroProyecto===p.nombre ? p.color : '#E5E7EB'}`, backgroundColor: filtroProyecto===p.nombre ? p.color : '#fff', color: filtroProyecto===p.nombre ? '#fff' : '#9CA3AF', fontSize: 16, cursor: 'pointer' }}>
            {p.emoji}
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
          return (
            <div key={t.id} onClick={() => setDetalle(t)}
              style={{ backgroundColor: '#fff', borderRadius: 14, padding: '12px 14px', marginBottom: 8, border: `1.5px solid ${cfg.border}`, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', opacity: eliminando === t.id ? 0.4 : 1 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                {cfg.emoji}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {t.descripcion || cNombre}
                </p>
                <p style={{ fontSize: 11, color: '#9CA3AF', margin: '2px 0 0' }}>
                  {t.es_split ? '🔀 Split' : cNombre} · {t.fecha}
                </p>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ fontSize: 15, fontWeight: 900, fontFamily: 'monospace', color: cfg.color, margin: 0 }}>${parseFloat(t.monto).toFixed(2)}</p>
                <p style={{ fontSize: 10, color: '#C4B5FD', margin: '2px 0 0' }}>ver detalle →</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* MODAL DETALLE */}
      {detalle && (() => {
        const pNombre = getNombreProy(detalle.proyecto_id)
        const cNombre = getNombreCat(detalle.categoria_id)
        const cfg = PROYECTOS_CONFIG[pNombre] || { emoji: '📋', color: '#6B7280', bg: '#F9FAFB', border: '#E5E7EB' }
        const lineas = detalle.lineas || []
        return (
          <div onClick={() => setDetalle(null)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 50, display: 'flex', alignItems: 'flex-end' }}>
            <div onClick={e => e.stopPropagation()} style={{ width: '100%', backgroundColor: '#fff', borderRadius: '20px 20px 0 0', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
              {/* Handle */}
              <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 6px' }}>
                <div style={{ width: 36, height: 4, borderRadius: 99, backgroundColor: '#E5E7EB' }} />
              </div>
              {/* Header */}
              <div style={{ padding: '0 20px 14px', borderBottom: '1px solid #F3F4F6' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ fontSize: 11, fontFamily: 'monospace', color: '#9CA3AF', margin: 0 }}>DETALLE DE GASTO</p>
                    <p style={{ fontSize: 20, fontWeight: 900, color: detalle.es_split ? '#6B7280' : cfg.color, margin: '4px 0 0' }}>
                      {detalle.es_split ? '🔀 Split' : `${cfg.emoji} ${pNombre}`}
                    </p>
                  </div>
                  <p style={{ fontSize: 28, fontWeight: 900, fontFamily: 'monospace', color: '#111827', margin: 0 }}>
                    ${parseFloat(detalle.monto).toFixed(2)}
                  </p>
                </div>
              </div>
              {/* Contenido */}
              <div style={{ overflow: 'auto', flex: 1, padding: "16px 20px 120px" }}>

                {/* Campos comunes */}
                {[
                  { label: 'FECHA', value: detalle.fecha },
                  { label: 'COMPROBANTE', value: COMPROBANTE[detalle.tipo_comprobante] || detalle.tipo_comprobante },
                  detalle.descripcion && { label: 'DESCRIPCIÓN', value: detalle.descripcion },
                  !detalle.es_split && { label: 'CATEGORÍA', value: cNombre },
                  !detalle.es_split && { label: 'PROYECTO', value: `${cfg.emoji} ${pNombre}` },
                ].filter(Boolean).map((f, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #F3F4F6' }}>
                    <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#9CA3AF', fontWeight: 700 }}>{f.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{f.value}</span>
                  </div>
                ))}

                {/* Líneas del split */}
                {detalle.es_split && lineas.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <p style={{ fontSize: 10, fontFamily: 'monospace', color: '#9CA3AF', fontWeight: 700, margin: '0 0 10px' }}>LÍNEAS ({lineas.length})</p>
                    {lineas.map((l, i) => {
                      const lPNombre = getNombreProy(l.proyecto_id)
                      const lCNombre = getNombreCat(l.categoria_id)
                      const lCfg = PROYECTOS_CONFIG[lPNombre] || { emoji: '📋', color: '#6B7280', bg: '#F9FAFB', border: '#E5E7EB' }
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, backgroundColor: lCfg.bg, border: `1.5px solid ${lCfg.border}`, marginBottom: 8 }}>
                          <span style={{ fontSize: 20 }}>{lCfg.emoji}</span>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: 12, fontWeight: 700, color: lCfg.color, margin: 0 }}>{lPNombre}</p>
                            <p style={{ fontSize: 11, color: '#9CA3AF', margin: '2px 0 0' }}>{lCNombre}</p>
                          </div>
                          <p style={{ fontSize: 16, fontWeight: 900, fontFamily: 'monospace', color: '#111827', margin: 0 }}>${parseFloat(l.monto).toFixed(2)}</p>
                        </div>
                      )
                    })}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                  <button onClick={() => handleAbrirEditar(detalle)}
                    style={{ flex: 1, padding: '14px', borderRadius: 14, border: 'none', backgroundColor: '#EFF6FF', color: '#2563EB', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                    ✏️ Editar
                  </button>
                  <button onClick={() => handleEliminar(detalle.id)} disabled={eliminando === detalle.id}
                    style={{ flex: 1, padding: '14px', borderRadius: 14, border: 'none', backgroundColor: '#FEF2F2', color: '#EF4444', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      })()}
    </div>

      {/* MODAL EDITAR */}
      {editando && detalle && (() => {
        const catsFiltradas = categorias.filter(cat => {
          const proy = proyectos.find(p => p.id === editForm.proyecto_id)
          return proy ? true : false
        })
        return (
          <div onClick={() => setEditando(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 60, display: 'flex', alignItems: 'flex-end' }}>
            <div onClick={e => e.stopPropagation()} style={{ width: '100%', backgroundColor: '#fff', borderRadius: '20px 20px 0 0', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 6px' }}>
                <div style={{ width: 36, height: 4, borderRadius: 99, backgroundColor: '#E5E7EB' }} />
              </div>
              <div style={{ padding: '0 20px 12px', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontSize: 16, fontWeight: 900, color: '#111827', margin: 0 }}>✏️ Editar registro</p>
                <button onClick={() => setEditando(false)} style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: 20, cursor: 'pointer' }}>✕</button>
              </div>
              <div style={{ overflow: 'auto', flex: 1, padding: '16px 20px 120px', display: 'flex', flexDirection: 'column', gap: 14 }}>

                {[
                  { label: 'MONTO ($)', field: 'monto', type: 'text', mode: 'decimal' },
                  { label: 'DESCRIPCIÓN', field: 'descripcion', type: 'text' },
                  { label: 'FECHA', field: 'fecha', type: 'date' },
                ].map(({ label, field, type, mode }) => (
                  <div key={field}>
                    <p style={{ fontSize: 10, fontFamily: 'monospace', color: '#9CA3AF', fontWeight: 700, margin: '0 0 6px' }}>{label}</p>
                    <input type={type} inputMode={mode} value={editForm[field]}
                      onChange={e => setEditForm(f => ({ ...f, [field]: e.target.value }))}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '2px solid #E5E7EB', fontSize: 15, boxSizing: 'border-box', outline: 'none' }} />
                  </div>
                ))}

                <div>
                  <p style={{ fontSize: 10, fontFamily: 'monospace', color: '#9CA3AF', fontWeight: 700, margin: '0 0 6px' }}>COMPROBANTE</p>
                  <select value={editForm.tipo_comprobante} onChange={e => setEditForm(f => ({ ...f, tipo_comprobante: e.target.value }))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '2px solid #E5E7EB', fontSize: 15, outline: 'none' }}>
                    <option value="FACTURA_LEGAL">🧾 Factura Legal</option>
                    <option value="NOTA_VENTA">📄 Nota de Venta</option>
                    <option value="SIN_DOCUMENTO">🚫 Sin documento</option>
                  </select>
                </div>

                <div>
                  <p style={{ fontSize: 10, fontFamily: 'monospace', color: '#9CA3AF', fontWeight: 700, margin: '0 0 6px' }}>PROYECTO</p>
                  <select value={editForm.proyecto_id} onChange={e => setEditForm(f => ({ ...f, proyecto_id: e.target.value, categoria_id: '' }))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '2px solid #E5E7EB', fontSize: 15, outline: 'none' }}>
                    <option value="">Selecciona proyecto</option>
                    {proyectos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                  </select>
                </div>

                <div>
                  <p style={{ fontSize: 10, fontFamily: 'monospace', color: '#9CA3AF', fontWeight: 700, margin: '0 0 6px' }}>CATEGORÍA</p>
                  <select value={editForm.categoria_id} onChange={e => setEditForm(f => ({ ...f, categoria_id: e.target.value }))}
                    disabled={!editForm.proyecto_id}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '2px solid #E5E7EB', fontSize: 15, outline: 'none', opacity: editForm.proyecto_id ? 1 : 0.5 }}>
                    <option value="">Selecciona categoría</option>
                    {categorias.filter(c => c.proyecto_id === editForm.proyecto_id).map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>

                <button onClick={handleGuardarEdit} disabled={guardandoEdit}
                  style={{ width: '100%', padding: '16px', borderRadius: 14, border: 'none', backgroundColor: '#2563EB', color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer', opacity: guardandoEdit ? 0.5 : 1 }}>
                  {guardandoEdit ? '⏳ Guardando...' : '💾 Guardar cambios'}
                </button>
              </div>
            </div>
          </div>
        )
      })()}
  )
}
