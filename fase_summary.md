# Fase 0 — Resumen de Actividades

> Andamiaje inicial del repositorio `direcciones-fiscales`.

## 1. Configuración de microservicios (Spring Boot)

| Servicio | Puerto | application.yml | Compilación |
|---|---|---|---|
| ms-direcciones-fiscales | 8081 | ✅ | ✅ |
| ms-fideicomisos-adapter | 8082 | ✅ | ✅ |
| ms-cif-procesamiento | 8083 | ✅ | ✅ |
| ms-carga-masiva | 8084 | ✅ | ✅ |

- Conexión a PostgreSQL: `localhost:5432/direcciones_fiscales`, usuario `labuser`
- JPA: `ddl-auto: validate`, dialecto `PostgreSQLDialect`
- Endpoint `/actuator/health` habilitado con `show-details: always`

## 2. Frontend (React + Vite)

- Tailwind CSS v4 instalado e integrado (`@tailwindcss/vite` + `@import "tailwindcss"`)
- Estructura `src/features/direcciones-fiscales/` creada:

```
src/features/direcciones-fiscales/
├── api/
│   ├── direccionesApi.ts
│   ├── fideicomisosApi.ts
│   └── cifApi.ts
├── components/
│   ├── BusquedaCriteriosForm/BusquedaCriteriosForm.tsx
│   ├── CifUploader/CifUploader.tsx
│   ├── DomicilioForm/DomicilioForm.tsx
│   ├── DomicilioModal/DomicilioModal.tsx
│   ├── DomiciliosGrid/DomiciliosGrid.tsx
│   └── DomiciliosHeredablesGrid/DomiciliosHeredablesGrid.tsx
├── hooks/
│   └── useDireccionesFiscales.ts
├── types/
│   └── domicilioFiscal.ts
└── DireccionesFiscalesPage.tsx
```

- Build exitoso (`vite build`)

## 3. Pendiente

- Verificar `/actuator/health` en cada microservicio (requiere PostgreSQL corriendo)
- Continuar con Fase 1+ (lógica de negocio) según `03-tasks-opencode.md`
