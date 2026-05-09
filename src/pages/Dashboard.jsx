import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { supabase } from "../config/supabaseClient";

export default function Dashboard() {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const { data, error: err } = await supabase.from("transacciones").select("*");
      if (err) throw err;

      // Procesar datos
      const gastos = data.filter(d => d.tipo === "gasto");
      const ingresos = data.filter(d => d.tipo === "ingreso");

      const totalGastos = gastos.reduce((sum, d) => sum + d.monto, 0);
      const totalIngresos = ingresos.reduce((sum, d) => sum + d.monto, 0);

      // Agrupar por categoría
      const porCategoria = {};
      gastos.forEach(d => {
        porCategoria[d.categoria] = (porCategoria[d.categoria] || 0) + d.monto;
      });

      const datosCategoria = Object.entries(porCategoria).map(([nombre, valor]) => ({
        name: nombre,
        value: parseFloat(valor.toFixed(2))
      }));

      // Agrupar por proyecto
      const porProyecto = {};
      data.forEach(d => {
        if (!porProyecto[d.proyecto]) {
          porProyecto[d.proyecto] = { gastos: 0, ingresos: 0 };
        }
        if (d.tipo === "gasto") {
          porProyecto[d.proyecto].gastos += d.monto;
        } else {
          porProyecto[d.proyecto].ingresos += d.monto;
        }
      });

      const datosProyecto = Object.entries(porProyecto).map(([nombre, { gastos, ingresos }]) => ({
        name: nombre,
        Gastos: parseFloat(gastos.toFixed(2)),
        Ingresos: parseFloat(ingresos.toFixed(2))
      }));

      setDatos({
        totalGastos: parseFloat(totalGastos.toFixed(2)),
        totalIngresos: parseFloat(totalIngresos.toFixed(2)),
        balance: parseFloat((totalIngresos - totalGastos).toFixed(2)),
        datosCategoria,
        datosProyecto,
        transacciones: data.length
      });
    } catch (err) {
      console.error(err);
      setError("Error al cargar datos");
    } finally {
      setCargando(false);
    }
  };

  const COLORES = ["#7c3aed", "#f97316", "#0ea5e9", "#10b981", "#f43f5e", "#eab308", "#6366f1", "#ec4899", "#14b8a6", "#d946ef", "#64748b"];

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Cargando datos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-10">
      <div className="bg-gray-700 text-white px-4 pt-10 pb-6">
        <h1 className="text-2xl font-bold">📊 Dashboard Financiero</h1>
        <p className="text-gray-300 text-sm mt-1">Resumen de tu actividad financiera</p>
      </div>

      <div className="px-4 max-w-6xl mx-auto mt-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-500 text-sm font-semibold">Total Gastos</p>
            <p className="text-2xl font-bold text-red-600 mt-2">${datos.totalGastos.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-500 text-sm font-semibold">Total Ingresos</p>
            <p className="text-2xl font-bold text-green-600 mt-2">${datos.totalIngresos.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-500 text-sm font-semibold">Balance</p>
            <p className={`text-2xl font-bold mt-2 ${datos.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${datos.balance.toFixed(2)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-500 text-sm font-semibold">Transacciones</p>
            <p className="text-2xl font-bold text-blue-600 mt-2">{datos.transacciones}</p>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Pie Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Gastos por Categoría</h2>
            {datos.datosCategoria.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={datos.datosCategoria}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: $${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {datos.datosCategoria.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORES[index % COLORES.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-12">Sin datos de gastos</p>
            )}
          </div>

          {/* Bar Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Gastos vs Ingresos por Proyecto</h2>
            {datos.datosProyecto.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={datos.datosProyecto}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                  <Legend />
                  <Bar dataKey="Gastos" fill="#ef4444" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="Ingresos" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-12">Sin datos</p>
            )}
          </div>
        </div>

        {/* Tabla de Categorías */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Detalle por Categoría</h2>
          {datos.datosCategoria.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="pb-3 font-semibold text-gray-700">Categoría</th>
                    <th className="pb-3 font-semibold text-gray-700 text-right">Monto</th>
                    <th className="pb-3 font-semibold text-gray-700 text-right">% del Total</th>
                  </tr>
                </thead>
                <tbody>
                  {datos.datosCategoria.map((cat, idx) => (
                    <tr key={idx} className="border-b border-gray-100">
                      <td className="py-3 text-gray-700">{cat.name}</td>
                      <td className="py-3 text-right text-gray-900 font-semibold">${cat.value.toFixed(2)}</td>
                      <td className="py-3 text-right text-gray-600">
                        {((cat.value / datos.totalGastos) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-6">Sin datos</p>
          )}
        </div>

        <button 
          onClick={cargarDatos} 
          className="mt-8 mx-auto block bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-700 transition"
        >
          🔄 Actualizar
        </button>
      </div>
    </div>
  );
}
