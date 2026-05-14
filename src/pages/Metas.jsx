import React, { useState, useEffect } from 'react'
import { supabase } from '../config/supabaseClient'

const USER_ID = '00000000-0000-0000-0000-000000000001'

const PROYECTOS_CONFIG = {
  'ANTA':       { emoji: '🔥', color: '#EA580C', bg: '#FFF7ED', border: '#FDBA74' },
  'METALPAC':   { emoji: '⚙️', color: '#2563EB', bg: '#EFF6FF', border: '#93C5FD' },
  'CASA NUEVA': { emoji: '🏠', color: '#D97706', bg: '#FFFBEB', border: '#FCD34D' },
  'PERSONAL':   { emoji: '👤', color: '#059669', bg: '#ECFDF5', border: '#6EE7B7' },
}

const ICONOS = ['🎯','💰','🏦','🔧','🚗','✈️','📱','🏥','📚','🏋️']

export default function Metas() {
  const [metas, setMetas] = useState([])
  const [proyectos, setProyectos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [form, setForm] = useState({
    nombre: '', descripcion: '', monto_objetivo: '',
    monto_actual: '0', proyecto_id: '', icono: '🎯',
    fecha_meta_estimada: ''
  })

  useEffect(() => { cargarDatos() }, [])

  const cargarDatos = async () => {
    setCargando(true)
    const [{ data: p }, { data: m }] = await Promise.all([
      supabase.from('proyectos').select('id, nombre'),
      supabase.from('metas_ahorro').select('*').order('prioridad', { ascending: true })
    ])
    setProyectos(p || [])
    setMetas(m || [])
    if (p?.length && !form.proyecto_id) setForm(f => ({ ...f, proyecto_id: p[0].id }))
    setCargando(false)
  }

  const getNombreProy = (id) => proyectos.find(p => p.id === id)?.nombre || '—'

  const handleGuardar = async () => {
    if (!form.nombre || !form.monto_objetivo || !form.proyecto_id) return
    setGuardando(true)
    const { error } = await supabase.from('metas_ahorro').insert([{
      user_id: USER_ID,
      proyecto_id: form.proyecto_id,
      nombre: form.nombre,
      descripcion: form.descripcion,
      icono: form.icono,
      monto_objetivo: parseFloat(form.monto_objetivo),
      monto_actual: parseFloat(form.monto_actual) || 0,
      prioridad: metas.length + 1,
      estado: 'activa',
      fecha_inicio: new Date().toISOString().split('T')[0],
      fecha_meta_estimada: form.fecha_meta_estimada || null,
    }])
    if (error) { alert("Error: " + error.message); setGuardando(false); return; }
    if (!error) {
      await cargarDatos()
      setMostrarForm(false)
      setForm({ nombre: '', descripcion: '', monto_objetivo: '', monto_actual: '0', proyecto_id: proyectos[0]?.id || '', icono: '🎯', fecha_meta_estimada: '' })
    }
    setGuardando(false)
  }

  const handleAbonar = async (meta, monto) => {
    const nuevo = Math.min(parseFloat(meta.monto_actual) + parseFloat(monto), parseFloat(meta.monto_objetivo))
    const estado = nuevo >= parseFloat(meta.monto_objetivo) ? 'completada' : 'activa'
    await supabase.from('metas_ahorro').update({ monto_actual: nuevo, estado, updated_at: new Date().toISOString() }).eq('id', meta.id)
    await cargarDatos()
  }

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar esta meta?')) return
    await supabase.from('metas_ahorro').delete().eq('id', id)
    setMetas(prev => prev.filter(m => m.id !== id))
  }

  const totalObjetivo = metas.reduce((s, m) => s + parseFloat(m.monto_objetivo || 0), 0)
  const totalActual = metas.reduce((s, m) => s + parseFloat(m.monto_actual || 0), 0)
  const progresoGlobal = totalObjetivo > 0 ? (totalActual / totalObjetivo) * 100 : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', backgroundColor: '#F3F4F6', overflow: 'hidden' }}>

      {/* HEADER */}
      <div style={{ backgroundColor: '#111827', padding: '14px 20px 12px', flexShrink: 0 }}>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, fontFamily: 'monospace', margin: 0 }}>METAS DE AHORRO</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ color: '#fff', fontSize: 22, fontWeight: 900, fontFamily: 'monospace', margin: '2px 0 0' }}>${totalActual.toFixed(2)}</p>
            <p style={{ color: '#6B7280', fontSize: 10, fontFamily: 'monospace', margin: '2px 0 0' }}>de ${totalObjetivo.toFixed(2)} objetivo</p>
          </div>
          <button onClick={() => setMostrarForm(true)} style={{ backgroundColor: '#F97316', border: 'none', borderRadius: 12, color: '#fff', fontSize: 13, fontWeight: 700, padding: '8px 16px', cursor: 'pointer' }}>+ Nueva</button>
        </div>
        {/* Barra global */}
        <div style={{ marginTop: 10, height: 4, backgroundColor: '#374151', borderRadius: 99 }}>
          <div style={{ height: 4, borderRadius: 99, backgroundColor: '#F97316', width: `${progresoGlobal}%`, transition: 'width 0.3s' }} />
        </div>
        <p style={{ color: '#6B7280', fontSize: 9, fontFamily: 'monospace', margin: '4px 0 0', textAlign: 'right' }}>{progresoGlobal.toFixed(1)}% global</p>
      </div>

      {/* LISTA */}
      <div style={{ flex: 1, overflow: 'auto', padding: '12px' }}>
        {cargando ? (
          <p style={{ textAlign: 'center', color: '#9CA3AF', fontFamily: 'monospace', marginTop: 40 }}>Cargando...</p>
        ) : metas.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: 60 }}>
            <p style={{ fontSize: 48, margin: 0 }}>🎯</p>
            <p style={{ color: '#9CA3AF', fontSize: 14, margin: '12px 0 0' }}>No tienes metas aún</p>
            <button onClick={() => setMostrarForm(true)} style={{ marginTop: 16, backgroundColor: '#F97316', border: 'none', borderRadius: 12, color: '#fff', fontSize: 14, fontWeight: 700, padding: '12px 24px', cursor: 'pointer' }}>Crear primera meta</button>
          </div>
        ) : metas.map(m => {
          const pNombre = getNombreProy(m.proyecto_id)
          const cfg = PROYECTOS_CONFIG[pNombre] || { emoji: '📋', color: '#6B7280', bg: '#F9FAFB', border: '#E5E7EB' }
          const objetivo = parseFloat(m.monto_objetivo)
          const actual = parseFloat(m.monto_actual || 0)
          const pct = objetivo > 0 ? Math.min((actual / objetivo) * 100, 100) : 0
          const completada = m.estado === 'completada' || pct >= 100
          const falta = Math.max(objetivo - actual, 0)
          const [abonoInput, setAbonoInput] = useState('')

          return (
            <div key={m.id} style={{ backgroundColor: '#fff', borderRadius: 16, padding: '16px', marginBottom: 10, border: `1.5px solid ${cfg.border}` }}>
              {/* Header card */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                    {m.icono || cfg.emoji}
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 800, color: '#111827', margin: 0 }}>{m.nombre}</p>
                    <p style={{ fontSize: 11, color: cfg.color, margin: '2px 0 0', fontWeight: 600 }}>{cfg.emoji} {pNombre}</p>
                  </div>
                </div>
                <button onClick={() => handleEliminar(m.id)} style={{ background: 'none', border: 'none', color: '#D1D5DB', fontSize: 16, cursor: 'pointer' }}>✕</button>
              </div>

              {/* Montos */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: '#9CA3AF', fontFamily: 'monospace' }}>AHORRADO</span>
                <span style={{ fontSize: 11, color: '#9CA3AF', fontFamily: 'monospace' }}>OBJETIVO</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 20, fontWeight: 900, fontFamily: 'monospace', color: completada ? '#059669' : cfg.color }}>${actual.toFixed(2)}</span>
                <span style={{ fontSize: 20, fontWeight: 900, fontFamily: 'monospace', color: '#374151' }}>${objetivo.toFixed(2)}</span>
              </div>

              {/* Barra progreso */}
              <div style={{ height: 8, backgroundColor: '#F3F4F6', borderRadius: 99, marginBottom: 6 }}>
                <div style={{ height: 8, borderRadius: 99, backgroundColor: completada ? '#059669' : cfg.color, width: `${pct}%`, transition: 'width 0.4s' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: completada ? 0 : 12 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: completada ? '#059669' : cfg.color, fontFamily: 'monospace' }}>{pct.toFixed(1)}%</span>
                {!completada && <span style={{ fontSize: 11, color: '#9CA3AF', fontFamily: 'monospace' }}>Falta ${falta.toFixed(2)}</span>}
              </div>

              {/* Completada o abono */}
              {completada ? (
                <div style={{ textAlign: 'center', padding: '8px', backgroundColor: '#ECFDF5', borderRadius: 10 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#059669', margin: 0 }}>✅ ¡Meta alcanzada!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 8 }}>
                  <input type="text" inputMode="decimal" placeholder="Abono $" value={abonoInput}
                    onChange={e => setAbonoInput(e.target.value.replace(',', '.'))}
                    style={{ flex: 1, padding: '8px 12px', borderRadius: 10, border: '2px solid #E5E7EB', fontSize: 14, fontFamily: 'monospace', outline: 'none' }} />
                  <button onClick={() => { if (abonoInput && parseFloat(abonoInput) > 0) { handleAbonar(m, abonoInput); setAbonoInput('') } }}
                    style={{ padding: '8px 14px', borderRadius: 10, border: 'none', backgroundColor: cfg.color, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                    + Abonar
                  </button>
                </div>
              )}
              {m.fecha_meta_estimada && !completada && (
                <p style={{ fontSize: 10, color: '#9CA3AF', fontFamily: 'monospace', margin: '8px 0 0', textAlign: 'right' }}>📅 Meta: {m.fecha_meta_estimada}</p>
              )}
            </div>
          )
        })}
      </div>

      {/* MODAL NUEVA META */}
      {mostrarForm && (
        <div onClick={() => setMostrarForm(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 50, display: 'flex', alignItems: 'flex-end' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', backgroundColor: '#fff', borderRadius: '20px 20px 0 0', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 8px' }}>
              <div style={{ width: 36, height: 4, borderRadius: 99, backgroundColor: '#E5E7EB' }} />
            </div>
            <div style={{ padding: '0 20px 8px', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: 16, fontWeight: 900, color: '#111827', margin: 0 }}>Nueva Meta</p>
              <button onClick={() => setMostrarForm(false)} style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ overflow: 'auto', flex: 1, padding: "16px 20px 100px", display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Icono selector */}
              <div>
                <p style={{ fontSize: 10, fontFamily: 'monospace', color: '#9CA3AF', fontWeight: 700, margin: '0 0 8px' }}>ÍCONO</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {ICONOS.map(ic => (
                    <button key={ic} onClick={() => setForm(f => ({ ...f, icono: ic }))}
                      style={{ width: 40, height: 40, borderRadius: 10, border: `2px solid ${form.icono === ic ? '#F97316' : '#E5E7EB'}`, backgroundColor: form.icono === ic ? '#FFF7ED' : '#F9FAFB', fontSize: 20, cursor: 'pointer' }}>
                      {ic}
                    </button>
                  ))}
                </div>
              </div>

              {[
                { label: 'NOMBRE', field: 'nombre', placeholder: 'Ej: Fondo de emergencia', type: 'text' },
                { label: 'MONTO OBJETIVO ($)', field: 'monto_objetivo', placeholder: '5000.00', type: 'text', mode: 'decimal' },
                { label: 'YA AHORRADO ($)', field: 'monto_actual', placeholder: '0.00', type: 'text', mode: 'decimal' },
              ].map(({ label, field, placeholder, type, mode }) => (
                <div key={field}>
                  <p style={{ fontSize: 10, fontFamily: 'monospace', color: '#9CA3AF', fontWeight: 700, margin: '0 0 6px' }}>{label}</p>
                  <input type={type} inputMode={mode} placeholder={placeholder} value={form[field]}
                    onChange={e => setForm(f => ({ ...f, [field]: e.target.value.replace(',', '.') }))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '2px solid #E5E7EB', fontSize: 15, boxSizing: 'border-box', outline: 'none' }} />
                </div>
              ))}

              <div>
                <p style={{ fontSize: 10, fontFamily: 'monospace', color: '#9CA3AF', fontWeight: 700, margin: '0 0 6px' }}>PROYECTO</p>
                <select value={form.proyecto_id} onChange={e => setForm(f => ({ ...f, proyecto_id: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '2px solid #E5E7EB', fontSize: 15, outline: 'none' }}>
                  {proyectos.map(p => <option key={p.id} value={p.id}>{PROYECTOS_CONFIG[p.nombre]?.emoji} {p.nombre}</option>)}
                </select>
              </div>

              <div>
                <p style={{ fontSize: 10, fontFamily: 'monospace', color: '#9CA3AF', fontWeight: 700, margin: '0 0 6px' }}>FECHA OBJETIVO (opcional)</p>
                <input type="date" value={form.fecha_meta_estimada} onChange={e => setForm(f => ({ ...f, fecha_meta_estimada: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '2px solid #E5E7EB', fontSize: 15, boxSizing: 'border-box', outline: 'none' }} />
              </div>

              <button onClick={handleGuardar} disabled={guardando || !form.nombre || !form.monto_objetivo}
                style={{ width: '100%', padding: '16px', borderRadius: 14, border: 'none', backgroundColor: form.nombre && form.monto_objetivo ? '#F97316' : '#E5E7EB', color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>
                {guardando ? '⏳ Guardando...' : '🎯 Crear Meta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
