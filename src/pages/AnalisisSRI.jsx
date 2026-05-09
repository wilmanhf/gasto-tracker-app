import React, { useState, useEffect } from "react";
import { supabase } from "../config/supabaseClient";

const CODIGOS_SRI = {
  "Materiales": { codigo: "621", descripcion: "Materiales e insumos" },
  "Transporte": { codigo: "623", descripcion: "Combustible y transporte" },
  "Servicios": { codigo: "624", descripcion: "Servicios" },
  "Mantenimiento": { codigo: "625", descripcion: "Mantenimiento y reparación" },
  "Comunicaciones": { codigo: "626", descripcion: "Servicios de comunicación" },
  "Alimentación": { codigo: "628", descripcion: "Suministros y alimentación" },
  "Capacitación": { codigo: "629", descripcion: "Capacitación" },
  "Administrativos": { codigo: "631", descripcion: "Gastos administrativos" },
  "Salarios": { codigo: "611", descripcion: "Salarios y beneficios" },
};

export default function AnalisisSRI() {
  const [transacciones, setTransacciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [año, setAño] = useState(new Date().getFullYear());

  useEffect(() => {
    cargarTransacciones();
  }, []);

  const cargarTransacciones = async () => {
    try {
      const { data } = await supabase.from("transacciones").select("*");
      setTransacciones(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const gastosPorCategoria = transacciones
    .filter((t) => t.tipo === "gasto" && new Date(t.fecha).getFullYear() === año)
    .reduce((acc, t) => {
      acc[t.categoria] = (acc[t.categoria] || 0) + t.monto;
      return acc;
    }, {});

  const totalGastos = Object.values(gastosPorCategoria).reduce((a, b) => a + b, 0);

  const generarDFIEspecificacion = () => {
    let contenido = `
ESPECIFICACIÓN DE INGRESOS Y GASTOS POR CATEGORÍA
Año Fiscal: ${año}
Generado: ${new Date().toLocaleDateString("es-ES")}

┌─────────────────────────────────────────────────────────────┐
│ DETALLE DE GASTOS DEDUCIBLES - SRI ECUADOR                  │
└─────────────────────────────────────────────────────────────┘

`;

    Object.entries(gastosPorCategoria).forEach(([categoria, monto]) => {
      const codigoSri = CODIGOS_SRI[categoria] || { codigo: "999", descripcion: "Otros" };
      const porcentaje = ((monto / totalGastos) * 100).toFixed(2);
      
      contenido += `
CATEGORÍA: ${categoria}
Código SRI: ${codigoSri.codigo} - ${codigoSri.descripcion}
Monto Total: $${monto.toFixed(2)}
Porcentaje: ${porcentaje}%
─────────────────────────────────────────────────────────────
`;
    });

    contenido += `
═════════════════════════════════════════════════════════════
RESUMEN FISCAL
═════════════════════════════════════════════════════════════
Total Gastos Deducibles: $${totalGastos.toFixed(2)}
Número de Categorías: ${Object.keys(gastosPorCategoria).length}
Período: Año ${año}

NOTAS:
- Este reporte es informativo para fines tributarios
- Consulte con su contador o asesor fiscal
- Los gastos deben estar respaldados por comprobantes válidos
- Presente la Declaración de Impuestos a la Renta (DIT) en el SRI
═════════════════════════════════════════════════════════════
`;

    return contenido;
  };

  const descargarDFI = () => {
    const contenido = generarDFIEspecificacion();
    const blob = new Blob([contenido], { type: "text/plain;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Analisis_SRI_${año}.txt`;
    link.click();
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
        <h1 className="text-2xl font-bold">🇪🇨 Análisis Fiscal SRI</h1>
        <p className="text-gray-300 text-sm mt-1">Categorización de gastos para declaración tributaria</p>
      </div>

      <div className="px-4 max-w-4xl mx-auto mt-6">
        {/* Selector de Año */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-semibold text-gray-600">Año Fiscal:</label>
            <select
              value={año}
              onChange={(e) => setAño(parseInt(e.target.value))}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              {[2024, 2025, 2026].map((y) => (
                <option key={y}>{y}</option>
              ))}
            </select>
            <button
              onClick={descargarDFI}
              className="ml-auto bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-700 transition"
            >
              📥 Descargar DFI
            </button>
          </div>
        </div>

        {/* Tabla de Gastos por Categoría */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Gastos por Categoría - Códigos SRI</h2>

          {Object.keys(gastosPorCategoria).length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-gray-700">Categoría</th>
                    <th className="px-4 py-3 font-semibold text-gray-700">Código SRI</th>
                    <th className="px-4 py-3 font-semibold text-gray-700">Descripción</th>
                    <th className="px-4 py-3 font-semibold text-gray-700 text-right">Monto</th>
                    <th className="px-4 py-3 font-semibold text-gray-700 text-right">%</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(gastosPorCategoria).map(([categoria, monto]) => {
                    const codigoSri = CODIGOS_SRI[categoria] || { codigo: "999", descripcion: "Otros" };
                    const porcentaje = ((monto / totalGastos) * 100).toFixed(1);

                    return (
                      <tr key={categoria} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{categoria}</td>
                        <td className="px-4 py-3 text-gray-600 font-mono">{codigoSri.codigo}</td>
                        <td className="px-4 py-3 text-gray-600">{codigoSri.descripcion}</td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-900">${monto.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right text-gray-600">{porcentaje}%</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                  <tr>
                    <td colSpan="3" className="px-4 py-3 font-bold text-gray-900">TOTAL GASTOS DEDUCIBLES</td>
                    <td className="px-4 py-3 text-right font-bold text-gray-900">${totalGastos.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-bold text-gray-900">100%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-6">No hay gastos registrados para el año {año}</p>
          )}
        </div>

        {/* Información SRI */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-3">ℹ️ Información Importante - SRI Ecuador</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>✓ Los gastos deben estar respaldados por comprobantes válidos (facturas, recibos).</li>
            <li>✓ Presentar la Declaración de Impuestos a la Renta (DIT) antes de la fecha límite.</li>
            <li>✓ Mantener registros contables durante 7 años según la ley.</li>
            <li>✓ Consulte con su contador o asesor fiscal para optimizar deducciones.</li>
            <li>✓ Los códigos SRI mostrados son aproximados; verifique en www.sri.gob.ec</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
