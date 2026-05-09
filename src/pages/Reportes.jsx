import React, { useState, useEffect } from "react";
import { supabase } from "../config/supabaseClient";

export default function Reportes() {
  const [transacciones, setTransacciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [fechaInicio, setFechaInicio] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split("T")[0]);
  const [fechaFin, setFechaFin] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    cargarTransacciones();
  }, []);

  const cargarTransacciones = async () => {
    try {
      const { data } = await supabase.from("transacciones").select("*").order("fecha", { ascending: false });
      setTransacciones(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const filtradas = transacciones.filter((t) => {
    const fecha = new Date(t.fecha);
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    return fecha >= inicio && fecha <= fin;
  });

  const totalGastos = filtradas.filter((t) => t.tipo === "gasto").reduce((sum, t) => sum + t.monto, 0);
  const totalIngresos = filtradas.filter((t) => t.tipo === "ingreso").reduce((sum, t) => sum + t.monto, 0);
  const balance = totalIngresos - totalGastos;

  const exportarCSV = () => {
    let csv = "Fecha,Descripción,Proveedor,Categoría,Proyecto,Tipo,Monto\n";
    
    filtradas.forEach((t) => {
      csv += `"${new Date(t.fecha).toLocaleDateString("es-ES")}","${t.descripcion}","${t.proveedor || "-"}","${t.categoria}","${t.proyecto}","${t.tipo}","${t.monto.toFixed(2)}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Gasto_Tracker_${fechaInicio}_a_${fechaFin}.csv`;
    link.click();
  };

  const exportarPDF = () => {
    let contenido = `
      <html>
        <head>
          <meta charset="utf-8">
          <title>Reporte Gasto Tracker</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; }
            .resumen { background: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background: #ff6600; color: white; }
            .gasto { color: red; }
            .ingreso { color: green; }
          </style>
        </head>
        <body>
          <h1>💰 Gasto Tracker - Reporte Financiero</h1>
          <p>Período: ${new Date(fechaInicio).toLocaleDateString("es-ES")} a ${new Date(fechaFin).toLocaleDateString("es-ES")}</p>
          
          <div class="resumen">
            <h2>Resumen</h2>
            <p><strong>Total Gastos:</strong> $${totalGastos.toFixed(2)}</p>
            <p><strong>Total Ingresos:</strong> $${totalIngresos.toFixed(2)}</p>
            <p><strong>Balance:</strong> $${balance.toFixed(2)}</p>
            <p><strong>Transacciones:</strong> ${filtradas.length}</p>
          </div>

          <h2>Detalle de Transacciones</h2>
          <table>
            <tr>
              <th>Fecha</th>
              <th>Descripción</th>
              <th>Categoría</th>
              <th>Proyecto</th>
              <th>Monto</th>
            </tr>
            ${filtradas.map((t) => `
              <tr>
                <td>${new Date(t.fecha).toLocaleDateString("es-ES")}</td>
                <td>${t.descripcion}</td>
                <td>${t.categoria}</td>
                <td>${t.proyecto}</td>
                <td class="${t.tipo === "gasto" ? "gasto" : "ingreso"}">
                  ${t.tipo === "gasto" ? "-" : "+"}$${t.monto.toFixed(2)}
                </td>
              </tr>
            `).join("")}
          </table>
        </body>
      </html>
    `;

    const ventana = window.open("", "", "width=800,height=600");
    ventana.document.write(contenido);
    ventana.document.close();
    setTimeout(() => ventana.print(), 250);
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Cargando datos...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-10">
      <div className="bg-gray-700 text-white px-4 pt-10 pb-6">
        <h1 className="text-2xl font-bold">📄 Reportes</h1>
        <p className="text-gray-300 text-sm mt-1">Exporta tus datos a PDF o CSV</p>
      </div>

      <div className="px-4 max-w-4xl mx-auto mt-6">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Selecciona el período</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase">Fecha Inicio</label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase">Fecha Fin</label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={exportarCSV}
              className="bg-blue-600 text-white rounded-lg py-3 font-bold hover:bg-blue-700 transition"
            >
              📊 Descargar CSV
            </button>
            <button
              onClick={exportarPDF}
              className="bg-red-600 text-white rounded-lg py-3 font-bold hover:bg-red-700 transition"
            >
              📄 Imprimir PDF
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-500 text-sm">Total Gastos</p>
            <p className="text-3xl font-bold text-red-600">${totalGastos.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-500 text-sm">Total Ingresos</p>
            <p className="text-3xl font-bold text-green-600">${totalIngresos.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-500 text-sm">Balance</p>
            <p className={`text-3xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
              ${balance.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            📋 Transacciones ({filtradas.length})
          </h2>

          {filtradas.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-2 font-semibold text-gray-700">Fecha</th>
                    <th className="px-4 py-2 font-semibold text-gray-700">Descripción</th>
                    <th className="px-4 py-2 font-semibold text-gray-700">Categoría</th>
                    <th className="px-4 py-2 font-semibold text-gray-700">Proyecto</th>
                    <th className="px-4 py-2 font-semibold text-gray-700 text-right">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {filtradas.slice(0, 20).map((t) => (
                    <tr key={t.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2 text-gray-600">{new Date(t.fecha).toLocaleDateString("es-ES")}</td>
                      <td className="px-4 py-2 text-gray-900">{t.descripcion}</td>
                      <td className="px-4 py-2 text-gray-600">{t.categoria}</td>
                      <td className="px-4 py-2 text-gray-600">{t.proyecto}</td>
                      <td className={`px-4 py-2 font-bold text-right ${t.tipo === "gasto" ? "text-red-600" : "text-green-600"}`}>
                        {t.tipo === "gasto" ? "-" : "+"}${t.monto.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-6">No hay transacciones en este período</p>
          )}
        </div>
      </div>
    </div>
  );
}
