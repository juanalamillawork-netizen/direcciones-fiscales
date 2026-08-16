# Constitution — Migración "Direcciones Fiscales"

## Contexto
Migración de la pantalla **Direcciones Fiscales** de una aplicación monolítica
(Java 8 + JSF/PrimeFaces 3.5) hacia una arquitectura moderna desacoplada:

- **Frontend**: React 18 + TypeScript + Storybook (biblioteca de componentes documentada)
- **Backend**: Microservicios con Spring Boot 4.1 (Java 17+, Spring Framework 7)
- **Metodología**: Spec Driven Development (SDD)
- **Agente de implementación**: OpenCode

## Principios no negociables

1. **Paridad funcional primero.** No se agregan ni se quitan reglas de negocio
   de la pantalla original salvo que se documenten explícitamente como cambio.
2. **Contratos antes que código.** Ningún endpoint ni componente se implementa
   sin que exista antes su contrato (OpenAPI / props de componente) en `/plan`.
3. **Componentes aislados y documentados en Storybook.** Cada componente de
   UI (grid de búsqueda, modal de captura, uploader de CIF, etc.) debe tener
   su historia (`.stories.tsx`) con los estados: vacío, cargando, con datos,
   error, solo lectura.
4. **Microservicios con responsabilidad única.** No se crea "un monolito
   disfrazado de microservicio". Ver límites de contexto en `02-plan-tecnico.md`.
5. **Seguridad de datos fiscales.** RFC, CIF y PDFs adjuntos son datos
   sensibles: toda comunicación va cifrada (TLS), el PDF se valida
   (tipo MIME, tamaño, escaneo) antes de procesarse, y el acceso se audita
   (quién consultó/capturó qué domicilio y cuándo).
6. **Inmutabilidad de campos heredados.** RFC, FIDEICOMISO y Nombre de
   Fideicomiso son de solo lectura en el formulario de captura porque
   provienen de una fuente maestra (no se re-implementa su edición).
7. **Trazabilidad del origen del dato.** Todo domicilio capturado debe
   registrar su origen: `MANUAL`, `HEREDADO_GRID`, `CIF_PDF`. Esto es
   nuevo como metadato técnico (no cambia la UX) para permitir auditoría
   y facilitar la migración incremental (strangler fig).
8. **Sin regresiones silenciosas.** Cada historia de usuario en `01-spec`
   debe tener criterios de aceptación verificables (Given/When/Then) que
   OpenCode usará para generar pruebas antes/junto con el código.
9. **Migración incremental (Strangler Fig).** El monolito sigue vivo durante
   la transición; el nuevo microservicio de Direcciones Fiscales consulta/
   escribe contra la misma base de datos (o vía sincronización) hasta que
   se apague el módulo JSF equivalente.

## Fuera de alcance (por ahora)
- Rediseño de la fuente maestra de Fideicomisos (se consume vía API existente
  o un microservicio "adapter" de solo lectura).
- Cambios al proceso de firma o validación fiscal del CIF ante el SAT.
- Internacionalización (la pantalla es solo para México).

## Cómo se usa este set de documentos con OpenCode
1. `00-constitution.md` → se carga siempre como contexto/reglas del proyecto.
2. `01-spec-direcciones-fiscales.md` → define QUÉ se construye (negocio).
3. `02-plan-tecnico.md` → define CÓMO se construye (arquitectura, contratos).
4. `03-tasks-opencode.md` → lista de tareas atómicas, en orden, listas para
   pasarle a OpenCode una por una (o por fase).

## Nota de actualización (15 jul 2026)
El plan original especificaba Spring Boot 3.5. Esa rama llegó a su fin
de vida (EOL) el 30 de junio de 2026, y `start.spring.io` ya no la genera
(rango de compatibilidad actual: `>=4.0.0`). Se actualizó el laboratorio
a **Spring Boot 4.1** (versión recomendada para proyectos nuevos, basada
en Spring Framework 7). Este cambio afecta principalmente: nombres de
starters, Jackson 3 en vez de Jackson 2, y algunos cambios de testing —
sin impacto en las decisiones de negocio ya resueltas en `01-spec`.
