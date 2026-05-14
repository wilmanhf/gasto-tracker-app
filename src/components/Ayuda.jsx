import React, { useState } from 'react'

const GUIA = [
  {
    seccion: '📸 Captura',
    color: '#111827',
    pasos: [
      'Ingresa el monto. Puedes escribir operaciones: 12.50+8.30',
      'Agrega descripción opcional (ej: almuerzo, gasolina)',
      'Selecciona la fecha del gasto',
      'Elige el tipo de comprobante: Factura Legal, Nota de Venta o Sin documento',
      'Toca Continuar → selecciona proyecto y categoría',
      'Si el gasto es de varios proyectos, elige Dividir entre líneas (Split)',
    ]
  },
  {
    seccion: '📊 Dashboard',
    color: '#EA580C',
    pasos: [
      'Muestra el total gastado por cada proyecto',
      'Toca cualquier tarjeta para ver el detalle de categorías y últimos registros',
      'El % indica cuánto representa ese proyecto del total',
      'Toca ↺ para actualizar los datos',
    ]
  },
  {
    seccion: '📋 Historial',
    color: '#2563EB',
    pasos: [
      'Lista todos los gastos registrados',
      'Filtra por proyecto tocando los íconos: 🔥⚙️🏠👤',
      'Busca por descripción o categoría en el buscador',
      'Toca cualquier registro para ver el detalle completo',
      'Desde el detalle puedes Editar ✏️ o Eliminar 🗑️ el registro',
      'Los gastos Split muestran cada línea con su proyecto y monto',
    ]
  },
  {
    seccion: '🎯 Metas de Ahorro',
    color: '#059669',
    pasos: [
      'Toca + Nueva para crear una meta de ahorro',
      'Define nombre, monto objetivo, proyecto y fecha estimada',
      'Ingresa el monto en el campo y toca + Abonar para registrar un ahorro',
      'Cada abono genera un recordatorio de transferir a Jardín Azuayo cta. 2518653',
      'Toca ✅ Ya transferí cuando hayas hecho la transferencia',
      'Al registrar un gasto en el mismo proyecto, la app pregunta si usas el fondo',
      'Toca ✕ rojo para eliminar una meta',
    ]
  },
  {
    seccion: '🔀 Split (dividir gasto)',
    color: '#7C3AED',
    pasos: [
      'Úsalo cuando una factura cubre varios proyectos',
      'Ejemplo: factura de $20 → $10 ANTA + $10 PERSONAL',
      'En el paso 3 del modal elige Dividir entre líneas',
      'Agrega cada línea con su monto, proyecto y categoría',
      'La suma debe ser igual al monto total para poder continuar',
      'En historial el registro aparece con ícono 🔀 Split',
    ]
  },
  {
    seccion: '💡 Consejos',
    color: '#D97706',
    pasos: [
      'Registra los gastos el mismo día para no olvidar detalles',
      'Usa Factura Legal siempre que tengas RUC — es deducible en el SRI',
      'Las metas de ahorro se descuentan automáticamente al usarlas',
      'El dashboard se actualiza tocando ↺ — no es automático',
      'Puedes instalar la app en tu iPhone: Safari → Compartir → Añadir a inicio',
    ]
  },
]

export default function Ayuda({ onClose }) {
  const [seccionAbierta, setSeccionAbierta] = useState(0)

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.65)', zIndex: 200, display: 'flex', alignItems: 'flex-end' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', backgroundColor: '#fff', borderRadius: '20px 20px 0 0', maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 6px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 99, backgroundColor: '#E5E7EB' }} />
        </div>
        <div style={{ padding: '0 20px 14px', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: 11, fontFamily: 'monospace', color: '#9CA3AF', margin: 0 }}>GUÍA DE USO</p>
            <p style={{ fontSize: 20, fontWeight: 900, color: '#111827', margin: '2px 0 0' }}>¿Cómo usar la app?</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: 22, cursor: 'pointer' }}>✕</button>
        </div>
        <div style={{ overflow: 'auto', flex: 1, padding: '12px 16px 80px' }}>
          {GUIA.map((g, i) => (
            <div key={i} style={{ marginBottom: 10, borderRadius: 14, border: '1.5px solid #E5E7EB', overflow: 'hidden' }}>
              <button onClick={() => setSeccionAbierta(seccionAbierta === i ? -1 : i)}
                style={{ width: '100%', padding: '14px 16px', border: 'none', backgroundColor: seccionAbierta === i ? g.color : '#F9FAFB', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: seccionAbierta === i ? '#fff' : '#111827' }}>{g.seccion}</span>
                <span style={{ fontSize: 16, color: seccionAbierta === i ? '#fff' : '#9CA3AF' }}>{seccionAbierta === i ? '▲' : '▼'}</span>
              </button>
              {seccionAbierta === i && (
                <div style={{ padding: '12px 16px', backgroundColor: '#fff' }}>
                  {g.pasos.map((paso, j) => (
                    <div key={j} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
                      <div style={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: g.color, color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{j+1}</div>
                      <p style={{ fontSize: 13, color: '#374151', margin: 0, lineHeight: 1.5 }}>{paso}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
