# Project Map — Migración "Direcciones Fiscales"

> Mapa de navegación del repositorio. No es un artefacto formal de Spec
> Driven Development (spec-kit no lo define), pero complementa el flujo
> `constitution → spec → plan → tasks` dándole a cualquier persona (o a
> OpenCode) una vista rápida de qué vive dónde y cómo se relaciona.

## 1. Documentos de especificación (raíz del repo)

| Archivo | Qué contiene | Cuándo consultarlo |
|---|---|---|
| `00-constitution.md` | Principios no negociables del proyecto (paridad funcional, campos inmutables, seguridad, Strangler Fig) | Antes de cualquier tarea, como contexto fijo para OpenCode |
| `01-spec-direcciones-fiscales.md` | Historias de usuario HU-01 a HU-06, criterios de aceptación, decisiones de negocio ya resueltas | Al implementar cualquier funcionalidad — define el QUÉ |
| `02-plan-tecnico.md` | Arquitectura de microservicios, modelo de datos, mapeo a columnas reales, contrato OpenAPI, árbol de componentes React | Al diseñar o generar código — define el CÓMO |
| `03-tasks-opencode.md` | Tareas atómicas por fase, listas para ejecutar con OpenCode | Al pedirle a OpenCode que implemente algo puntual |
| `04-esquema-datos-postgres.sql` | DDL real de `direccif`, `carga_interfaz` y catálogos, ya instalado en Postgres local | Al tocar persistencia o levantar el entorno |
| `docker-compose.yml` | Postgres + pgAdmin 4 para desarrollo local | Al levantar el entorno de base de datos |

## 2. Estructura de carpetas del repositorio

```
/
├── 00-constitution.md
├── 01-spec-direcciones-fiscales.md
├── 02-plan-tecnico.md
├── 03-tasks-opencode.md
├── 04-esquema-datos-postgres.sql
├── docker-compose.yml
├── project-map.md                     ← este archivo
│
├── frontend/                          # React 18 + TypeScript + Storybook
│   └── src/features/direcciones-fiscales/
│       ├── api/                       # clientes HTTP (fideicomisos, direcciones, cif)
│       ├── components/
│       │   ├── BusquedaCriteriosForm/     (HU-01)
│       │   ├── DomiciliosGrid/             (HU-01)
│       │   ├── DomicilioModal/             (HU-02/03/04/05)
│       │   ├── DomicilioForm/              (HU-02/03/04/05)
│       │   ├── DomiciliosHeredablesGrid/    (HU-03)
│       │   └── CifUploader/                (HU-04)
│       ├── hooks/                     # useDireccionesFiscales, useCifUpload
│       ├── types/                     # DomicilioFiscal y afines
│       └── DireccionesFiscalesPage.tsx
│
└── services/                          # Spring Boot 3.5 / Java 17
    ├── ms-direcciones-fiscales/        # Dominio principal — HU-01,02,03,05 (dueño de `direccif`)
    ├── ms-fideicomisos-adapter/        # Solo lectura — RFC/Nombre/Fideicomiso (anti-corruption layer)
    ├── ms-cif-procesamiento/           # Extracción de datos del PDF del SAT — HU-04
    └── ms-carga-masiva/                # Importación por Layout — HU-06 (usa `carga_interfaz`)
```

## 3. Cómo se relacionan los servicios (vista rápida)

```
                     ┌────────────────────┐
                     │   React SPA (BFF    │
                     │   opcional delante) │
                     └─────────┬──────────┘
                               │
        ┌──────────────────────┼───────────────────────┬─────────────────┐
        ▼                      ▼                       ▼                 ▼
ms-fideicomisos-adapter  ms-direcciones-fiscales  ms-cif-procesamiento  ms-carga-masiva
   (solo lectura)          (dueño de `direccif`)     (lee PDF SAT)      (layout .tsv)
        │                      │                                          │
        └──────────────┬───────┴──────────────────────────────────────────┘
                        ▼
                  Postgres local
             (direccif, carga_interfaz,
              catalogo_pais, catalogo_estado)
```

- `ms-direcciones-fiscales` es el único dueño de la tabla `direccif` y de
  toda la validación de negocio (unicidad, integridad con catálogos —
  ver `02-plan-tecnico.md` §3.5, ya que `direccif` no tiene PK/UNIQUE/FK
  físicos).
- `ms-cif-procesamiento` y `ms-carga-masiva` **no escriben directo** en
  `direccif`; idealmente invocan la lógica de `ms-direcciones-fiscales`
  (o su misma capa de validación) para no duplicar reglas.
- `ms-fideicomisos-adapter` es de solo lectura y no toca `direccif` en
  absoluto.

## 4. Estado del laboratorio (para retomar rápido)

- ✅ Requerimientos de negocio (HU-01 a HU-06) — resueltos al 100%.
- ✅ Esquema de datos (`direccif`, `carga_interfaz`) — instalado y
  visualizable en pgAdmin 4.
- ✅ Repositorio creado y subido.
- ⏳ Pendiente: scaffolding de los 4 microservicios + frontend (Fase 0 de
  `03-tasks-opencode.md`).
- ⏳ Decisión abierta sin resolver: catálogo institucional de CP tipo
  SEPOMEX (`02-plan-tecnico.md` §3.6) — mejora propuesta, no bloqueante.

## 5. Cómo navegar este repo si eres nuevo (o eres OpenCode)
1. Lee `00-constitution.md` — reglas que no se rompen.
2. Lee este `project-map.md` — para saber dónde está cada cosa.
3. Ve a `01-spec-direcciones-fiscales.md` para la HU específica que vas
   a trabajar.
4. Ve a `02-plan-tecnico.md` para el contrato técnico de esa HU.
5. Ejecuta la tarea correspondiente de `03-tasks-opencode.md`.
