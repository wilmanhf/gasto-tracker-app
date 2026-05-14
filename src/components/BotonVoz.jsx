import React, { useState } from 'react'

export default function BotonVoz({ onResultado }) {
  const [escuchando, setEscuchando] = useState(false)
  const [error, setError] = useState(null)

  const iniciarVoz = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setError('Tu navegador no soporta voz')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'es-EC'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => { setEscuchando(true); setError(null) }
    recognition.onend = () => setEscuchando(false)
    recognition.onerror = () => { setEscuchando(false); setError('No se escuchó nada') }

    recognition.onresult = (e) => {
      const texto = e.results[0][0].transcript.toLowerCase()
      const montoMatch = texto.match(/(\d+(?:[.,]\d{1,2})?)\s*(?:dólares?|usd|pesos?)?/)
      const monto = montoMatch ? montoMatch[1].replace(',', '.') : ''
      const descripcion = texto
        .replace(/(\d+(?:[.,]\d{1,2})?)\s*(?:dólares?|usd|pesos?)?/i, '')
        .replace(/registra?|gasto|pagué?|compré?/gi, '')
        .trim()
      onResultado({ monto, descripcion, textoOriginal: texto })
    }

    recognition.start()
  }

  return (
    <div>
      <button onClick={iniciarVoz} disabled={escuchando}
        style={{ width: "100%", padding: "14px", borderRadius: 12, border: `2px solid ${escuchando ? "#EF4444" : "#E5E7EB"}`, backgroundColor: escuchando ? "#FEF2F2" : "#F9FAFB", color: escuchando ? "#EF4444" : "#6B7280", fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s" }}>
        <span style={{ fontSize: 20 }}>{escuchando ? "🔴" : "🎤"}</span>
        {escuchando ? "Escuchando... habla ahora" : "Registrar por voz"}
      </button>
      {error && <p style={{ fontSize: 11, color: "#EF4444", margin: "6px 0 0", textAlign: "center" }}>{error}</p>}
      {!escuchando && !error && <p style={{ fontSize: 11, color: "#9CA3AF", margin: "6px 0 0", textAlign: "center", fontFamily: "monospace" }}>Ej: "15 dólares almuerzo"</p>}
    </div>
  )
}
