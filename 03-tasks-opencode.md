# Tasks — para ejecutar con OpenCode

> Convención: pásale a OpenCode un bloque de tareas a la vez, junto con
> `00-constitution.md` + el archivo de spec/plan correspondiente como
> contexto. Marca cada casilla al terminar y revisar (código + pruebas).

## Fase 0 — Andamiaje (Scaffolding)
- [ ] Levantar Postgres local (Docker) y ejecutar
      `04-esquema-datos-postgres.sql` (tablas `direccif`, `carga_interfaz`,
      catálogos `catalogo_pais`/`catalogo_estado`).
- [ ] Crear repo/monorepo con carpetas: `frontend/`, `services/ms-direcciones-fiscales/`,
      `services/ms-fideicomisos-adapter/`, `services/ms-cif-procesamiento/`,
      `services/ms-carga-masiva/`.
- [ ] Frontend: inicializar Vite + React + TypeScript + Storybook.
- [ ] Backend: generar cada microservicio con Spring Initializr
      (Web, Validation, JPA, Actuator, Lombok) Java 17, Spring Boot 4.1.
- [ ] Configurar linter/formatter (ESLint+Prettier, Spotless/Checkstyle).

**Prompt sugerido para OpenCode:**
"Usando `02-plan-tecnico.md` §1 y §2, crea el scaffolding de los 3
microservicios Spring Boot 4.1 (Java 17) y el proyecto React+TS+Storybook
descrito, sin implementar lógica de negocio aún, solo estructura de
carpetas, dependencias y health-check."

## Fase 1 — `ms-fideicomisos-adapter` (el más simple, sin escritura)
- [ ] Modelo `FideicomisoDTO` — lee `CONTRATO` (`cto_num_contrato`,
      `cto_nom_contrato`).
- [ ] Estrategia de resolución de RFC por tipo de participante: mapear
      `FIDEICOMITENTE → FIDEICOM (fid_rfc)`,
      `FIDEICOMISARIO → BENEFICI (ben_rfc)`,
      `TERCERO → TERCEROS (ter_rfc)`. Estas 3 tablas tienen columnas
      **similares pero no idénticas** — no usar una consulta genérica,
      usar 3 repositorios/queries específicos o un patrón Strategy.
- [ ] Endpoint `GET /api/v1/fideicomisos/{numContrato}`.
- [ ] Endpoint `GET /api/v1/fideicomisos/{numContrato}/participantes/{tipoParticipante}/{numParticipante}/rfc`.
- [x] Endpoint `GET /api/v1/fideicomisos/{numContrato}/domicilios-heredables`
      — lee `DIRECCI` (**distinta** de `DIRECCIF`) para HU-03.
- [x] ~~Bug del `@EmbeddedId`~~ **Descartado (15 jul 2026)**: se investigó
      un caso de datos aparentemente duplicados con 2 domicilios de
      prueba para el mismo participante. Se confirmó con negocio que
      `DIRECCI` permite **un solo** domicilio por Fideicomiso+Tipo de
      Participante+No. Participante — el dato de prueba (segunda
      secuencia) era inválido, ya se eliminó. El `@EmbeddedId` original
      de 3 campos es correcto, no requiere cambios.
- [x] ~~Endpoint `GET /api/v1/fideicomisos?criterio=`~~ **ELIMINADO
      (15 jul 2026)**: era redundante con `GET
      /api/v1/fideicomisos/{numContrato}` — todas las búsquedas reales
      son por llave exacta (No. de Fideicomiso), no por nombre libre.
      Se retiró el endpoint, su lógica de búsqueda y sus pruebas
      asociadas.
- [ ] Todas las consultas son de **solo lectura** — nunca INSERT/UPDATE
      contra `CONTRATO`/`FIDEICOM`/`BENEFICI`/`TERCEROS`/`DIRECCI`.
- [ ] Pruebas de integración con los datos semilla de
      `04-esquema-datos-postgres.sql` (o datos mock si aún no hay semilla
      cargada para estas 5 tablas).

## Fase 2 — `ms-direcciones-fiscales` (dominio principal)
- [ ] Entidad `DomicilioFiscal` (JPA) según §3 del plan — llave natural
      compuesta (`@IdClass`/`@EmbeddedId` sobre Fideicomiso+Participante+
      No.Participante), **sin PK/UNIQUE/FK físicos** en `direccif`
      (confirmado con negocio, ver §3.5 y §3.7 del plan).
- [ ] Validaciones de negocio: obligatorios, formato de CP, catálogo de
      estado/municipio si aplica.
- [ ] Endpoints CRUD de §2.1.
- [ ] Endpoint `heredables` para HU-03.
- [ ] Reglas: RFC/Fideicomiso/Nombre nunca se escriben desde este servicio
      (vienen de `ms-fideicomisos-adapter`, se guardan como referencia).
- [ ] Pruebas unitarias de validación + pruebas de integración de los
      endpoints (Given/When/Then de HU-01, HU-02, HU-05).

## Fase 3 — `ms-cif-procesamiento`
- [ ] Endpoint `POST /api/v1/cif/procesar` (multipart).
- [ ] Validación de archivo (tipo, tamaño, corrupción).
- [ ] Integración con el motor de extracción real (definir según pregunta
      abierta #3) o, si aún no existe, un adaptador/interfaz
      `CifExtractor` con una implementación mock para poder avanzar en
      paralelo con el resto del laboratorio.
- [ ] Pruebas de HU-04 (éxito, PDF ilegible, PDF no es CIF).

## Fase 3.5 — `ms-carga-masiva` (HU-06)
- [ ] Parser de archivo delimitado por tabulador (columna 1 = consecutivo
      de renglón, resto = campos de `direccif` en el orden de §2 del plan
      — **validar orden real del layout antes de codificar**).
- [ ] Por cada línea: insertar registro de control en `carga_interfaz`
      con los valores fijos/derivados definidos en `01-spec` HU-06.
- [ ] Reutilizar validación de negocio de `ms-direcciones-fiscales`
      (obligatorios, CP, unicidad Fideicomiso+Participante+No.Participante)
      antes de insertar/actualizar en `direccif`.
- [ ] `carga_interfaz` es solo bitácora/tabla de paso (estatus fijo "A",
      sin máquina de estados); el detalle de error de cada línea va en
      `carint_mensaje`, y el procesamiento continúa con el resto del
      archivo aunque una línea falle.
- [ ] Comportamiento **upsert**: si Fideicomiso+Participante+No.Participante
      ya existe en `direccif`, se actualiza/reemplaza en vez de rechazarse.
- [ ] Pruebas: archivo 100% válido, archivo con líneas mixtas
      válidas/inválidas (confirmar si continúa o aborta todo el lote).

## Fase 4 — BFF / Gateway (opcional pero recomendado)
- [ ] Endpoint agregador que arma la respuesta que necesita el modal
      (Fideicomiso + domicilio + heredables) en una sola llamada.

## Fase 5 — Frontend: componentes base (Storybook primero)
- [ ] `BusquedaCriteriosForm` + historia con validación "al menos un
      criterio" (HU-01).
- [ ] `DomiciliosGrid` + historias: vacío/cargando/con datos/error.
- [ ] `DomicilioForm` + historias: readonly (RFC/Fideicomiso/Nombre),
      editable, con banner de "cargado desde CIF".
- [ ] `CifUploader` + historias: idle/subiendo/procesando/éxito/error.
- [ ] `DomiciliosHeredablesGrid` + historia (HU-03).
- [ ] `CargaMasivaUploader` + `CargaMasivaResultadoTabla` — componente
      que muestra el resultado de `POST /api/v1/carga-masiva/...`
      (`lineas[]`), listando **cada línea con error junto a su
      `carint_mensaje`** (no solo el conteo agregado exitosas/con error)
      — requerimiento confirmado con negocio (HU-06): el operador
      necesita saber qué línea corregir y por qué. Historias: sin
      errores (todo exitoso), con errores mixtos, todos con error.

## Fase 6 — Frontend: integración
- [ ] Hooks `useDireccionesFiscales`, `useCifUpload` con React Query.
- [ ] `DomicilioModal` orquestando: apertura desde grid, herencia,
      carga por CIF, guardado.
- [ ] `DireccionesFiscalesPage` integrando búsqueda + grid + modal.
- [ ] Validación cliente con `zod`, espejo de las reglas del backend.

## Fase 7 — Pruebas end-to-end y cierre de brecha
- [ ] E2E (Playwright/Cypress) cubriendo HU-01 a HU-05 completas.
- [ ] Checklist de paridad funcional vs. pantalla JSF original.
- [ ] Documentar decisiones tomadas sobre las preguntas abiertas de
      `01-spec-direcciones-fiscales.md` §5.

## Recordatorio para cada tarea
Al pedirle a OpenCode que implemente algo, dale explícitamente:
1. La historia de usuario / sección del plan involucrada.
2. Los criterios de aceptación (para que genere pruebas junto al código).
3. La restricción de `00-constitution.md` que aplique (ej. inmutabilidad
   de campos heredados, trazabilidad del origen).
