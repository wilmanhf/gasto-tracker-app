// src/components/ModalInterceptacion.jsx
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// Configuración visual por proyecto
const PROYECTO_CONFIG = {
  'CASA NUEVA': {
    emoji: '🏠',
    bg: '#F59E0B',
    bgLight: '#FFFBEB',
    border: '#FCD34D',
    text: '#92400E',
  },
  'METALPAC': {
    emoji: '⚙️',
    bg: '#2563EB',
    bgLight: '#EFF6FF',
    border: '#93C5FD',
    text: '#1E3A8A',
  },
  'ANTA': {
    emoji: '🔥',
    bg: '#EA580C',
    bgLight: '#FFF7ED',
    border: '#FDBA74',
    text: '#9A3412',
  },
  'PERSONAL': {
    emoji: '👤',
    bg: '#059669',
    bgLight: '#ECFDF5',
    border: '#6EE7B7',
    text: '#065F46',
  },
}

const PASOS = { PROYECTO: 1, CATEGORIA: 2, TIPO_LINEA: 3, CONFIRMACION: 4 }

const PASO_LABELS = {
  1: '¿A qué proyecto?',
  2: '¿Qué categoría?',
  3: '¿Cómo registrar?',
  4: 'Confirmar registro',
}

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
    const fetchProyectos = async () => {
      const { data, error: err } = await supabase
        .from('proyectos')
        .select('id, nombre')
        .order('nombre')
      if (!err) setProyectos(data || [])
    }
    fetchProyectos()
  }, [])

  useEffect(() => {
    if (!proyectoSel) return
    const fetchCategorias = async () => {
      setCargandoCategorias(true)
      const { data, error: err } = await supabase
        .from('categorias')
        .select('id, nombre')
        .eq('proyecto_id', proyectoSel.id)
        .order('nombre')
      if (!err) setCategorias(data || [])
      setCargandoCategorias(false)
    }
    fetchCategorias()
  }, [proyectoSel])

  const config = proyectoSel ? (PROYECTO_CONFIG[proyectoSel.nombre] || defaultConfig()) : null

  function defaultConfig() {
    return { emoji: '📁', bg: '#6B7280', bgLight: '#F9FAFB', border: '#D1D5DB', text: '#374151' }
  }

  const seleccionarProyecto = (p) => {
    setProyectoSel(p)
    setCategoriaSel(null)
    setPaso(PASOS.CATEGORIA)
  }

  const seleccionarCategoria = (c) => {
    setCategoriaSel(c)
    setPaso(PASOS.TIPO_LINEA)
  }

  const seleccionarTipoLinea = (split) => {
    setEsSplit(split)
    setPaso(PASOS.CONFIRMACION)
  }

  const volver = () => {
    setError(null)
    if (paso > 1) setPaso(paso - 1)
    else onClose()
  }

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

  const montoFormateado = `$${parseFloat(transaccion?.monto || 0).toFixed(2)}`

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{
          width: '100%', maxWidth: 430,
          backgroundColor: '#fff',
          borderRadius: '24px 24px 0 0',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.2)',
          minHeight: '62vh',
          display: 'flex', flexDirection: 'column',
          animation: 'slideUp 0.25s ease-out',
        }}
      >
        <style>{`
          @keyframes slideUp {
            from { transform: translateY(100%); opacity: 0; }
            to   { transform: translateY(0);    opacity: 1; }
          }
          .btn-proyecto { padding: 16px; border-radius: 16px; border: 2px solid; text-align: left; cursor: pointer; transition: transform 0.1s, box-shadow 0.1s; background: none; width: 100%; }
          .btn-proyecto:active { transform: scale(0.96); }
          .chip-cat { padding: 8px 16px; border-radius: 99px; border: 2px solid; font-size: 13px; font-weight: 600; cursor: pointer; transition: transform 0.1s; background: none; }
          .chip-cat:active { transform: scale(0.94); }
          .btn-linea { padding: 16px; border-radius: 16px; border: 2px solid; text-align: left; cursor: pointer; transition: transform 0.1s; background: none; width: 100%; }
          .btn-linea:active { transform: scale(0.97); }
          .btn-confirmar { width: 100%; padding: 16px; border-radius: 16px; border: none; font-size: 16px; font-weight: 700; color: white; cursor: pointer; transition: transform 0.1s, opacity 0.15s; letter-spacing: 0.01em; }
          .btn-confirmar:active { transform: scale(0.98); }
          .btn-confirmar:disabled { opacity: 0.5; cursor: not-allowed; }
        `}</style>

        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 8 }}>
          <div style={{ width: 40, height: 4, borderRadius: 99, backgroundColor: '#E5E7EB' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, paddingBottom: 16, paddingTop: 4 }}>
          {[1,2,3,4].map(s => (
            <div key={s} style={{
              height: 4, borderRadius: 99,
              width: s === paso ? 28 : 12,
              backgroundColor: s <= paso ? (config?.bg || '#374151') : '#E5E7EB',
              transition: 'all 0.3s ease',
            }} />
          ))}
        </div>

        <div style={{ padding: '0 24px 16px', borderBottom: '1px solid #F3F4F6' }}>
          <p style={{ fontSize: 11, fontFamily: 'monospace', color: '#9CA3AF', letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>monto a registrar</p>
          <p style={{ fontSize: 40, fontWeight: 900, fontFamily: 'monospace', color: '#111827', margin: '4px 0 0', lineHeight: 1 }}>{montoFormateado}</p>
          {transaccion?.descripcion && (
            <p style={{ fontSize: 13, color: '#6B7280', margin: '6px 0 0' }}>{transaccion.descripcion}</p>
          )}
        </div>

        <div style={{ padding: '20px 24px', flex: 1 }}>

          <p style={{
            fontSize: 11, fontFamily: 'monospace', color: '#9CA3AF',
            letterSpacing: '0.1em', textTransform: 'uppercase',
            margin: '0 0 16px',
          }}>
            {PASO_LABELS[paso]}
          </p>

          {paso === PASOS.PROYECTO && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {proyectos.length === 0 ? (
                <p style={{ gridColumn: '1/-1', textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>Cargando proyectos...</p>
              ) : proyectos.map(p => {
                const cfg = PROYECTO_CONFIG[p.nombre] || defaultConfig()
                return (
                  <button
                    key={p.id}
                    className="btn-proyecto"
                    style={{ borderColor: cfg.border, backgroundColor: cfg.bgLight }}
                    onClick={() => seleccionarProyecto(p)}
                  >
                    <span style={{ fontSize: 28, display: 'block', marginBottom: 6 }}>{cfg.emoji}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: cfg.text }}>{p.nombre}</span>
                  </button>
                )
              })}
            </div>
          )}

          {paso === PASOS.CATEGORIA && (
            <div>
              {cargandoCategorias ? (
                <p style={{ textAlign: 'center', color: '#9CA3AF', fontSize: 14, padding: '32px 0' }}>Cargando categorías...</p>
              ) : categorias.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#9CA3AF', fontSize: 14, padding: '32px 0' }}>No hay categorías para este proyecto.</p>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {categorias.map(c => (
                    <button
                      key={c.id}
                      className="chip-cat"
                      style={{
                        borderColor: config?.border,
                        backgroundColor: config?.bgLight,
                        color: config?.text,
                      }}
                      onClick={() => seleccionarCategoria(c)}
                    >
                      {c.nombre}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {paso === PASOS.TIPO_LINEA && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button
                className="btn-linea"
                style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' }}
                onClick={() => seleccionarTipoLinea(false)}
              >
                <p style={{ fontWeight: 700, color: '#1F2937', margin: 0, fontSize: 15 }}>1️⃣  Una línea completa</p>
                <p style={{ fontSize: 12, color: '#9CA3AF', margin: '4px 0 0' }}>{montoFormateado} completo → {proyectoSel?.nombre} / {categoriaSel?.nombre}</p>
              </button>

              <button
                className="btn-linea"
                style={{ borderColor: config?.border, backgroundColor: config?.bgLight }}
                onClick={() => seleccionarTipoLinea(true)}
              >
                <p style={{ fontWeight: 700, color: config?.text, margin: 0, fontSize: 15 }}>🔀  Dividir entre proyectos</p>
                <p style={{ fontSize: 12, color: '#9CA3AF', margin: '4px 0 0' }}>Una factura, varios destinos — disponible en Fase 4</p>
              </button>
            </div>
          )}

          {paso === PASOS.CONFIRMACION && (
            <div>
              <div style={{
                borderRadius: 16, padding: 16,
                backgroundColor: config?.bgLight,
                border: `2px solid ${config?.border}`,
                marginBottom: 20,
              }}>
                {[
                  { label: 'Proyecto',   value: `${config?.emoji} ${proyectoSel?.nombre}`, bold: true, color: config?.text },
                  { label: 'Categoría',  value: categoriaSel?.nombre },
                  { label: 'Monto',      value: montoFormateado, mono: true, size: 20, bold: true },
                  { label: 'Fecha',      value: transaccion?.fecha, mono: true },
                  { label: 'Comprobante', value: transaccion?.tipo_comprobante || 'SIN_DOCUMENTO' },
                  { label: 'Tipo',       value: esSplit ? '🔀 Split (pendiente Fase 4)' : '1️⃣ Línea única' },
                ].map(({ label, value, bold, color, mono, size }) => (
                  <div key={label} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    paddingBottom: 8, marginBottom: 8,
                    borderBottom: '1px solid rgba(0,0,0,0.06)',
                  }}>
                    <span style={{ fontSize: 11, color: '#9CA3AF', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
                    <span style={{
                      fontSize: size || 13,
                      fontWeight: bold ? 700 : 500,
                      color: color || '#1F2937',
                      fontFamily: mono ? 'monospace' : 'inherit',
                    }}>{value}</span>
                  </div>
                ))}
              </div>

              {error && (
                <div style={{
                  padding: '10px 14px', borderRadius: 10, marginBottom: 12,
                  backgroundColor: '#FEF2F2', border: '1px solid #FECACA',
                  fontSize: 13, color: '#B91C1C',
                }}>
                  ❌ {error}
                </div>
cat > src/pages/Captura.jsx << 'EOF'
import { useState } from 'react'
import { useTransacciones } from '../hooks/useTransacciones'
import ModalInterceptacion from '../components/ModalInterceptacion'

const TIPOS_COMPROBANTE = [
  { value: 'FACTURA_LEGAL', label: '🧾 Factura Legal',  color: '#059669' },
  { value: 'NOTA_VENTA',    label: '📄 Nota de Venta',  color: '#D97706' },
  { value: 'SIN_DOCUMENTO', label: '🚫 Sin documento',  color: '#6B7280' },
]

export default function Captura() {
  const { crearTransaccion } = useTransacciones()

  const [monto, setMonto] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [tipoComprobante, setTipoComprobante] = useState('SIN_DOCUMENTO')
  const [modalAbierto, setModalAbierto] = useState(false)

  const puedeAbrir = monto && parseFloat(monto) > 0

  const handleAbrirModal = () => {
    if (!puedeAbrir) return
    setModalAbierto(true)
  }

  const handleConfirmarModal = async (payload) => {
    await crearTransaccion(payload)
    setMonto('')
    setDescripcion('')
    setFecha(new Date().toISOString().split('T')[0])
    setTipoComprobante('SIN_DOCUMENTO')
    setModalAbierto(false)
    alert('✅ Gasto registrado correctamente')
  }

  const colorComprobante = TIPOS_COMPROBANTE.find(t => t.value === tipoComprobante)?.color || '#6B7280'

  return (
    <>
      <div style={{ padding: '24px 20px', maxWidth: 430, margin: '0 auto' }}>

        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24, color: '#111827' }}>
          📸 Capturar Gasto
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          <div>
            <label style={labelStyle}>Monto ($)</label>
            <input
              type="number"
              inputMode="decimal"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              placeholder="0.00"
              style={{
                ...inputStyle,
                fontSize: 32,
                fontWeight: 800,
                fontFamily: 'monospace',
                textAlign: 'right',
                color: monto ? '#111827' : '#9CA3AF',
              }}
            />
          </div>

          <div>
            <label style={labelStyle}>Descripción <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(opcional)</span></label>
            <input
              type="text"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="¿Qué compraste?"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Fecha</label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Tipo de comprobante</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {TIPOS_COMPROBANTE.map(t => (
                <button
                  key={t.value}
                  onClick={() => setTipoComprobante(t.value)}
                  style={{
                    flex: 1,
                    padding: '10px 6px',
                    borderRadius: 12,
                    border: `2px solid ${tipoComprobante === t.value ? t.color : '#E5E7EB'}`,
                    backgroundColor: tipoComprobante === t.value ? t.color + '15' : '#F9FAFB',
                    cursor: 'pointer',
                    fontSize: 11,
                    fontWeight: 600,
                    color: tipoComprobante === t.value ? t.color : '#6B7280',
                    transition: 'all 0.15s',
                    textAlign: 'center',
                    lineHeight: 1.4,
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleAbrirModal}
            disabled={!puedeAbrir}
            style={{
              width: '100%',
              padding: '18px',
              borderRadius: 16,
              border: 'none',
              backgroundColor: puedeAbrir ? '#111827' : '#E5E7EB',
              color: puedeAbrir ? '#fff' : '#9CA3AF',
              fontSize: 16,
              fontWeight: 700,
              cursor: puedeAbrir ? 'pointer' : 'not-allowed',
              transition: 'all 0.15s',
              marginTop: 8,
            }}
          >
            {puedeAbrir ? 'Continuar →' : 'Ingresa un monto para continuar'}
          </button>

          {puedeAbrir && (
            <p style={{ textAlign: 'center', fontSize: 12, color: '#9CA3AF', margin: '-10px 0 0' }}>
              Seleccionarás proyecto y categoría en el siguiente paso
            </p>
          )}

        </div>
      </div>

      {modalAbierto && (
        <ModalInterceptacion
          transaccion={{
            monto,
            descripcion,
            fecha,
            tipo_comprobante: tipoComprobante,
          }}
          onConfirm={handleConfirmarModal}
          onClose={() => setModalAbierto(false)}
        />
      )}
    </>
  )
}

const labelStyle = {
  display: 'block',
  fontSize: 12,
  fontWeight: 700,
  color: '#374151',
  marginBottom: 8,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  fontFamily: 'monospace',
}

const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  borderRadius: 12,
  border: '2px solid #E5E7EB',
  fontSize: 16,
  color: '#111827',
  backgroundColor: '#F9FAFB',
  boxSizing: 'border-box',
  outline: 'none',
  transition: 'border-color 0.15s',
  fontFamily: 'inherit',
}
