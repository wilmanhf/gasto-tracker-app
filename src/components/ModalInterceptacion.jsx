import React, { useState, useEffect } from 'react'
import { supabase } from '../config/supabaseClient'
const PROYECTO_CONFIG = {'CASA NUEVA': { emoji: '🏠', bg: '#F59E0B', bgLight: '#FFFBEB', border: '#FCD34D', text: '#92400E' },'METALPAC': { emoji: '⚙️', bg: '#2563EB', bgLight: '#EFF6FF', border: '#93C5FD', text: '#1E3A8A' },'ANTA': { emoji: '🔥', bg: '#EA580C', bgLight: '#FFF7ED', border: '#FDBA74', text: '#9A3412' },'PERSONAL': { emoji: '👤', bg: '#059669', bgLight: '#ECFDF5', border: '#6EE7B7', text: '#065F46' },}
const PASOS = { PROYECTO: 1, CATEGORIA: 2, TIPO_LINEA: 3, SPLIT: 4, CONFIRMACION: 5 }
const PASO_LABELS = { 1: '¿A qué proyecto?', 2: '¿Qué categoría?', 3: '¿Cómo registrar?', 4: 'Dividir entre líneas', 5: 'Confirmar registro' }
export default function ModalInterceptacion({ transaccion, onConfirm, onClose }) {
  const [paso, setPaso] = useState(PASOS.PROYECTO)
  const [proyectos, setProyectos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [cargandoCategorias, setCargandoCategorias] = useState(false)
  const [proyectoSel, setProyectoSel] = useState(null)
  const [categoriaSel, setCategoriaSel] = useState(null)
  const [esSplit, setEsSplit] = useState(false)
  const [lineas, setLineas] = useState([])
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)
  const [nuevaLinea, setNuevaLinea] = useState({ monto: '', proyecto_id: '', categoria_id: '', categoriasCarga: [] })
  const montoTotal = parseFloat(transaccion?.monto || 0)
  const montoFormateado = `$${montoTotal.toFixed(2)}`
  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('proyectos').select('id, nombre').order('nombre')
      setProyectos(data || [])
    }
    fetch()
  }, [])
  useEffect(() => {
    if (!proyectoSel) return
    const fetch = async () => {
      setCargandoCategorias(true)
      const { data } = await supabase.from('categorias').select('id, nombre').eq('proyecto_id', proyectoSel.id).order('nombre')
      setCategorias(data || [])
      setCargandoCategorias(false)
    }
    fetch()
  }, [proyectoSel])
  useEffect(() => {
    if (!nuevaLinea.proyecto_id) return
    const fetch = async () => {
      const { data } = await supabase.from('categorias').select('id, nombre').eq('proyecto_id', nuevaLinea.proyecto_id).order('nombre')
      setNuevaLinea(prev => ({ ...prev, categoriasCarga: data || [] }))
    }
    fetch()
  }, [nuevaLinea.proyecto_id])
  const config = proyectoSel ? PROYECTO_CONFIG[proyectoSel.nombre] : null
  const sumaLineas = lineas.reduce((sum, l) => sum + (parseFloat(l.monto) || 0), 0)
  const montoPendiente = montoTotal - sumaLineas
  const puedeAgregarLinea = montoPendiente > 0 && lineas.length < 10
  const esValido = Math.abs(sumaLineas - montoTotal) < 0.01
  const puedeGuardarSplit = esValido && lineas.length > 0
  const agregarLinea = () => {
    if (!nuevaLinea.monto || !nuevaLinea.proyecto_id || !nuevaLinea.categoria_id) {
      setError('Completa todos los campos de la línea')
      return
    }
    const monto = parseFloat(nuevaLinea.monto.replace(",", "."))
    if (monto > montoPendiente) {
      setError(`Monto máximo: $${montoPendiente.toFixed(2)}`)
      return
    }
    setLineas([...lineas, { user_id: '00000000-0000-0000-0000-000000000001', monto: monto.toFixed(2), proyecto_id: nuevaLinea.proyecto_id, categoria_id: nuevaLinea.categoria_id }])
    setNuevaLinea({ monto: '', proyecto_id: '', categoria_id: '', categoriasCarga: [] })
    setError(null)
  }
  const eliminarLinea = (idx) => {
    setLineas(lineas.filter((_, i) => i !== idx))
  }
  const handleConfirmar = async () => {
    setGuardando(true)
    setError(null)
    try {
      if (esSplit && !puedeGuardarSplit) {
        setError('La suma de líneas debe ser igual al monto total')
        setGuardando(false)
        return
      }
      const payload = {
        user_id: '00000000-0000-0000-0000-000000000001',
        proyecto_id: !esSplit ? proyectoSel.id : null,
        categoria_id: !esSplit ? categoriaSel.id : null,
        fecha: transaccion.fecha,
        monto: montoTotal,
        descripcion: transaccion.descripcion || '',
        tipo_comprobante: transaccion.tipo_comprobante || 'SIN_DOCUMENTO',
        estado_deducible: 'PENDIENTE_REVISION',
        fuente: 'MANUAL',
        tipo: 'GASTO',
        es_split: esSplit,
        lineas: esSplit ? lineas : [],
      }
      await onConfirm(payload)
    } catch (err) {
      setError(err.message || 'Error al guardar')
      setGuardando(false)
    }
  }
  const volver = () => {
    setError(null)
    if (esSplit && paso === PASOS.CONFIRMACION) {
      setPaso(PASOS.SPLIT)
    } else if (paso > 1) {
      setPaso(paso - 1)
    } else {
      onClose()
    }
  }
  const siguiente = () => {
    if (esSplit && paso === PASOS.SPLIT) {
      if (puedeGuardarSplit) {
        setPaso(PASOS.CONFIRMACION)
      }
    } else {
      setPaso(paso + 1)
    }
  }
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.65)' }} onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ width: '100%', maxWidth: 430, backgroundColor: '#fff', borderRadius: '24px 24px 0 0', boxShadow: '0 -8px 40px rgba(0,0,0,0.2)', minHeight: '62vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 8 }}><div style={{ width: 40, height: 4, borderRadius: 99, backgroundColor: '#E5E7EB' }} /></div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, paddingBottom: 16 }}>
          {(esSplit ? [1,2,3,4,5] : [1,2,3,5]).map(s => (<div key={s} style={{ height: 4, borderRadius: 99, width: s === paso ? 28 : 12, backgroundColor: s <= paso ? (config?.bg || '#374151') : '#E5E7EB' }} />))}
        </div>
        <div style={{ padding: '0 24px 16px', borderBottom: '1px solid #F3F4F6' }}>
          <p style={{ fontSize: 11, fontFamily: 'monospace', color: '#9CA3AF', margin: 0 }}>MONTO A REGISTRAR</p>
          <p style={{ fontSize: 40, fontWeight: 900, fontFamily: 'monospace', color: '#111827', margin: '4px 0 0' }}>{montoFormateado}</p>
        </div>
        <div style={{ padding: '20px 24px', flex: 1, overflow: 'auto' }}>
          <p style={{ fontSize: 11, fontFamily: 'monospace', color: '#9CA3AF', margin: '0 0 16px' }}>{PASO_LABELS[paso]}</p>
          {paso === PASOS.PROYECTO && (<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {proyectos.map(p => {
              const cfg = PROYECTO_CONFIG[p.nombre] || {}
              return (<button key={p.id} style={{ padding: 16, borderRadius: 16, border: `2px solid ${cfg.border}`, backgroundColor: cfg.bgLight, cursor: 'pointer', width: '100%', textAlign: 'left' }} onClick={() => { setProyectoSel(p); setCategoriaSel(null); setPaso(PASOS.CATEGORIA) }}>
                <span style={{ fontSize: 28, display: 'block', marginBottom: 6 }}>{cfg.emoji}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: cfg.text }}>{p.nombre}</span>
              </button>)
            })}
          </div>)}
          {paso === PASOS.CATEGORIA && (<div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {categorias.map(c => (<button key={c.id} style={{ padding: '8px 16px', borderRadius: 99, border: `2px solid ${config?.border}`, backgroundColor: config?.bgLight, color: config?.text, fontSize: 13, fontWeight: 600, cursor: 'pointer' }} onClick={() => { setCategoriaSel(c); setPaso(PASOS.TIPO_LINEA) }}>
              {c.nombre}
            </button>))}
          </div>)}
          {paso === PASOS.TIPO_LINEA && (<div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button style={{ padding: 16, borderRadius: 16, border: '2px solid #E5E7EB', backgroundColor: '#F9FAFB', cursor: 'pointer', textAlign: 'left', width: '100%' }} onClick={() => { setEsSplit(false); setPaso(PASOS.CONFIRMACION) }}>
              <p style={{ fontWeight: 700, color: '#1F2937', margin: 0 }}>1️⃣ Una línea completa</p>
              <p style={{ fontSize: 12, color: '#9CA3AF', margin: '4px 0 0' }}>{montoFormateado} → {proyectoSel?.nombre} / {categoriaSel?.nombre}</p>
            </button>
            <button style={{ padding: 16, borderRadius: 16, border: `2px solid ${config?.border}`, backgroundColor: config?.bgLight, cursor: 'pointer', textAlign: 'left', width: '100%' }} onClick={() => { setEsSplit(true); setLineas([]); setPaso(PASOS.SPLIT) }}>
              <p style={{ fontWeight: 700, color: config?.text, margin: 0 }}>🔀 Dividir entre líneas</p>
              <p style={{ fontSize: 12, color: '#9CA3AF', margin: '4px 0 0' }}>1 factura → hasta 10 líneas (diferentes proyectos)</p>
            </button>
          </div>)}
          {paso === PASOS.SPLIT && (<div>
            {lineas.length > 0 && (<div style={{ marginBottom: 20, padding: 12, borderRadius: 12, backgroundColor: '#F3F4F6' }}>
              <p style={{ fontSize: 11, fontFamily: 'monospace', color: '#9CA3AF', margin: '0 0 12px', fontWeight: 700 }}>LÍNEAS ({lineas.length}/10)</p>
              {lineas.map((l, i) => {
                const proy = proyectos.find(p => p.id === l.proyecto_id)
                const cfg = PROYECTO_CONFIG[proy?.nombre] || {}
                return (<div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #E5E7EB' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 11, margin: 0, color: '#6B7280' }}>{cfg.emoji} {proy?.nombre}</p>
                    <p style={{ fontSize: 13, fontWeight: 600, margin: 0, color: '#111827' }}>${parseFloat(l.monto).toFixed(2)}</p>
                  </div>
                  <button onClick={() => eliminarLinea(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', fontSize: 16 }}>✕</button>
                </div>)
              })}
            </div>)}
            <div style={{ padding: 12, borderRadius: 12, backgroundColor: '#FFFBEB', marginBottom: 16, border: '2px solid #FCD34D' }}>
              <p style={{ fontSize: 11, fontFamily: 'monospace', color: '#9CA3AF', margin: '0 0 12px', fontWeight: 700 }}>AGREGAR LÍNEA</p>
              <input type="text" inputMode="decimal" placeholder="Monto" value={nuevaLinea.monto} onChange={(e) => setNuevaLinea({...nuevaLinea, monto: e.target.value})} style={{ width: '100%', padding: '8px', marginBottom: 8, borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 14 }} />
              <select value={nuevaLinea.proyecto_id} onChange={(e) => setNuevaLinea({...nuevaLinea, proyecto_id: e.target.value, categoria_id: ''})} style={{ width: '100%', padding: '8px', marginBottom: 8, borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 14 }}>
                <option value="">Selecciona proyecto</option>
                {proyectos.map(p => (<option key={p.id} value={p.id}>{PROYECTO_CONFIG[p.nombre]?.emoji} {p.nombre}</option>))}
              </select>
              <select value={nuevaLinea.categoria_id} onChange={(e) => setNuevaLinea({...nuevaLinea, categoria_id: e.target.value})} disabled={!nuevaLinea.proyecto_id} style={{ width: '100%', padding: '8px', marginBottom: 8, borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 14, opacity: nuevaLinea.proyecto_id ? 1 : 0.5 }}>
                <option value="">Selecciona categoría</option>
                {nuevaLinea.categoriasCarga.map(c => (<option key={c.id} value={c.id}>{c.nombre}</option>))}
              </select>
              {error && <div style={{ padding: '8px', borderRadius: 8, marginBottom: 8, backgroundColor: '#FEF2F2', color: '#B91C1C', fontSize: 12 }}>❌ {error}</div>}
              <button onClick={agregarLinea} disabled={!puedeAgregarLinea} style={{ width: '100%', padding: '10px', borderRadius: 8, border: 'none', backgroundColor: puedeAgregarLinea ? '#059669' : '#D1D5DB', color: 'white', fontWeight: 600, cursor: puedeAgregarLinea ? 'pointer' : 'not-allowed', fontSize: 14 }}>
                + Agregar línea
              </button>
            </div>
            <div style={{ padding: 12, borderRadius: 12, backgroundColor: '#F3F4F6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: '#9CA3AF', fontFamily: 'monospace' }}>SUMA</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>${sumaLineas.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: '#9CA3AF', fontFamily: 'monospace' }}>PENDIENTE</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: montoPendiente > 0 ? '#EF4444' : '#059669' }}>${montoPendiente.toFixed(2)}</span>
              </div>
            </div>
          </div>)}
          {paso === PASOS.CONFIRMACION && (<div>
            <div style={{ borderRadius: 16, padding: 16, backgroundColor: config?.bgLight, border: `2px solid ${config?.border}`, marginBottom: 20 }}>
              {!esSplit ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: '#9CA3AF', fontFamily: 'monospace' }}>PROYECTO</span>
                    <span style={{ fontWeight: 700, color: config?.text }}>{config?.emoji} {proyectoSel?.nombre}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: '#9CA3AF', fontFamily: 'monospace' }}>CATEGORÍA</span>
                    <span style={{ fontWeight: 700 }}>{categoriaSel?.nombre}</span>
                  </div>
                </>
              ) : (
                <div style={{ marginBottom: 12 }}>
                  <p style={{ fontSize: 11, color: '#9CA3AF', fontFamily: 'monospace', margin: '0 0 8px', fontWeight: 700 }}>LÍNEAS ({lineas.length})</p>
                  {lineas.map((l, i) => {
                    const proy = proyectos.find(p => p.id === l.proyecto_id)
                    return (<div key={i} style={{ fontSize: 12, marginBottom: 4, color: '#6B7280' }}>
                      {PROYECTO_CONFIG[proy?.nombre]?.emoji} ${parseFloat(l.monto).toFixed(2)}
                    </div>)
                  })}
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: '#9CA3AF', fontFamily: 'monospace' }}>MONTO</span>
                <span style={{ fontSize: 18, fontWeight: 900, fontFamily: 'monospace' }}>{montoFormateado}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, color: '#9CA3AF', fontFamily: 'monospace' }}>TIPO</span>
                <span>{esSplit ? '🔀 Split' : '1️⃣ Línea'}</span>
              </div>
            </div>
            {error && <div style={{ padding: '10px', borderRadius: 10, marginBottom: 12, backgroundColor: '#FEF2F2', color: '#B91C1C', fontSize: 13 }}>❌ {error}</div>}
            <button style={{ width: '100%', padding: 16, borderRadius: 16, border: 'none', fontSize: 16, fontWeight: 700, color: 'white', cursor: 'pointer', backgroundColor: config?.bg, opacity: guardando ? 0.5 : 1 }} onClick={handleConfirmar} disabled={guardando}>
              {guardando ? '⏳ Guardando...' : '✅ Registrar'}
            </button>
          </div>)}
        </div>
        <div style={{ padding: '8px 24px 32px', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #F3F4F6' }}>
          <button onClick={volver} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#9CA3AF', fontWeight: 500 }}>
            {paso === 1 ? '✕ Cancelar' : '← Volver'}
          </button>
          {paso < PASOS.CONFIRMACION && (<button onClick={siguiente} disabled={paso === PASOS.SPLIT && !puedeGuardarSplit} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: paso === PASOS.SPLIT && !puedeGuardarSplit ? '#D1D5DB' : config?.text, fontWeight: 500 }}>
            Siguiente →
          </button>)}
          <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#D1D5DB' }}>{paso === PASOS.CONFIRMACION ? '✅' : `${paso}/${esSplit ? 5 : 4}`}</span>
        </div>
      </div>
    </div>
  )
}
