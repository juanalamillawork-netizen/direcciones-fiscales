# Migración Direcciones Fiscales — Mapa de Servicios y Endpoints

> Migración de la pantalla **Direcciones Fiscales** (Java 8 + JSF/PrimeFaces 3.5 monolítico) a **React 18 + TypeScript + Storybook** (frontend) y **microservicios con Spring Boot 4.1** (backend), usando Spec Driven Development y OpenCode como agente de implementación.

---

## 1. Tabla de servicios

| Servicio | URL Base | Puerto | Propósito |
|---|---|---|---|
| **ms-direcciones-fiscales** | `http://localhost:8081` | 8081 | Dominio principal — dueño de la tabla `direccif`. Gestiona el CRUD de domicilios fiscales (alta, edición, consulta) y toda la validación de negocio (unicidad Fideicomiso+Participante+No. Participante, integridad con catálogos). Cubre HU-01, 02, 03 (parcial) y 05. |
| **ms-fideicomisos-adapter** | `http://localhost:8082` | 8082 | Anti-corruption layer de **solo lectura**. Expone Nombre del Fideicomiso (`contrato`), RFC por tipo de participante (`fideicom`/`benefici`/`terceros`), y domicilios heredables (`direcci`) para HU-03. El `?criterio=` es solo apoyo/enriquecimiento, no la búsqueda principal. |
| **ms-cif-procesamiento** | `http://localhost:8083` | 8083 | Recibe el PDF de la Cédula de Identificación Fiscal (CIF) emitido por el SAT, lo valida y extrae los datos del domicilio fiscal para precargar el formulario (HU-04). No persiste directamente en `direccif`. |
| **ms-carga-masiva** | `http://localhost:8084` | 8084 | Procesa el archivo de layout (delimitado por tabulador) del botón "Importar" (HU-06). Inserta bitácora de control por línea en `carga_interfaz` y hace upsert en `direccif`, continuando aunque una línea falle. |
| **frontend** | `http://localhost:5173` *(default de Vite)* | 5173 | React 18 + TypeScript + Storybook. Interfaz de la pantalla Direcciones Fiscales — consulta, modal de captura, grid de heredables, uploader de CIF. |
| **Postgres (laboratorio)** | `localhost:5433` | 5433 | Base de datos local. Contiene tanto las tablas legadas de solo lectura (`contrato`, `fideicom`, `benefici`, `terceros`, `direcci`) como las propias del proyecto (`direccif`, `carga_interfaz`, catálogos). |

---

## 2. Endpoints por servicio

### ✅ `ms-fideicomisos-adapter` — Implementado y probado

| Método | Endpoint | Propósito |
|---|---|---|
| GET | `/api/v1/fideicomisos/{numContrato}` | Nombre del Fideicomiso |
| GET | `/api/v1/fideicomisos/{numContrato}/participantes/{tipo}/{num}/rfc` | RFC del participante |
| GET | `/api/v1/fideicomisos/{numContrato}/domicilios-heredables?tipoParticipante=&numParticipante=` | Domicilios heredables (HU-03) |
| GET | `/actuator/health` | Verificación de salud del servicio |

> **Nota**: se eliminó el endpoint `?criterio=` que existía en una
> versión anterior — era redundante con la búsqueda por llave exacta
> (`/fideicomisos/{numContrato}`), ya que HU-01 nunca requirió búsqueda
> libre por nombre.

### ⏳ `ms-direcciones-fiscales` — Planeado

| Método | Endpoint | Propósito | HU relacionada |
|---|---|---|---|
| GET | `/api/v1/direcciones-fiscales?fideicomisoId=&tipoPersona=` | Búsqueda principal de domicilios (criterios: No. Fideicomiso, Tipo de Participante) | HU-01 |
| GET | `/api/v1/direcciones-fiscales/{id}` | Detalle de un domicilio específico | HU-01 |
| POST | `/api/v1/direcciones-fiscales` | Alta de domicilio (manual, heredado o desde CIF) | HU-02/03/04 |
| PUT | `/api/v1/direcciones-fiscales/{id}` | Edición de domicilio existente | HU-05 |
| GET | `/api/v1/direcciones-fiscales/heredables?fideicomisoId=&tipoPersona=` | Alimenta el grid de heredables del modal (llama internamente a `ms-fideicomisos-adapter`) | HU-03 |

### ⏳ `ms-cif-procesamiento` — Planeado

| Método | Endpoint | Propósito | HU relacionada |
|---|---|---|---|
| POST | `/api/v1/cif/procesar` | Recibe el PDF (multipart), valida y extrae datos del domicilio fiscal | HU-04 |

Respuesta esperada:
```json
{
  "calle": "string",
  "numeroExterior": "string",
  "numeroInterior": "string",
  "colonia": "string",
  "cp": "string",
  "municipio": "string",
  "estado": "string",
  "pais": "string",
  "confianzaExtraccion": "number",
  "advertencias": ["string"]
}
```

### ⏳ `ms-carga-masiva` — Planeado

| Método | Endpoint | Propósito | HU relacionada |
|---|---|---|---|
| POST | `/api/v1/carga-masiva/direcciones-fiscales` | Recibe el archivo de layout (tabulador), procesa línea por línea con upsert en `direccif` | HU-06 |
| GET | `/api/v1/carga-masiva/{loteId}/detalle` | Consulta del detalle de una carga (registros de `carga_interfaz`) | HU-06 |

---

## 3. Estado del laboratorio (checklist rápido)

- [x] Requerimientos de negocio (HU-01 a HU-06) — resueltos al 100%
- [x] Esquema de datos completo en Postgres (9 tablas)
- [x] Fase 0 — Scaffolding de los 4 microservicios + frontend
- [x] Fase 1 — `ms-fideicomisos-adapter` implementado y probado
- [ ] Fase 2 — `ms-direcciones-fiscales` (dominio principal)
- [ ] Fase 3 — `ms-cif-procesamiento`
- [ ] Fase 3.5 — `ms-carga-masiva`
- [ ] Fase 4 — BFF/Gateway (opcional)
- [ ] Fase 5-6 — Frontend (Storybook + integración)
- [ ] Fase 7 — Pruebas E2E

---

## 4. Documentos fuente del proyecto

| Documento | Contenido |
|---|---|
| `00-constitution.md` | Principios no negociables del proyecto |
| `01-spec-direcciones-fiscales.md` | Historias de usuario HU-01 a HU-06, criterios de aceptación |
| `02-plan-tecnico.md` | Arquitectura, modelo de datos, contratos OpenAPI |
| `03-tasks-opencode.md` | Tareas atómicas por fase para OpenCode |
| `04-esquema-datos-postgres.sql` | DDL completo (9 tablas) |
| `05-datos-semilla-laboratorio.sql` | Datos de prueba |
| `project-map.md` | Mapa de navegación del repositorio |
