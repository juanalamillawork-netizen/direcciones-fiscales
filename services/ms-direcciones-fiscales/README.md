## Metodología de desarrollo

El desarrollo del microservicio se realizó utilizando la metodología **Spec-Driven
Development (SDD)**.

Bajo este enfoque, las especificaciones funcionales y técnicas se utilizan como
fuente de referencia para definir el comportamiento esperado del sistema antes
de implementar los componentes de software.

El objetivo principal es modernizar la capa de aplicación manteniendo la
compatibilidad con el modelo de datos existente.


El flujo de trabajo utilizado contempla:

1. Definición de la especificación.
2. Análisis y validación de reglas de negocio.
3. Definición del contrato de la API.
4. Diseño de entidades, DTOs y componentes.
5. Implementación del microservicio.
6. Desarrollo de pruebas para validar el comportamiento especificado.
7. Validación de la implementación contra la especificación.

Este enfoque permitió mantener trazabilidad entre los requerimientos, el diseño,
la implementación y las pruebas, particularmente importante al tratarse de una
migración de un sistema legado donde el modelo de datos debe conservarse sin
realizar una reingeniería de la estructura existente.


## Información del proyecto
|----------------|-------------------------------------|
| Característica | Detalle |
|----------------|-------------------------------------|
| Tipo           | Microservicio REST                  |
| Dominio        | Direcciones fiscales                |
| Lenguaje       | Java 17                             |
| Framework      | Spring Boot 4.1                     |
| Persistencia   | Spring Data JPA / Hibernate         |
| Base de datos  | PostgreSQL                          |
| Plataforma BD  | Neon                                |
| Arquitectura   | Microservicios                      |
| Metodología    | Spec-Driven Development (SDD)       |
| Origen         | Migración de aplicación monolítica  |
|----------------|-------------------------------------|
## Entidad JPA

| Archivo | Tabla | Llave |
|---|---|---|
| `entity/DomicilioFiscal.java` | `direccif` | `@EmbeddedId` |
| `entity/DomicilioFiscalId.java` | — | `dif_num_contrato` (String) + `dif_cve_pers` (String) + `dif_num_pers_fid` (String) |

**Reglas de mapeo:**
- Sin PK/UNIQUE/FK físicos (la tabla no admite cambios estructurales)
- `dif_num_pais` y `dif_num_estado` como `Integer` (FK lógica, sin FK física)
- `correoElectronico` no existe en la entidad (defecto legado replicado: el backend nunca lo persiste)

## Repositorio (solo lectura)

`DomicilioFiscalRepository.java` — extiende `Repository`:
- `findById(DomicilioFiscalId)` → `Optional<DomicilioFiscal>`
- `buscarPorCriterios(fideicomisoId, tipoPersona)` con `@Query` JPQL — ambos parámetros opcionales (manejados con `IS NULL`)

## Endpoints REST

| Endpoint | Parámetros | Validación | Respuesta |
|---|---|---|---|
| `GET /api/v1/direcciones-fiscales` | `fideicomisoId` (opcional), `tipoPersona` (opcional) | 400 si ambos vacíos | `200` `[{...}]` |
| `GET /api/v1/direcciones-fiscales/{numContrato}/{cvePers}/{numPersFid}` | path: numContrato, cvePers, numPersFid | — | `200` `{...}` / `404` |

## DTO

`DomicilioFiscalDTO` — record con todos los campos de negocio + método `fromEntity()`.

## Pruebas de integración (7 tests)

`DireccionesFiscalesIntegrationTest.java` con `@SpringBootTest(MOCK)` + `@AutoConfigureMockMvc`.

Datos semilla en `test/resources/direcciones-test-data.sql` (3 registros):
- `1234567890 / FIDEICOMITENTE / 1` — "Calle Principal 123", CP 06600
- `1234567890 / FIDEICOMISARIO / 1` — "Avenida Reforma 456", CP 06600
- `555555555 / FIDEICOMITENTE / 1` — "Boulevard Principal 789", CP 66220

Tests:
1. `buscar_returns400_whenNoCriteria` — sin parámetros → 400 Bad Request
2. `buscar_returnsResults_byFideicomisoId` — "1234567890" → 2 resultados
3. `buscar_returnsResults_byTipoPersona` — "FIDEICOMITENTE" → 2 resultados
4. `buscar_returnsResults_byBoth` — "1234567890" + "FIDEICOMITENTE" → 1 resultado
5. `buscar_returnsEmpty_whenNoMatch` — "999999999" → lista vacía
6. `detalle_returns200_whenExists` — llave completa → 200 con campos
7. `detalle_returns404_whenNotFound` — llave inexistente → 404

### Modelo de datos legado

El modelo de datos utilizado por el sistema es heredado y no forma parte de una
reingeniería.

Por esta razón, la estructura de las tablas se conserva y el microservicio se
adapta al modelo existente.

La migración de DB2 hacia PostgreSQL corresponde a una decisión de infraestructura
para este proyecto. El modelo lógico de datos se mantiene sin modificaciones
estructurales.

```text
Aplicación monolítica
Java 8 + JSF + PrimeFaces 3.5
             |
             | Migración tecnológica
             v
      Java 17 + Spring Boot 4.1
             |
             v
       Microservicios REST
             |
             v
       PostgreSQL / Neon
             |
             v
       Modelo de datos legado

## Compilación

```bash
./mvnw compile          # código principal
./mvnw test-compile     # con tests
```
