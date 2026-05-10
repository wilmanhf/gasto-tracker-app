import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const PROYECTO_CONFIG = {
  'CASA NUEVA': { emoji: '🏠', bg: '#F59E0B', bgLight: '#FFFBEB', border: '#FCD34D', text: '#92400E' },
  'METALPAC': { emoji: '⚙️', bg: '#2563EB', bgLight: '#EFF6FF', border: '#93C5FD', text: '#1E3A8A' },
  'ANTA': { emoji: '🔥', bg: '#EA580C', bgLight: '#FFF7ED', border: '#FDBA74', text: '#9A3412' },
  'PERSONAL': { emoji: '👤', bg: '#059669', bgLight: '#ECFDF5', border: '#6EE7B7', text: '#065F46' },
}

const PASOS = { PROYECTO: 1, CATEGORIA: 2, TIPO_LINEA: 3, CONFIRMACION: 4 }
const PASO_LABELS = { 1: '¿A qué proyecto?', 2: '¿Qué categoría?', 3: '¿Cómo registrar?', 4: 'Confirmar registro' }

export default function ModalInterceptacion({ transaccion, onConfirm, onClose }) {
  const [paso, setPaso] = useState(PASOS.PROYECTO)
  const [proyectos, setProyectos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [cargandoCategorias, setCargandoCategorias] = useState(false)
  const [proyectoSel, setProyectoSel] = useState(null)
  const [categoriaSel, setCategoriaSel] = useState(null)
  const [esSplit, setEsSplit] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)

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

  const config = proyectoSel ? PROYECTO_CONFIG[proyectoSel.nombre] : null
  const montoFormateado = `$${parseFloat(transaccion?.monto || 0).toFixed(2)}`

  const handleConfirmar = async () => {
    setGuardando(true)
    setError(null)
    try {
      const payload = {
        user_id: '00000000-0000-0000-0000-000000000001',
        proyecto_id: proyectoSel.id,
        categoria_id: categoriaSel.id,
        fecha: transaccion.fecha,
        monto: parseFloat(transaccion.monto),
        descripcion: transaccion.descripcion || '',
        tipo_comprobante: transaccion.tipo_comprobante || 'SIN_DOCUMENTO',
        estado_deducible: 'PENDIENTE_REVISION',
        fuente: 'MANUAL',
        tipo: 'GASTO',
        es_split: esSplit,
      }
      await onConfirm(payload)
    } catch (err) {
      setError(err.message || 'Error al guardar')
      setGuardando(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.65)' }} onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ width: '100%', maxWidth: 430, backgroundColor: '#fff', borderRadius: '24px 24px 0 0', boxShadow: '0 -8px 40px rgba(0,0,0,0.2)', minHeight: '62vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 8 }}>
          <div style={{ width: 40, height: 4, borderRadius: 99, backgroundColor: '#E5E7EB' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, paddingBottom: 16 }}>
          {[1,2,3,4].map(s => (<div key={s} style={{ height: 4, borderRadius: 99, width: s === paso ? 28 : 12, backgroundColor: s <= paso ? (config?.bg || '#374151') : '#E5E7EB' }} />))}
        </div>
        <div style={{ padding: '0 24px 16px', borderBottom: '1px solid #F3F4F6' }}>
          <p style={{ fontSize: 11, fontFamily: 'monospace', color: '#9CA3AF', margin: 0 }}>MONTO A REGISTRAR</p>
          <p style={{ fontSize: 40, fontWeight: 900, fontFamily: 'monospace', color: '#111827', margin: '4px 0 0' }}>{montoFormateado}</p>
        </div>
        <div style={{ padding: '20px 24px', flex: 1 }}>
          <p style={{ fontSize: 11, fontFamily: 'monospace', color: '#9CA3AF', margin: '0 0 16px' }}>{PASO_LABELS[paso]}</p>

          {paso === PASOS.PROYECTO && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {proyectos.map(p => {
                const cfg = PROYECTO_CONFIG[p.nombre] || {}
                return (
                  <button key={p.id} style={{ padding: 16, borderRadius: 16, border: `2px solid ${cfg.border}`, backgroundColor: cfg.bgLight, cursor: 'pointer', width: '100%', textAlign: 'left' }} onClick={() => { setProyectoSel(p); setCategoriaSel(null); setPaso(PASOS.CATEGORIA) }}>
                    <span style={{ fontSize: 28, display: 'block', marginBottom: 6 }}>{cfg.emoji}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: cfg.text }}>{p.nombre}</span>
                  </button>
                )
              })}
            </div>
          )}

          {paso === PASOS.CATEGORIA && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {categorias.map(c => (
                <button key={c.id} style={{ padding: '8px 16px', borderRadius: 99, border: `2px solid ${config?.border}`, backgroundColor: config?.bgLight, color: config?.text, fontSize: 13, fontWeight: 600, cursor: 'pointer' }} onClick={() => { setCategoriaSel(c); setPaso(PASOS.TIPO_LINEA) }}>
                  {c.nombre}
                </button>
              ))}
            </div>
          )}

          {paso === PASOS.TIPO_LINEA && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button style={{ padding: 16, borderRadius: 16, border: '2px solid #E5E7EB', backgroundColor: '#F9FAFB', cursor: 'pointer', textAlign: 'left', width: '100%' }} onClick={() => { setEsSplit(false); setPaso(PASOS.CONFIRMACION) }}>
                <p style={{ fontWeight: 700, color: '#1F2937', margin: 0 }}>1️⃣ Una línea completa</p>
                <p style={{ fontSize: 12, color: '#9CA3AF', margin: '4px 0 0' }}>{montoFormateado} → {proyectoSel?.nombre}</p>
              </button>
              <button style={{ padding: 16, borderRadius: 16, border: `2px solid ${config?.border}`, backgroundColor: config?.bgLight, cursor: 'pointer', textAlign: 'left', width: '100%' }} onClick={() => { setEsSplit(true); setPaso(PASOS.CONFIRMACION) }}>
                <p style={{ fontWeight: 700, color: config?.text, margin: 0 }}>🔀 Dividir entre proyectos</p>
                <p style={{ fontSize: 12, color: '#9CA3AF', margin: '4px 0 0' }}>Fase 4 — disponible próximamente</p>
              </button>
            </div>
          )}

          {paso === PASOS.CONFIRMACION && (
            <div>
              <div style={{ borderRadius: 16, padding: 16, backgroundColor: config?.bgLight, border: `2px solid ${config?.border}`, marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: '#9CA3AF', fontFamily: 'monospace' }}>PROYECTO</span>
                  <span style={{ fontWeight: 700, color: config?.text }}>{config?.emoji} {proyectoSel?.nombre}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: '#9CA3AF', fontFamily: 'monospace' }}>CATEGORÍA</span>
                  <span style={{ fontWeight: 700 }}>{categoriaSel?.nombre}</span>
                </div>
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
            </div>
          )}
        </div>
        <div style={{ padding: '8px 24px 32px', display: 'flex', justifyContent: 'space-between' }}>
          <button onClick={() => { setError(null); if (paso > 1) setPaso(paso - 1); else onClose() }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#9CA3AF', fontWeight: 500 }}>
            {paso === 1 ? '✕ Cancelar' : '← Volver'}
          </button>
          <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#D1D5DB' }}>{paso} / 4</span>
        </div>
      </div>
    </div>
  )
}
