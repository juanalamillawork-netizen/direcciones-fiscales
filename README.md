# Laboratorio SDD — Migración "Direcciones Fiscales"

Este set de documentos implementa Spec Driven Development para migrar la
pantalla **Direcciones Fiscales** de Java 8 + JSF/PrimeFaces 3.5 a
**React + TypeScript + Storybook** (frontend) y **Spring Boot 3.5
microservicios** (backend), usando **OpenCode** como agente de
implementación.

## Archivos
1. `00-constitution.md` — Principios y restricciones no negociables.
2. `01-spec-direcciones-fiscales.md` — Qué se construye (historias de
   usuario, criterios de aceptación, preguntas abiertas).
3. `02-plan-tecnico.md` — Cómo se construye (microservicios, modelo de
   datos, contratos OpenAPI, árbol de componentes React).
4. `03-tasks-opencode.md` — Tareas atómicas, en fases, listas para
   ejecutar con OpenCode.

## Flujo de trabajo sugerido
```
1. Resolver (o marcar como supuesto) las preguntas abiertas de 01-spec §5
2. cargar 00-constitution + 01-spec + 02-plan como contexto a OpenCode
3. ejecutar Fase 0 (scaffolding) de 03-tasks
4. por cada fase siguiente:
     a. dar a OpenCode: spec de la HU + sección del plan + restricción aplicable
     b. OpenCode genera código + pruebas
     c. revisar contra criterios de aceptación (Given/When/Then)
     d. marcar la casilla en 03-tasks y avanzar
```

## Por qué este orden
- Empezar por `ms-fideicomisos-adapter` (Fase 1) es de bajo riesgo: es
  solo lectura y desbloquea todo lo demás (RFC/Nombre/Fideicomiso).
- `ms-direcciones-fiscales` (Fase 2) es el corazón del dominio: conviene
  tenerlo sólido con pruebas antes de conectar CIF o frontend.
- El `CifExtractor` mockeado (Fase 3) permite avanzar el laboratorio sin
  bloquear por la integración real de extracción del PDF.
- Storybook primero en el frontend (Fase 5) obliga a definir bien los
  estados de cada componente antes de la integración (Fase 6), evitando
  que la lógica de negocio quede enterrada en un solo componente gigante,
  como probablemente ocurre hoy en el `.xhtml` monolítico.

## Siguiente paso recomendado
Antes de correr Fase 0 con OpenCode, resuelve las 5 preguntas abiertas de
`01-spec-direcciones-fiscales.md` §5 — especialmente la del comportamiento
exacto de los campos heredados del grid (HU-03) y el mecanismo real de
extracción del CIF, ya que ambas cambian tareas concretas del plan.

## Pruebas E2E (Playwright)

La suite E2E (`frontend/e2e/*.spec.ts`, una por HU) corre contra los **4
microservicios reales** (sin mocks) y respeta los escenarios de
`20-fase7-pruebas-e2e-y-cierre.md` §1.2.

### Levantar el ambiente

1. **PostgreSQL** (puerto 5433, esquema + semilla inicial):
   ```sh
   cd direcciones-fiscales
   docker compose up -d
   # La primera vez el esquema (04) se aplica solo. Para reprocesar la BD:
   docker compose down -v && docker compose up -d
   ```
2. **Cargar los datos semilla** (una vez; idempotente si se corre sobre un
   esquema limpio):
   ```sh
   docker exec -i direcciones-fiscales-db psql -U labuser -d direcciones_fiscales \
     < 05-datos-semilla-laboratorio.sql
   docker exec -i direcciones-fiscales-db psql -U labuser -d direcciones_fiscales \
     < 16-seed-multiples-domicilios-heredables.sql
   docker exec -i direcciones-fiscales-db psql -U labuser -d direcciones_fiscales \
     < 19-seed-carga-masiva-pruebas-completas.sql
   ```
   Esto deja los Fideicomisos `1234567890`, `555555555` y `222222222` con sus
   participantes, domicilios heredables y catálogos. (Hay además seeds opcionales
   `12-*` y `service/ms-cif-procesamiento/src/test/resources/cif-test-data.sql`
   usados por pruebas unitarias de los servicios.)

3. **Levantar los 4 microservicios** (cada uno en su propia terminal):
   ```sh
   cd services/ms-fideicomisos-adapter && ./mvnw spring-boot:run   # 8082
   cd services/ms-direcciones-fiscales && ./mvnw spring-boot:run   # 8081
   cd services/ms-cif-procesamiento    && ./mvnw spring-boot:run   # 8083
   cd services/ms-carga-masiva         && ./mvnw spring-boot:run   # 8084
   ```
   > `ms-carga-masiva` llama a `ms-fideicomisos-adapter` en `8082` para
   > resolver RFC/nombre al procesar cada línea (ver `application.yml`).

4. **Frontend** (dev server en 5173) y **correr la suite**:
   ```sh
   cd frontend
   npm install          # instalado por primera vez
   npx playwright install chromium   # descarga del navegador (una vez)
   npm run dev                       # en otra terminal (o lo levanta solo Playwright)
   npm run test:e2e                  # suite completa
   npx playwright test e2e/hu-01-consulta.spec.ts   # un solo archivo
   npm run test:e2e:headed           # con navegador visible para depurar
   ```

### Notas
- Los tests PADENS usar la BD del laboratorio tal cual queda tras los seeds;
  los que requieren datos nuevos (`777777777` para paginación, altas,
  borrados) los crean y limpian solos vía API/DB.
- Los PDF de CIF de prueba son `ALEJANDRA DE LA TORRE VERDUZCO CSF.pdf` y
  `cedula fiscal Naturalfoods.pdf` (raíz del repo). El RFC del PDF debe
  coincidir con el participante validado (ej. `1234567890/FIDEICOMITENTE/3`).
- Los archivos `CargaMasiva_3_Exitosas.txt` y
  `CargaMasiva_4_Exitosas_3_Errores.txt` alimentan HU-06.
- `frontend/.env` no existe y no es necesario: el front usa los defaults
  (`localhost:8081…8084`). Puedes sobreescribirlos con `VITE_API_*` si decides
  mover los puertos.
- Ver shorthands con `npm run test:e2e:list` y typecheck de los specs con
  `npm run typecheck:e2e`.
