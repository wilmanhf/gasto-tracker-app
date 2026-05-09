import React, { useState, useEffect } from "react";
import { supabase } from "../config/supabaseClient";

const PROYECTOS = ["METALPAC", "ANTA Chimeneas", "Casa Nueva", "Personal"];

export default function Metas() {
  const [metas, setMetas] = useState([]);
  const [transacciones, setTransacciones] = useState([]);
  const [nombre, setNombre] = useState("");
  const [monto, setMonto] = useState("");
  const [proyecto, setProyecto] = useState("Personal");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    // Cargar metas de localStorage
    const metasGuardadas = localStorage.getItem("metas_ahorro");
    if (metasGuardadas) {
      setMetas(JSON.parse(metasGuardadas));
    }

    // Cargar transacciones de Supabase
    try {
      const { data } = await supabase.from("transacciones").select("*");
      setTransacciones(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const guardarMetas = (metasActualizadas) => {
    setMetas(metasActualizadas);
    localStorage.setItem("metas_ahorro", JSON.stringify(metasActualizadas));
  };

  const agregarMeta = () => {
    if (!nombre || !monto) return;

    const nuevaMeta = {
      id: Date.now(),
      nombre,
      monto_objetivo: parseFloat(monto),
      proyecto,
      fecha_creacion: new Date().toISOString(),
    };

    guardarMetas([...metas, nuevaMeta]);
    setNombre("");
    setMonto("");
    setProyecto("Personal");
  };

  const eliminarMeta = (id) => {
    guardarMetas(metas.filter((m) => m.id !== id));
  };

  const calcularAhorrado = (metaProyecto) => {
    return transacciones
      .filter((t) => t.proyecto === metaProyecto && t.tipo === "ingreso")
      .reduce((sum, t) => sum + t.monto, 0);
  };

  const calcularProgreso = (metaProyecto, objetivo) => {
    const ahorrado = calcularAhorrado(metaProyecto);
    return Math.min((ahorrado / objetivo) * 100, 100);
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
        <h1 className="text-2xl font-bold">🎯 Metas de Ahorro</h1>
        <p className="text-gray-300 text-sm mt-1">Crea y monitorea tus objetivos financieros</p>
      </div>

      <div className="px-4 max-w-4xl mx-auto mt-6">
        {/* Formulario Nueva Meta */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">➕ Nueva Meta</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase">Nombre de la Meta</label>
              <input
                type="text"
                placeholder="Ej: Fondo de emergencia"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase">Monto Objetivo (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="5000.00"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase">Proyecto</label>
                <select
                  value={proyecto}
                  onChange={(e) => setProyecto(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  {PROYECTOS.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={agregarMeta}
              className="w-full bg-orange-600 text-white rounded-lg py-3 font-bold hover:bg-orange-700 transition"
            >
              💾 Crear Meta
            </button>
          </div>
        </div>

        {/* Metas */}
        {metas.length > 0 ? (
          <div className="space-y-4">
            {metas.map((meta) => {
              const ahorrado = calcularAhorrado(meta.proyecto);
              const progreso = calcularProgreso(meta.proyecto, meta.monto_objetivo);
              const completada = progreso >= 100;

              return (
                <div key={meta.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{meta.nombre}</h3>
                      <p className="text-gray-500 text-sm">Proyecto: {meta.proyecto}</p>
                    </div>
                    <button
                      onClick={() => eliminarMeta(meta.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      ✕ Eliminar
                    </button>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">
                        ${ahorrado.toFixed(2)} / ${meta.monto_objetivo.toFixed(2)}
                      </span>
                      <span className={`font-bold ${completada ? "text-green-600" : "text-orange-600"}`}>
                        {progreso.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          completada ? "bg-green-600" : "bg-orange-600"
                        }`}
                        style={{ width: `${progreso}%` }}
                      />
                    </div>
                  </div>

                  {completada ? (
                    <p className="text-green-600 font-semibold text-center">✅ ¡Meta alcanzada!</p>
                  ) : (
                    <p className="text-gray-600 text-center text-sm">
                      Te faltan ${(meta.monto_objetivo - ahorrado).toFixed(2)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">No tienes metas de ahorro aún. ¡Crea una para empezar! 🎯</p>
          </div>
        )}
      </div>
    </div>
  );
}
