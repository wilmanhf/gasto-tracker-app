import React from 'react'
import { useTransacciones } from '../hooks/useTransacciones'

export default function Dashboard() {
  const { transacciones, loading } = useTransacciones()

  const totalGastos = transacciones.reduce((sum, t) => sum + (t.monto || 0), 0)
  const gastosPorCategoria = {}
  
  transacciones.forEach(t => {
    const cat = t.categorias?.nombre || 'Sin categoría'
    gastosPorCategoria[cat] = (gastosPorCategoria[cat] || 0) + (t.monto || 0)
  })

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '20px' }}>
      <h1>📊 Dashboard</h1>
      <p style={{ color: '#666' }}>Análisis financiero en tiempo real</p>

      {loading ? (
        <p>⏳ Cargando datos...</p>
      ) : (
        <div>
          {/* Resumen General */}
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '30px',
            borderRadius: '10px',
            marginBottom: '30px',
            textAlign: 'center'
          }}>
            <h2>Gasto Total (YTD)</h2>
            <p style={{ fontSize: '36px', margin: '10px 0' }}>
              ${totalGastos.toFixed(2)}
            </p>
            <p>Transacciones registradas: {transacciones.length}</p>
          </div>

          {/* Por Categoría */}
          <div style={{
            background: '#f5f5f5',
            padding: '20px',
            borderRadius: '10px',
            marginBottom: '30px'
          }}>
            <h3>Gastos por Categoría</h3>
            {Object.entries(gastosPorCategoria).map(([cat, monto]) => (
              <div key={cat} style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingBottom: '10px',
                borderBottom: '1px solid #ddd'
              }}>
                <span>{cat}</span>
                <strong>${monto.toFixed(2)}</strong>
              </div>
            ))}
          </div>

          {/* Próximas features */}
          <div style={{
            background: '#fff8e1',
            padding: '20px',
            borderRadius: '10px',
            marginBottom: '30px'
          }}>
            <h3>📈 Próximas Features</h3>
            <ul style={{ color: '#666' }}>
              <li>Gráficos interactivos con Recharts</li>
              <li>Análisis por proyecto (METALPAC, ANTA, Casa, Personal)</li>
              <li>Alertas de desviación presupuestaria</li>
              <li>Visualización de tendencias</li>
              <li>Comparativo vs presupuesto</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
