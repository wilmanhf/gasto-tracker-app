import { createClient } from '@supabase/supabase-js'

// Configuración desde variables de entorno
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de entorno SUPABASE_URL o SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseKey)
