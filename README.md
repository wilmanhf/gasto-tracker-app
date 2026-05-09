# 💰 Gasto Tracker - Sistema de Inteligencia Financiera

## Estado del Proyecto

**Versión:** 1.0.0-beta  
**Fecha:** 9 de Mayo de 2026  
**Desarrollador:** Wilman Herrera

## ✅ Completado

- [x] Estructura React con Vite
- [x] Supabase base de datos (tablas creadas)
- [x] Sistema de routing (React Router)
- [x] Componentes esqueleto (Home, Captura, Dashboard, Historial)
- [x] Hooks personalizados (useTransacciones)
- [x] Estilos CSS base
- [x] Configuración Supabase integrada
- [x] Despliegue en Vercel

## 🚀 Próximos Pasos (Sesión Siguiente)

### FASE 1: Captura OCR (2 horas)
- [ ] Integrar Claude Vision API
- [ ] Componente de cámara
- [ ] Extracción automática de datos
- [ ] Validación de comprobantes
- [ ] Pruebas con comprobantes reales

### FASE 2: Dashboard Interactivo (1.5 horas)
- [ ] Gráficos con Recharts
- [ ] Análisis por proyecto
- [ ] Alertas de desviación presupuestaria
- [ ] Visualización de tendencias
- [ ] Comparativo vs presupuesto

### FASE 3: Metas de Ahorro (1 hora)
- [ ] Crear y editar metas
- [ ] Seguimiento de progreso
- [ ] Transferencias de dinero
- [ ] Notificaciones

### FASE 4: Reportes y Exportación (1 hora)
- [ ] Generar reportes PDF
- [ ] Exportación a CSV
- [ ] Análisis fiscal (SRI)
- [ ] Deductibilidad automática

## 📁 Estructura de Carpetas

```
gasto-tracker/
├── src/
│   ├── config/
│   │   └── supabaseClient.js      # Configuración Supabase
│   ├── hooks/
│   │   └── useTransacciones.js    # Hook CRUD transacciones
│   ├── pages/
│   │   ├── Home.jsx               # Página principal
│   │   ├── Captura.jsx            # OCR (en desarrollo)
│   │   ├── Dashboard.jsx          # Análisis (en desarrollo)
│   │   └── Historial.jsx          # Transacciones
│   ├── App.jsx                    # Router principal
│   ├── App.css                    # Estilos
│   ├── main.jsx                   # Entry point
│   └── index.css                  # Estilos globales
├── public/
│   ├── manifest.json              # PWA manifest
│   └── robots.txt
├── package.json                   # Dependencias
├── vite.config.js                 # Config Vite
├── .env.example                   # Variables de entorno ejemplo
└── README.md                       # Este archivo
```

## 🔧 Configuración Inicial

### 1. Clonar/Descargar proyecto
```bash
git clone https://github.com/Wilmanhf/gasto-tracker.git
cd gasto-tracker
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
```bash
# Copiar archivo ejemplo
cp .env.example .env.local

# Actualizar con tus credenciales:
# VITE_SUPABASE_URL=tu_url
# VITE_SUPABASE_ANON_KEY=tu_key
# VITE_CLAUDE_API_KEY=sk-ant-...
```

### 4. Ejecutar en desarrollo
```bash
npm run dev
```

Abrirá en: http://localhost:5173

### 5. Construir para producción
```bash
npm run build
```

### 6. Desplegar a Vercel
```bash
npm run deploy
```

## 📊 Base de Datos Supabase

### Tablas Creadas

#### 1. `proyectos`
- id (UUID)
- nombre (VARCHAR)
- descripcion (TEXT)
- tipo (VARCHAR) - OPERACIONAL, INVERSION, PERSONAL
- presupuesto_mensual (NUMERIC)
- created_at (TIMESTAMP)

**Registros iniciales:**
- METALPAC (Operacional)
- ANTA Chimeneas (Operacional)
- Casa Nueva (Inversión)
- Personal (Personal)

#### 2. `categorias`
- id (UUID)
- nombre (VARCHAR) - UNIQUE
- icono (VARCHAR)
- es_deducible (BOOLEAN)
- created_at (TIMESTAMP)

**11 categorías predefinidas** (Salarios, Materiales, Transporte, etc.)

#### 3. `transacciones`
- id (UUID)
- fecha (DATE)
- monto (NUMERIC)
- comercio (VARCHAR)
- categoria_id (FK)
- proyecto_id (FK)
- tipo_comprobante (VARCHAR)
- es_deducible (BOOLEAN)
- archivo_foto_url (TEXT)
- notas (TEXT)
- created_at, updated_at (TIMESTAMP)

#### 4. `metas_ahorro`
- id (UUID)
- proyecto_id (FK)
- nombre (VARCHAR)
- descripcion (TEXT)
- icono (VARCHAR)
- monto_objetivo (NUMERIC)
- monto_actual (NUMERIC)
- prioridad (INTEGER)
- estado (VARCHAR)
- fecha_inicio, fecha_meta_estimada (DATE)
- created_at, updated_at (TIMESTAMP)

#### 5. `traspasos_ahorro`
- id (UUID)
- meta_id (FK)
- monto (NUMERIC)
- fecha_traspaso (DATE)
- concepto (TEXT)
- fuente (VARCHAR)
- created_at (TIMESTAMP)

## 🔑 Credenciales Supabase

- **URL:** https://slvolgzwvhllgtuyfoko.supabase.co
- **ANON KEY:** [Guardada en variables de entorno]
- **Proyecto:** gasto-tracker
- **Organización:** wilmanhf's Org (FREE tier)

## 🎨 Stack Tecnológico

**Frontend:**
- React 18.2.0
- Vite 5.0.0
- React Router 6.20.0
- Tailwind CSS 3.4.0

**Backend/Database:**
- Supabase (PostgreSQL + Auth)
- Row Level Security (RLS) habilitado

**APIs & Librerías:**
- Claude API (Vision para OCR)
- Recharts (gráficos)
- jsPDF (reportes PDF)
- html2canvas (captura de pantalla)
- date-fns (manejo de fechas)

**Hosting:**
- Vercel (frontend)
- Supabase (backend + base de datos)

## 📱 Dispositivios Soportados

- ✅ iPhone 15 Pro Max (430x932px)
- ✅ iPad
- ✅ Mac
- ✅ Responsive (mobile-first)

## 🔐 Seguridad

- RLS habilitado en todas las tablas
- Autenticación via Supabase Auth
- Variables de entorno protegidas
- HTTPS en producción

## 📝 Notas para la Siguiente Sesión

### Mañana implementar:

1. **Captura OCR (PRIORITARIO)**
   - Usar `Claude Vision API`
   - Componente de cámara
   - Manejo de errores

2. **Dashboard (IMPORTANTE)**
   - Recharts para gráficos
   - Análisis por proyecto
   - KPIs en tiempo real

3. **Metas de Ahorro**
   - Segregación de dinero
   - Seguimiento visual

4. **Reportes**
   - PDF generation
   - CSV export
   - Análisis fiscal SRI

### Recursos:
- Documentación Supabase: https://supabase.com/docs
- Claude API Docs: https://docs.anthropic.com
- Recharts Docs: https://recharts.org

## 🚢 Despliegue

### Vercel (Ya configurado)
URL: https://gasto-tracker-sage.vercel.app

Para actualizar después de cambios:
```bash
git add .
git commit -m "Update features"
git push origin main
# Vercel auto-deploya
```

## 📞 Contacto

**Desarrollador:** Wilman Herrera  
**Email:** wilman@example.com  
**Proyecto:** Sistema de Inteligencia Financiera  

---

**Última actualización:** 9 de mayo de 2026  
**Estado:** 🟢 Listo para desarrollo
