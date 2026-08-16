# ms-fideicomisos-adapter

Microservicio de solo lectura (anti-corruption layer) que expone datos de la fuente maestra de Fideicomisos.

---

## Entidades JPA (5 + 4 llaves embedidas)

| Archivo | Tabla | Llave |
|---|---|---|
| `entity/Contrato.java` | `contrato` | `@Id Integer ctoNumContrato` |
| `entity/Fideicom.java` + `FideicomId.java` | `fideicom` | `@EmbeddedId` (`fid_num_contrato`, `fid_fideicomitente`) |
| `entity/Benefici.java` + `BeneficiId.java` | `benefici` | `@EmbeddedId` (`ben_num_contrato`, `ben_beneficiario`) |
| `entity/Terceros.java` + `TercerosId.java` | `terceros` | `@EmbeddedId` (`ter_num_contrato`, `ter_num_tercero`) |
| `entity/Direcci.java` + `DirecciId.java` | `direcci` | `@EmbeddedId` (`dir_num_contrato`, `dir_cve_pers_fid`, `dir_num_pers_fid`) |

Todas usan `@Immutable` — Hibernate nunca genera INSERT/UPDATE/DELETE.

## Repositorios

| Repositorio | Métodos |
|---|---|
| `ContratoRepository` | `findById(id)`, `buscarPorCriterio(criterio, numContrato)` con `@Query` JPQL |
| `FideicomRepository` | `findById(FideicomId)` |
| `BeneficiRepository` | `findById(BeneficiId)` |
| `TercerosRepository` | `findById(TercerosId)` |
| `DirecciRepository` | `findByContratoYParticipante(numContrato, cvePersFid, numPersFid)` con `@Query` JPQL |

Todos extienden `Repository` (solo lectura).

## RfcResolverStrategy (Strategy Pattern)

- `service/RfcResolverStrategy.java` — `@FunctionalInterface`: `String resolve(numContrato, numParticipante)`
- `service/resolver/FideicomRfcResolver.java` — consulta `fideicom`, RFC en `fid_rfc`
- `service/resolver/BeneficiRfcResolver.java` — consulta `benefici`, RFC en `ben_rfc`
- `service/resolver/TercerosRfcResolver.java` — consulta `terceros`, RFC en `ter_rfc`
- `service/RfcResolverService.java` — mapa `FIDEICOMITENTE/FIDEICOMISARIO/TERCERO → resolver`

## Endpoints REST

| Endpoint | Respuesta |
|---|---|
| `GET /api/v1/fideicomisos/{numContrato}` | `200` `{numContrato, nombre}` / `404` |
| `GET /api/v1/fideicomisos/{numContrato}/participantes/{tipo}/{num}/rfc` | `200` `{rfc}` / `404` |
| `GET /api/v1/fideicomisos/{numContrato}/domicilios-heredables?tipoParticipante=&numParticipante=` | `200` `[{...}]` |
| `GET /api/v1/fideicomisos?criterio=` | `200` `[{numContrato, nombre}]` |

## Pruebas de integración (10 tests)

`FideicomisoIntegrationTest.java` con `@SpringBootTest(MOCK)` + `@AutoConfigureMockMvc`.

Datos semilla en `src/test/resources/fideicomisos-test-data.sql`:
- Contratos: `1234567890` ("Fideicomiso Test Uno"), `555555555` ("Fideicomiso Test Dos")
- Fideicomitente 1: RFC `FID123456XXX`
- Beneficiario 1: RFC `BEN123456XXX`
- Tercero 1: RFC `TER123456XXX`
- Domicilio heredable para FIDEICOMITENTE 1 del contrato 1234567890

Tests:
1. `getFideicomiso_returns200_whenExists` — verifica `numContrato` + `nombre`
2. `getFideicomiso_returns404_whenNotFound` — 999999999
3. `getRfcParticipante_returns200_forFideicomitente` — RFC `FID123456XXX`
4. `getRfcParticipante_returns200_forBeneficiario` — RFC `BEN123456XXX`
5. `getRfcParticipante_returns200_forTercero` — RFC `TER123456XXX`
6. `getRfcParticipante_returns404_whenNotFound` — participante 99
7. `getDomiciliosHeredables_returnsList` — 1 domicilio
8. `getDomiciliosHeredables_returnsEmpty_whenNoMatch` — TERCERO sin domicilios
9. `buscarFideicomisos_returnsResults_byNumContrato` — criterio "1234567890"
10. `buscarFideicomisos_returnsResults_byNombre` — criterio "Test Dos"
11. `buscarFideicomisos_returnsEmpty_whenNoMatch` — criterio "NOEXISTE"

## Compilación

```bash
./mvnw compile          # código principal
./mvnw test-compile     # con tests
```
