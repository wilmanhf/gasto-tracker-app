import React, { useState } from 'react'
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
  const [montoRaw, setMontoRaw] = useState('')
  const [montoError, setMontoError] = useState(false)
  const [descripcion, setDescripcion] = useState('')
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [tipoComprobante, setTipoComprobante] = useState('SIN_DOCUMENTO')
  const [modalAbierto, setModalAbierto] = useState(false)

  const puedeAbrir = monto && parseFloat(monto) > 0

  const handleMonto = (e) => {
    const valor = e.target.value.replace(/[^0-9.+\-*/() ]/g, '').replace(',', '.')
    setMontoRaw(valor)
    setMonto(valor)
    setMontoError(false)
  }

  const handleMontoBlur = () => {
    if (!montoRaw) return
    if (/[+\-*/]/.test(montoRaw)) {
      try {
        const resultado = Function('"use strict"; return (' + montoRaw + ')')()
        if (typeof resultado === 'number' && isFinite(resultado) && resultado > 0) {
          const r = (Math.round(resultado * 100) / 100).toString()
          setMonto(r)
          setMontoRaw(r)
          setMontoError(false)
        } else { setMontoError(true) }
      } catch { setMontoError(true) }
    }
  }

  const handleAbrirModal = () => {
    if (!puedeAbrir) return
    setModalAbierto(true)
  }

  const handleConfirmarModal = async (payload) => {
    await crearTransaccion(payload)
    setMonto('')
    setMontoRaw('')
    setMontoError(false)
    setDescripcion('')
    setFecha(new Date().toISOString().split('T')[0])
    setTipoComprobante('SIN_DOCUMENTO')
    setModalAbierto(false)
    alert('✅ Gasto registrado correctamente')
  }

  return (
    <>
      <div style={{ padding: '24px 20px', maxWidth: 430, margin: '0 auto' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24, color: '#111827' }}>
          📸 Capturar Gasto
        </h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={labelStyle}>Monto ($)</label>
            <input type="text" inputMode="decimal" value={montoRaw} onChange={handleMonto} onBlur={handleMontoBlur} placeholder="0.00" style={{ ...inputStyle, fontSize: 32, fontWeight: 800, fontFamily: 'monospace', textAlign: 'right', color: montoRaw ? (montoError ? '#EF4444' : '#111827') : '#9CA3AF', border: montoError ? '2px solid #EF4444' : '2px solid #E5E7EB' }} />
            <p style={{ fontSize: 11, color: montoError ? '#EF4444' : '#9CA3AF', margin: '4px 0 0', fontFamily: 'monospace' }}>{montoError ? '❌ Expresión inválida' : 'Ej: 16.61 · También: 12.50+8.30'}</p>
          </div>
          <div>
            <label style={labelStyle}>Descripción <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(opcional)</span></label>
            <input type="text" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="¿Qué compraste?" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Fecha</label>
            <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Tipo de comprobante</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {TIPOS_COMPROBANTE.map(t => (
                <button key={t.value} onClick={() => setTipoComprobante(t.value)} style={{ flex: 1, padding: '10px 6px', borderRadius: 12, border: `2px solid ${tipoComprobante === t.value ? t.color : '#E5E7EB'}`, backgroundColor: tipoComprobante === t.value ? t.color + '15' : '#F9FAFB', cursor: 'pointer', fontSize: 11, fontWeight: 600, color: tipoComprobante === t.value ? t.color : '#6B7280', transition: 'all 0.15s', textAlign: 'center', lineHeight: 1.4 }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <button onClick={handleAbrirModal} disabled={!puedeAbrir} style={{ width: '100%', padding: '18px', borderRadius: 16, border: 'none', backgroundColor: puedeAbrir ? '#111827' : '#E5E7EB', color: puedeAbrir ? '#fff' : '#9CA3AF', fontSize: 16, fontWeight: 700, cursor: puedeAbrir ? 'pointer' : 'not-allowed', transition: 'all 0.15s', marginTop: 8 }}>
            {puedeAbrir ? 'Continuar →' : 'Ingresa un monto para continuar'}
          </button>
          {puedeAbrir && <p style={{ textAlign: 'center', fontSize: 12, color: '#9CA3AF', margin: '-10px 0 0' }}>Seleccionarás proyecto y categoría en el siguiente paso</p>}
        </div>
      </div>
      {modalAbierto && (<ModalInterceptacion transaccion={{ monto, descripcion, fecha, tipo_comprobante: tipoComprobante }} onConfirm={handleConfirmarModal} onClose={() => setModalAbierto(false)} />)}
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
