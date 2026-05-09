import React, { useState } from 'react'
import { useTransacciones } from '../hooks/useTransacciones'

export default function Historial() {
  const { transacciones, loading, eliminarTransaccion } = useTransacciones()
  const [filtro, setFiltro] = useState('')
  const [sortBy, setSortBy] = useState('fecha')

  const transaccionesFiltradas = transacciones.filter(t => {
    const searchLower = filtro.toLowerCase()
    return (
      t.comercio?.toLowerCase().includes(searchLower) ||
      t.categorias?.nombre?.toLowerCase().includes(searchLower) ||
      t.proyectos?.nombre?.toLowerCase().includes(searchLower)
    )
  })

  const transaccionesOrdenadas = [...transaccionesFiltradas].sort((a, b) => {
    if (sortBy === 'fecha') return new Date(b.fecha) - new Date(a.fecha)
    if (sortBy === 'monto') return b.monto - a.monto
    return 0
  })

  const handleEliminar = async (id) => {
    if (confirm('¿Eliminar esta transacción?')) {
      try {
        await eliminarTransaccion(id)
        alert('✅ Transacción eliminada')
      } catch (error) {
        alert('❌ Error: ' + error.message)
      }
    }
  }

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '20px' }}>
      <h1>💾 Historial de Transacciones</h1>
      <p style={{ color: '#666' }}>Todas tus transacciones registradas</p>

      {/* Filtros */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        <input
          type="text"
          placeholder="🔍 Buscar por comercio, categoría, proyecto..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          style={{
            flex: 1,
            minWidth: '200px',
            padding: '10px',
            borderRadius: '5px',
            border: '1px solid #ddd'
          }}
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            padding: '10px',
            borderRadius: '5px',
            border: '1px solid #ddd'
          }}
        >
          <option value="fecha">📅 Por fecha</option>
          <option value="monto">💰 Por monto</option>
        </select>
      </div>

      {loading ? (
        <p>⏳ Cargando...</p>
      ) : transaccionesOrdenadas.length === 0 ? (
        <p style={{ color: '#999', textAlign: 'center', padding: '40px' }}>
          No hay transacciones registradas
        </p>
      ) : (
        <div style={{
          overflowX: 'auto'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse'
          }}>
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                <th style={{ textAlign: 'left', padding: '12px', borderBottom: '2px solid #ddd' }}>Fecha</th>
                <th style={{ textAlign: 'left', padding: '12px', borderBottom: '2px solid #ddd' }}>Comercio</th>
                <th style={{ textAlign: 'left', padding: '12px', borderBottom: '2px solid #ddd' }}>Categoría</th>
                <th style={{ textAlign: 'left', padding: '12px', borderBottom: '2px solid #ddd' }}>Proyecto</th>
                <th style={{ textAlign: 'right', padding: '12px', borderBottom: '2px solid #ddd' }}>Monto</th>
                <th style={{ textAlign: 'center', padding: '12px', borderBottom: '2px solid #ddd' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {transaccionesOrdenadas.map(t => (
                <tr key={t.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>{new Date(t.fecha).toLocaleDateString()}</td>
                  <td style={{ padding: '12px' }}>{t.comercio}</td>
                  <td style={{ padding: '12px' }}>
                    {t.categorias?.icono} {t.categorias?.nombre}
                  </td>
                  <td style={{ padding: '12px' }}>{t.proyectos?.nombre}</td>
                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>
                    ${t.monto?.toFixed(2)}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleEliminar(t.id)}
                      style={{
                        padding: '5px 10px',
                        background: '#ff6b6b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer'
                      }}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Info */}
      <div style={{
        marginTop: '30px',
        padding: '20px',
        background: '#e3f2fd',
        borderRadius: '10px'
      }}>
        <h3>ℹ️ Información</h3>
        <p>Total registrado: <strong>${transacciones.reduce((s, t) => s + (t.monto || 0), 0).toFixed(2)}</strong></p>
        <p>Transacciones: <strong>{transacciones.length}</strong></p>
      </div>
    </div>
  )
}
