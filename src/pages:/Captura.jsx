import { useState, useRef } from "react";
import { supabase } from "../config/supabaseClient";

const PROYECTOS = ["METALPAC", "ANTA Chimeneas", "Casa Nueva", "Personal"];
const CATEGORIAS = ["Salarios", "Materiales", "Transporte", "Mantenimiento", "Servicios", "Comunicaciones", "Capacitación", "Administrativos", "Alimentación", "Compras", "Diversos"];
const TIPOS = ["gasto", "ingreso"];

const estadoInicial = {
  fecha: new Date().toISOString().split("T")[0],
  descripcion: "",
  monto: "",
  tipo: "gasto",
  categoria: "Diversos",
  proyecto: "Personal",
  proveedor: "",
  notas: "",
};

function extraerDatos(texto) {
  const datos = { ...estadoInicial };
  const regexMonto = /(?:total|subtotal|monto|valor|pagar|amount)[\s:]*\$?\s*([\d,]+\.?\d*)/i;
  const matchMonto = texto.match(regexMonto);
  if (matchMonto) {
    datos.monto = matchMonto[1].replace(/[,]/g, "");
  } else {
    const numeros = texto.match(/(\d+[.,]\d{2})/g) || [];
    if (numeros.length > 0) {
      datos.monto = numeros[numeros.length - 1].replace(/[,]/g, ".");
    }
  }
  const regexFecha = /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/;
  const matchFecha = texto.match(regexFecha);
  if (matchFecha) {
    const [, dia, mes, año] = matchFecha;
    datos.fecha = `${año}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
  }
  const regexProveedor = /(?:empresa|razón\s+social|de\s+)?([A-Z][A-Za-z\s&]{5,50})/i;
  const matchProveedor = texto.match(regexProveedor);
  if (matchProveedor) {
    datos.proveedor = matchProveedor[1].trim().substring(0, 50);
  }
  const textoBajo = texto.toLowerCase();
  if (textoBajo.includes("combustible") || textoBajo.includes("gasolina")) datos.categoria = "Transporte";
  else if (textoBajo.includes("material") || textoBajo.includes("herramienta")) datos.categoria = "Materiales";
  else if (textoBajo.includes("comida") || textoBajo.includes("restaurante")) datos.categoria = "Alimentación";
  else if (textoBajo.includes("reparación") || textoBajo.includes("mantenimiento")) datos.categoria = "Mantenimiento";
  else if (textoBajo.includes("teléfono") || textoBajo.includes("internet")) datos.categoria = "Comunicaciones";
  else if (textoBajo.includes("capacitación") || textoBajo.includes("curso")) datos.categoria = "Capacitación";
  const lineas = texto.split("\n").filter(l => l.trim().length > 5);
  if (lineas.length > 0) {
    datos.descripcion = lineas.slice(0, 2).join(" ").substring(0, 100);
  }
  return datos;
}

export default function Captura() {
  const [imagen, setImagen] = useState(null);
  const [imagenBase64, setImagenBase64] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const [datos, setDatos] = useState(estadoInicial);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [paso, setPaso] = useState("captura");
  const fileRef = useRef();
  const camaraRef = useRef();

  const leerArchivo = (file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImagen(url);
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result.split(",")[1];
      setImagenBase64(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleArchivo = (e) => leerArchivo(e.target.files[0]);
  const handleCamara = (e) => leerArchivo(e.target.files[0]);

  const analizarConOCR = async () => {
    if (!imagenBase64) return;
    setProcesando(true);
    setMensaje(null);
    try {
      const res = await fetch("https://api.ocr.space/parse/image", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          apikey: "K88850405488957",
          base64Image: `data:image/jpeg;base64,${imagenBase64}`,
          language: "spa",
          isOverlayRequired: false,
        }),
      });
      const data = await res.json();
      if (!data.IsErroredOnProcessing && data.ParsedText) {
        const datosExtraidos = extraerDatos(data.ParsedText);
        setDatos(datosExtraidos);
        setPaso("revision");
      } else {
        throw new Error(data.ErrorMessage || "Error en OCR");
      }
    } catch (err) {
      console.error(err);
      setMensaje({ tipo: "error", texto: "Error al analizar: " + err.message });
    } finally {
      setProcesando(false);
    }
  };

  const guardar = async () => {
    if (!datos.monto || !datos.descripcion) {
      setMensaje({ tipo: "error", texto: "Monto y descripción son obligatorios" });
      return;
    }
    setGuardando(true);
    setMensaje(null);
    try {
      const { error } = await supabase.from("transacciones").insert([{
        fecha: datos.fecha,
        descripcion: datos.descripcion,
        monto: parseFloat(datos.monto),
        tipo: datos.tipo,
        categoria: datos.categoria,
        proyecto: datos.proyecto,
        proveedor: datos.proveedor,
        notas: datos.notas,
      }]);
      if (error) throw error;
      setPaso("exito");
    } catch (err) {
      setMensaje({ tipo: "error", texto: "Error al guardar: " + err.message });
    } finally {
      setGuardando(false);
    }
  };

  const reiniciar = () => {
    setImagen(null);
    setImagenBase64(null);
    setDatos(estadoInicial);
    setMensaje(null);
    setPaso("captura");
  };

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400";
  const labelClass = "block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide";

  if (paso === "exito") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Guardado!</h2>
          <p className="text-gray-500 mb-6">
            {datos.tipo === "gasto" ? "Gasto" : "Ingreso"} de <strong>${parseFloat(datos.monto).toFixed(2)}</strong> registrado en {datos.proyecto}.
          </p>
          <button onClick={reiniciar} className="w-full bg-indigo-600 text-white rounded-xl py-3 font-semibold hover:bg-indigo-700 transition">
            📸 Capturar otro
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 pt-10 pb-6">
        <h1 className="text-2xl font-bold">📸 Capturar Gasto</h1>
        <p className="text-indigo-200 text-sm mt-1">
          {paso === "captura" ? "Fotografía o sube tu comprobante" : "Revisa y guarda"}
        </p>
      </div>
      <div className="px-4 -mt-2 max-w-lg mx-auto">
        {mensaje && (
          <div className={`mt-4 p-3 rounded-xl text-sm font-medium ${mensaje.tipo === "error" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
            {mensaje.texto}
          </div>
        )}
        {paso === "captura" && (
          <div className="mt-6 space-y-4">
            {imagen ? (
              <div className="relative">
                <img src={imagen} alt="Comprobante" className="w-full rounded-2xl shadow-md object-contain max-h-64" />
                <button onClick={reiniciar} className="absolute top-2 right-2 bg-white/80 rounded-full px-2 py-1 text-xs text-gray-600">✕ Quitar</button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-indigo-300 rounded-2xl p-8 text-center bg-white">
                <div className="text-4xl mb-2">🧾</div>
                <p className="text-gray-500 text-sm">Sin imagen seleccionada</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => camaraRef.current.click()} className="bg-indigo-600 text-white rounded-xl py-4 font-semibold text-sm hover:bg-indigo-700 transition flex flex-col items-center gap-1">
                <span className="text-2xl">📷</span>Cámara
              </button>
              <button onClick={() => fileRef.current.click()} className="bg-purple-600 text-white rounded-xl py-4 font-semibold text-sm hover:bg-purple-700 transition flex flex-col items-center gap-1">
                <span className="text-2xl">🖼️</span>Galería
              </button>
            </div>
            <input ref={camaraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleCamara} />
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleArchivo} />
            {imagen && (
              <button onClick={analizarConOCR} disabled={procesando} className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl py-4 font-bold text-base hover:opacity-90 transition disabled:opacity-60">
                {procesando ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Analizando con OCR...
                  </span>
                ) : (
                  "🔍 Extraer datos"
                )}
              </button>
            )}
            <button onClick={() => setPaso("revision")} className="w-full border border-gray-300 text-gray-600 rounded-xl py-3 text-sm hover:bg-gray-100 transition">
              ✏️ Ingresar manualmente
            </button>
          </div>
        )}
        {paso === "revision" && (
          <div className="mt-6 bg-white rounded-2xl shadow p-5 space-y-4">
            {imagen && <img src={imagen} alt="Comprobante" className="w-full rounded-xl object-contain max-h-40 mb-2" />}
            <div>
              <label className={labelClass}>Tipo</label>
              <div className="flex gap-2">
                {TIPOS.map((t) => (
                  <button key={t} onClick={() => setDatos({ ...datos, tipo: t })} className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition ${datos.tipo === t ? (t === "gasto" ? "bg-red-500 text-white border-red-500" : "bg-green-500 text-white border-green-500") : "border-gray-300 text-gray-600"}`}>
                    {t === "gasto" ? "💸 Gasto" : "💰 Ingreso"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelClass}>Monto (USD)</label>
              <input type="number" step="0.01" placeholder="0.00" value={datos.monto} onChange={(e) => setDatos({ ...datos, monto: e.target.value })} className={inputClass + " text-xl font-bold"} />
            </div>
            <div>
              <label className={labelClass}>Descripción</label>
              <input type="text" placeholder="¿Qué fue este gasto?" value={datos.descripcion} onChange={(e) => setDatos({ ...datos, descripcion: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Proveedor</label>
              <input type="text" placeholder="Nombre del proveedor" value={datos.proveedor} onChange={(e) => setDatos({ ...datos, proveedor: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Fecha</label>
              <input type="date" value={datos.fecha} onChange={(e) => setDatos({ ...datos, fecha: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Categoría</label>
              <select value={datos.categoria} onChange={(e) => setDatos({ ...datos, categoria: e.target.value })} className={inputClass}>
                {CATEGORIAS.map((c) => (<option key={c}>{c}</option>))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Proyecto</label>
              <select value={datos.proyecto} onChange={(e) => setDatos({ ...datos, proyecto: e.target.value })} className={inputClass}>
                {PROYECTOS.map((p) => (<option key={p}>{p}</option>))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Notas</label>
              <input type="text" placeholder="Opcional" value={datos.notas} onChange={(e) => setDatos({ ...datos, notas: e.target.value })} className={inputClass} />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setPaso("captura")} className="flex-1 border border-gray-300 text-gray-600 rounded-xl py-3 text-sm hover:bg-gray-50 transition">← Volver</button>
              <button onClick={guardar} disabled={guardando} className="flex-1 bg-indigo-600 text-white rounded-xl py-3 font-bold text-sm hover:bg-indigo-700 transition disabled:opacity-60">
                {guardando ? "Guardando..." : "💾 Guardar"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
