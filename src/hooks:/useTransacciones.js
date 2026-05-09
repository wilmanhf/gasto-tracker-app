import { useState, useEffect } from 'react'
import { supabase } from '../config/supabaseClient'

export function useTransacciones() {
  const [transacciones, setTransacciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Cargar transacciones
  const fetchTransacciones = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('transacciones')
        .select('*, categorias(nombre, icono), proyectos(nombre)')
        .order('fecha', { ascending: false })

      if (error) throw error
      setTransacciones(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Crear transacción
  const crearTransaccion = async (transaccion) => {
    try {
      const { data, error } = await supabase
        .from('transacciones')
        .insert([transaccion])
        .select()

      if (error) throw error
      setTransacciones([data[0], ...transacciones])
      return data[0]
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  // Actualizar transacción
  const actualizarTransaccion = async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('transacciones')
        .update(updates)
        .eq('id', id)
        .select()

      if (error) throw error
      setTransacciones(transacciones.map(t => t.id === id ? data[0] : t))
      return data[0]
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  // Eliminar transacción
  const eliminarTransaccion = async (id) => {
    try {
      const { error } = await supabase
        .from('transacciones')
        .delete()
        .eq('id', id)

      if (error) throw error
      setTransacciones(transacciones.filter(t => t.id !== id))
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  useEffect(() => {
    fetchTransacciones()
  }, [])

  return {
    transacciones,
    loading,
    error,
    fetchTransacciones,
    crearTransaccion,
    actualizarTransaccion,
    eliminarTransaccion
  }
}
