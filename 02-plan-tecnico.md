# Plan técnico — Direcciones Fiscales

## 1. Estrategia de migración
**Strangler Fig**: el nuevo stack convive con el monolito JSF. El
microservicio nuevo se conecta a la(s) misma(s) fuente(s) de datos (o via
eventos/sincronización) mientras se decide el corte del módulo legado.

```
[React SPA] ---> [BFF / API Gateway] ---> [ms-fideicomisos (adapter, RO)]
                                     ---> [ms-direcciones-fiscales]
                                     ---> [ms-cif-procesamiento]
                            (todos)  ---> [DB compartida / legado, fase 1]
```

## 2. Microservicios (Spring Boot 4.1 / Java 17+, Spring Framework 7)

### 2.1 `ms-direcciones-fiscales` (dueño del dominio)
Responsabilidad: CRUD de domicilios fiscales, orquesta el guardado sin
importar el origen (manual/heredado/CIF).
- `GET  /api/v1/direcciones-fiscales?fideicomisoId=&tipoPersona=&...`
- `GET  /api/v1/direcciones-fiscales/{id}`
- `POST /api/v1/direcciones-fiscales`
- `PUT  /api/v1/direcciones-fiscales/{id}`
- `DELETE /api/v1/direcciones-fiscales/{numContrato}/{cvePers}/{numPersFid}`
  — **agregado (2 ago 2026)**, acción "Baja" del modal. Confirmado con
  negocio: es un **DELETE físico** de la fila (no hay soft-delete, ya
  que `direccif` no tiene columna de estatus/activo — no se puede
  modificar la tabla real para agregar una).
- `GET  /api/v1/direcciones-fiscales/heredables?fideicomisoId=&tipoPersona=`
  (para el grid del modal, HU-03)

**Endpoints de catálogos — agregados (24 jul 2026)**, ya que
`ms-direcciones-fiscales` ya tiene acceso de lectura a `catalogo_pais`,
`catalogo_estado` y `catalogo_regimen_fiscal` (los usa para validar
alta/edición). Se exponen también hacia el frontend, para los combos de
`DomicilioForm` (País/Estado/Régimen Fiscal) y para resolver
nombre/descripción en `DomiciliosGrid`:
- `GET /api/v1/catalogos/paises` → `[{ id, nombre }]`
- `GET /api/v1/catalogos/estados?paisId=` → `[{ id, nombre, paisId }]`
  (filtrado en cascada por país)
- `GET /api/v1/catalogos/regimenes-fiscales?tipoPersona=FISICA|MORAL`
  → `[{ clave, descripcion }]` (filtrado por si aplica a persona física
  o moral, según `catalogo_regimen_fiscal`)

### 2.2 `ms-fideicomisos-adapter` (solo lectura, anti-corruption layer)
Responsabilidad: exponer RFC / Nombre / datos del Fideicomiso desde las
tablas legadas reales, sin duplicar su lógica de negocio. También expone
los domicilios heredables de `DIRECCI` para HU-03 (grid dentro del modal).

**Fuentes reales (confirmadas con negocio):**

| Dato | Tabla real | Campos clave |
|---|---|---|
| Nombre del Fideicomiso | `CONTRATO` | `cto_num_contrato`, `cto_nom_contrato` |
| RFC — tipo `FIDEICOMITENTE` | `FIDEICOM` | `fid_num_contrato`, `fid_fideicomitente`, `fid_rfc` |
| RFC — tipo `FIDEICOMISARIO` | `BENEFICI` (nombre histórico de tabla) | `ben_num_contrato`, `ben_beneficiario`, `ben_rfc` |
| RFC — tipo `TERCERO` | `TERCEROS` | `ter_num_contrato`, `ter_num_tercero`, `ter_rfc` |
| Domicilios heredables (HU-03) | `DIRECCI` (distinta de `DIRECCIF`, confirmado con negocio) | `dir_num_contrato`, `dir_cve_pers_fid`, `dir_num_pers_fid`, `dir_num_sec_direcc` |

> ⚠️ **REVERSIÓN CONFIRMADA (3 ago 2026)** — historial completo para no
> repetir el ciclo de confusión:
> 1. (15 jul 2026) Se probó con 2 domicilios de prueba para el mismo
>    participante (distinta secuencia); el endpoint regresó datos
>    aparentemente duplicados.
> 2. Se preguntó a negocio, quien inicialmente confirmó que **NO** era
>    un bug — que solo puede haber un domicilio por participante, y el
>    dato de prueba era inválido. Se ajustó `DirecciId` a una llave de
>    3 campos (sin `dir_num_sec_direcc`) y se eliminó el dato de prueba.
> 3. (3 ago 2026) Negocio **corrigió esa respuesta**: `DIRECCI` **sí
>    permite varios domicilios** por Fideicomiso+Tipo de Participante+
>    No. Participante — **para eso existe la columna
>    `dir_num_sec_direcc`** (ej. domicilio de casa, oficina, empresa,
>    cada uno con su propia secuencia).
> 4. **Decisión final**: `DirecciId` debe usar la llave compuesta de
>    **4 campos**, incluyendo `dir_num_sec_direcc`. El bug original de
>    "datos duplicados" del punto 1 **si era real** — hay que
>    revisar si sigue presente ahora que se vuelve a incluir el
>    secuencial en la llave (puede que el fix aplicado en su momento ya
>    no aplique correctamente tras este segundo cambio).

> ⚠️ **CORRECCIÓN IMPORTANTE (4 ago 2026) — trabajo innecesario
> detectado**: `ms-fideicomisos-adapter`/frontend implementaron una
> resolución de texto→ID contra catálogo para País/Estado al heredar,
> asumiendo que `DIRECCI` solo tenía `dir_nom_pais`/`dir_nom_estado`
> (texto). **Esto era innecesario**: el DDL real de `DIRECCI`
> **siempre tuvo** `dir_num_pais`/`dir_num_estado` (numéricos,
> `NOT NULL`) desde el catálogo original que compartió el usuario —
> se pasaron por alto. **Corrección**: el endpoint de domicilios
> heredables debe regresar directamente `dir_num_pais`/`dir_num_estado`
> (los IDs reales), y el frontend debe usarlos tal cual — **eliminar**
> la lógica de resolución por nombre/`unaccent` para este flujo, ya no
> se necesita.

**Mapeo completo y corregido de campos heredables (4 ago 2026):**

| Campo de `DIRECCI` | Campo del formulario | Notas |
|---|---|---|
| `dir_num_pais` | País (ID numérico) | Usar directo, **sin resolver texto** |
| `dir_num_estado` | Estado (ID numérico) | Usar directo, **sin resolver texto** |
| `dir_calle_num` | Calle + No. Exterior | **Requiere separar**: es un solo campo de texto que combina calle y número (ej. "AVENIDA DE LAS ROSAS 210"). Aplicar heurística: si el texto termina en un token numérico, separarlo como No. Exterior; el resto queda como Calle. Si no hay patrón claro, todo el texto va a Calle y No. Exterior queda vacío para que el usuario lo complete. |
| `dir_nom_colonia` | Colonia | |
| `dir_nom_poblacion` | Localidad | |
| `dir_nom_mun_alcaldia` | Municipio/Alcaldía | **Columna agregada (4 ago 2026)** — `DIRECCI` no la tenía, se corrigió el "mal diseño" agregándola |
| `dir_codigo_postal` | Código Postal | |
| `dir_nom_atencion` | **Nombre Legal** (visualización) | Se usa este campo de `DIRECCI` para poblar el texto de Nombre Legal al heredar |
| `dir_cve_tipo_domic` | (mostrar en acordeón) | Casa/Oficina/Empresa, identifica cada domicilio en la lista |

> La tabla de RFC a consultar se decide en tiempo de ejecución según el
> `Tipo de Participante` (`participante`) que traiga la solicitud —
> `FIDEICOMITENTE → FIDEICOM`, `FIDEICOMISARIO → BENEFICI`,
> `TERCERO → TERCEROS`. Las 3 tienen columnas *similares pero no
> idénticas* (confirmado con negocio), así que el adapter necesita un
> mapeo explícito por tipo, no una consulta genérica.

- `GET /api/v1/fideicomisos/{numContrato}` → `{ numContrato, nombre }`
  (lee `CONTRATO`)
- `GET /api/v1/fideicomisos/{numContrato}/participantes/{tipoParticipante}/{numParticipante}/rfc`
  → `{ rfc }` (lee `FIDEICOM`/`BENEFICI`/`TERCEROS` según `tipoParticipante`)
- `GET /api/v1/fideicomisos/{numContrato}/participantes/{tipoParticipante}/{numParticipante}/nombre`
  → `{ nombre }` — **agregado (20 jul 2026)** para soportar HU-06.
  Lee `fid_nom_fideicom`/`ben_nom_benef`/`ter_nom_tercero` según
  `tipoParticipante` (mismo patrón de resolución por tipo que el
  endpoint de RFC). Usado por `ms-carga-masiva` para resolver el Nombre
  Legal (nombre completo en persona física, razón social en persona
  moral) — este dato **no viene en el archivo de layout de carga
  masiva**, se resuelve consultando aquí. Recordar: `dif_nom_legal` es
  un campo **opcional** en `direccif`, pero la regla de negocio exige
  obtenerlo de estas tablas cuando esté disponible.
- `GET /api/v1/fideicomisos/{numContrato}/domicilios-heredables?tipoParticipante=&numParticipante=`
  → lista de domicilios desde `DIRECCI`, para poblar
  `DomiciliosHeredablesGrid` (HU-03)
> **Nota (15 jul 2026)**: se consideró un endpoint `GET
> /api/v1/fideicomisos?criterio=` para búsqueda libre por número o
> nombre, pero se descartó — es **redundante** con
> `GET /api/v1/fideicomisos/{numContrato}`, ya que todas las búsquedas
> reales de Fideicomiso son por llave exacta (No. de Fideicomiso), según
> HU-01. No existe ningún caso de negocio que requiera búsqueda libre
> por nombre. Se eliminó del código para no mantener complejidad sin
> propósito (YAGNI).

> ⚠️ Todas estas tablas (`CONTRATO`, `FIDEICOM`, `BENEFICI`, `TERCEROS`,
> `DIRECCI`) son de **solo lectura** para este proyecto — igual que
> `DIRECCIF`, no se modifican ni se les agregan columnas/constraints.
> Ver DDL reproducido en `04-esquema-datos-postgres.sql` para el
> laboratorio local.

### 2.3 `ms-cif-procesamiento`
Responsabilidad: recibir el PDF, validarlo, extraer datos y devolver un
DTO estructurado. No persiste el domicilio, solo lo interpreta.

> ⚠️ **Corrección técnica (20 jul 2026)**: se había asumido que el CIF
> era un PDF con campos AcroForm. Al inspeccionar los 2 PDFs reales con
> Apache PDFBox, se confirmó que **NO tienen AcroForm** — son PDFs de
> **texto plano renderizado** (el SAT los emite como documento, no como
> formulario interactivo). La extracción real es: leer el texto completo
> del PDF (`PDFTextStripper` de PDFBox) y parsear los campos con
> **expresiones regulares** sobre las etiquetas visibles ("Código
> Postal:", "Nombre de Vialidad:", etc.), no lectura de campos de
> formulario. Buen trabajo de OpenCode al verificar esto en código antes
> de construir sobre un supuesto incorrecto.

**Validación cruzada de RFC (confirmada con negocio, HU-04):** antes de
regresar los datos extraídos, el servicio debe llamar a
`ms-fideicomisos-adapter` (`GET
/api/v1/fideicomisos/{numContrato}/participantes/{tipoParticipante}/{numParticipante}/rfc`)
y comparar el RFC ya registrado contra el RFC leído del CIF. Si no
coinciden, la carga se **rechaza** — no se regresan datos de domicilio.

- `POST /api/v1/cif/procesar` (multipart/form-data, PDF + parámetros
  `fideicomisoId`, `tipoParticipante`, `numeroParticipante` para poder
  hacer la validación cruzada de RFC)
  → éxito: `{ calle, numeroExterior, numeroInterior, colonia, cp,
       municipio, estado, pais, rfcValidado: true }`
  → rechazo por RFC no coincidente: `409 Conflict` con mensaje claro
  → rechazo por PDF ilegible/texto no reconocido: `422 Unprocessable
       Entity` o `400`, con mensaje claro

**Librería usada**: Apache PDFBox (`org.apache.pdfbox:pdfbox`) —
`PDFTextStripper` para extracción de texto + regex para parseo de
campos, confirmado como el enfoque correcto tras inspeccionar los PDFs
reales.

**Mapeo de campos del CIF confirmado con PDFs reales (persona física y
persona moral) — 15 jul/20 jul 2026:**

| Campo visible en el CIF | Columna `direccif` | Notas |
|---|---|---|
| Código Postal | `dif_recep_cp` | |
| Tipo de Vialidad + Nombre de Vialidad | `dif_recep_calle` | Concatenar si "Tipo de Vialidad" viene lleno (ej. "CARRETERA (CARR.)") |
| Número Exterior | `dif_recep_no_ext` | Formato variable: puede ser "SN", numérico, o con decimales tipo "3.18 KM" — **no forzar a numérico** |
| Número Interior | `dif_recep_no_int` | Frecuentemente vacío |
| Nombre de la Colonia | `dif_recep_colonia` | |
| Nombre de la Localidad | `dif_recep_localidad` | Frecuentemente vacío |
| Nombre del Municipio o Demarcación Territorial | `dif_recep_municipio` | |
| Nombre de la Entidad Federativa | `dif_num_estado` | ⚠️ Viene como **texto** ("MEXICO", "GUANAJUATO") pero la columna es **numérica** (FK lógica a `catalogo_estado`) — resolver el nombre contra el catálogo antes de guardar; si no hay coincidencia, rechazar o marcar advertencia |
| Entre Calle + Y Calle | `dif_recep_referencia` | **Concatenar ambos** dentro de referencia (confirmado con negocio) |
| RFC | *(no se persiste)* | Solo para la validación cruzada contra `FIDEICOM`/`BENEFICI`/`TERCEROS` |
| Nombre(s)+Apellidos (física) / Denominación o Razón Social (moral) | `dif_nom_legal` | ⚠️ **Terminología corregida (21 jul 2026)**: pese al nombre de la columna, esto es el **"Nombre Fiscal"** (razón social/nombre SIN régimen de sociedades) — ver nota de terminología en §3.9 |
| Régimen Capital (persona moral, ej. "SOCIEDAD DE RESPONSABILIDAD LIMITADA...") | *(no se persiste)* | Se concatena con la Razón Social para formar el **"Nombre Legal"** — campo de **solo visualización**, no existe columna en `direccif` |
| Tel. Fijo/Móvil Lada + Número | `dif_telefono` | Concatenar Lada + Número |
| Correo Electrónico | `dif_mail` | **REVERTIDO (4 ago 2026)**: ahora SÍ se persiste — ver §3.7 |
| Régimen (puede haber varios, con fecha inicio/fin) | `dif_regimen_fiscal` | **Tomar el primero que aparece en el documento** (confirmado con negocio) — no el más reciente, no el vigente |

> El parseo se hace sobre las etiquetas visibles del texto extraído del
> PDF (regex), ya que no hay campos de formulario internos que leer.

### 2.4 `ms-carga-masiva` (importación por layout, HU-06)
Responsabilidad: recibir el archivo (delimitado por tabulador), registrar
control por línea en `carga_interfaz`, e insertar/actualizar en `direccif`
reutilizando las mismas validaciones/restricción de unicidad que
`ms-direcciones-fiscales` (idealmente invocando su lógica de dominio en
vez de duplicarla — evaluar si es un módulo interno de
`ms-direcciones-fiscales` o un microservicio aparte según volumen esperado).

**Mapeo del layout confirmado con archivo real de prueba (20 jul 2026)**
— 28 columnas por línea, delimitadas por tabulador:

| # col | Campo | Columna `direccif` / uso |
|---|---|---|
| 0 | Consecutivo de renglón | *(no es de negocio, solo control)* |
| 1, 5, 7, 9, 10, 11, 15, 16, 17 | Sin identificar | **Se ignoran** (confirmado con negocio: espacios reservados sin uso) |
| 2 | No. de Fideicomiso | `dif_num_contrato` |
| 3 | Tipo de Participante | `dif_cve_pers` |
| 4 | No. de Participante | `dif_num_pers_fid` |
| 6 | RFC | **No se persiste** — se usa para validación cruzada (ver abajo) |
| 8 | Nacionalidad | **Se ignora** (no existe columna en `direccif`) |
| 12 | Teléfono (número) | `dif_telefono` — **concatenar con columna 13** |
| 13 | Lada/código de país del teléfono | `dif_telefono` — se concatena con columna 12 (confirmado: `dif_telefono` = lada + número) |
| 14 | Correo Electrónico | **SÍ se persiste ahora** (`dif_mail`) — revertido 4 ago 2026, ver §3.7 |
| 18 | Calle | `dif_recep_calle` |
| 19 | Municipio | `dif_recep_municipio` |
| 20 | Localidad | `dif_recep_localidad` |
| 21 | Código Postal | `dif_recep_cp` |
| 22 | País (texto) | `dif_num_pais` (resolver contra `catalogo_pais`) |
| 23 | Estado (texto) | `dif_num_estado` (resolver contra `catalogo_estado`) |
| 24 | Colonia | `dif_recep_colonia` |
| 25 | No. Exterior | `dif_recep_no_ext` |
| 26 | No. Interior | `dif_recep_no_int` |
| 27 | Régimen Fiscal | `dif_regimen_fiscal` |

**Nombre Legal — NO viene en el archivo (confirmado con negocio):**
se resuelve consultando el nuevo endpoint
`GET /api/v1/fideicomisos/{numContrato}/participantes/{tipoParticipante}/{numParticipante}/nombre`
de `ms-fideicomisos-adapter` (§2.2) — nombre completo del participante
en persona física, razón social en persona moral. `dif_nom_legal` es
**opcional**, pero la regla de negocio exige obtenerlo de ahí cuando
esté disponible.

**Validación cruzada de RFC (columna 6) — mismo patrón que HU-04:** antes
de insertar/actualizar la línea, se llama a `ms-fideicomisos-adapter`
para comparar el RFC de la columna 6 contra el RFC ya registrado del
participante. Si no coinciden, esa línea se marca con error en
`carint_mensaje` (sin abortar el resto del archivo — regla ya confirmada
en HU-06).

- `POST /api/v1/carga-masiva/direcciones-fiscales` (multipart, archivo)
  → `{ totalLineas, insertadas, conError: [{secuencial, mensaje}] }`
- `GET  /api/v1/carga-masiva/{loteId}/detalle` (consulta de `carga_interfaz`)

### 2.5 BFF (opcional, recomendado)
Un `ms-bff-direcciones-fiscales` (o Gateway) que agrega llamadas a los tres
servicios para que el frontend haga una sola llamada por pantalla/acción.

## 3. Modelo de datos — `DomicilioFiscal`

Confirmado con negocio: los campos se dividen en **no editables** (bloqueados
en el formulario sin importar el origen del registro) y **editables**.

### 3.1 No editables (bloqueados siempre)
| Campo          | Tipo               | Notas                                          |
|----------------|--------------------|--------------------------------------------------|
| fideicomisoId  | String             | viene de `ms-fideicomisos-adapter`               |
| participante   | Enum               | FIDEICOMITENTE / FIDEICOMISARIO / TERCERO (combo) |
| numeroParticipante | String/Numeric | numérico o combo según catálogo del participante |
| nombreLegal (Nombre Fiscal) | String(250) | ⚠️ **CORREGIDO (22 jul 2026, confirmado con captura real del modal)**: NO es editable — se resuelve automáticamente desde `fideicom`/`benefici`/`terceros` vía `ms-fideicomisos-adapter`, igual que el RFC. Se movió aquí desde §3.2 donde estaba documentado incorrectamente como editable. |

> `rfc` y `nombreFideicomiso` (ya definidos en la spec original) también
> caen en este grupo — son solo lectura, provienen de la fuente maestra.

### 3.2 Editables
| Campo             | Tipo      | Notas                                            |
|-------------------|-----------|------------------------------------------------------|
| id                | UUID      | PK                                                  |
| calle             | String    | obligatorio                                         |
| numeroExterior    | String    | obligatorio                                         |
| numeroInterior    | String    | opcional                                            |
| colonia           | String    | obligatorio                                         |
| municipio         | String    | **Rótulo corregido (4 ago 2026): "Municipio/Alcaldía"** (antes decía "Municipio/Delegación/Localidad", que confundía Municipio con Localidad — son 2 campos distintos) |
| estado            | String    | obligatorio                                         |
| pais              | String    | default "México"                                    |
| codigoPostal      | String(5) | **campo crítico**, valida catálogo (pendiente confirmar SEPOMEX, ver §5 pregunta 5) |
| referencia        | String    | opcional (ej. entre calles, notas de ubicación)     |
| telefono          | String    | uno o varios — confirmar si es lista o campo único  |
| correoElectronico | String    | **REVERTIDO (4 ago 2026)**: ahora SÍ se persiste en `dif_mail`. Campo editable normal en el formulario, ya no es un "defecto replicado" — ver §3.7. |
| regimenFiscal     | Enum/FK   | combo, viene de catálogo cargado en tabla (`RegimenFiscal`) |

### 3.3 Metadatos técnicos de trazabilidad — REVERTIDO
> **Decisión actualizada**: `DIRECCIF` **no se puede modificar** (sin
> columnas nuevas). Por lo tanto `origen`, `documentoCifId`,
> `usuarioCaptura` y `activo` **no se agregan a esta tabla**.
>
> `fechaCaptura`/auditoría de alta y modificación ya existen en el
> legado como `dif_fec_alta` / `dif_fec_ultmod` — se usan esas, tal cual.
>
> Si más adelante se necesita trazabilidad de origen (manual/heredado/
> CIF/carga masiva) para fines de auditoría, se resolverá con una tabla
> **complementaria** (ej. `direccif_auditoria`) enlazada por la llave
> natural (`dif_num_contrato`, `dif_cve_pers`, `dif_num_pers_fid`), sin
> tocar `DIRECCIF`. **Pendiente decidir si se implementa en este
> laboratorio o se deja fuera de alcance.**

### 3.4 Nuevo catálogo requerido: `RegimenFiscal`
Como es un combo cargado desde tabla, se necesita un endpoint de catálogo,
ej. `GET /api/v1/catalogos/regimenes-fiscales` en `ms-direcciones-fiscales`
o en un microservicio de catálogos si ya existe uno en la organización.

### 3.5 Restricción de unicidad e identidad — RESUELTO: sin cambios a `DIRECCIF`
Confirmado: `DIRECCIF` **no admite ningún cambio estructural** — ni PK
técnico, ni `UNIQUE constraint`, ni `FOREIGN KEY` hacia los catálogos de
país/estado. Por lo tanto:
- **Identidad del registro**: la entidad JPA usa una **llave natural
  compuesta** (`@IdClass`/`@EmbeddedId`) sobre
  `dif_num_contrato + dif_cve_pers + dif_num_pers_fid`. No hay columna
  `dif_id` en la tabla real.
- **Unicidad** (`fideicomisoId + participante + numeroParticipante`):
  se valida **100% en `ms-direcciones-fiscales`** — se consulta antes de
  cada `INSERT`/`UPDATE` y se devuelve `409 Conflict` si ya existe (para
  alta) o se actualiza en su lugar (para el caso de carga masiva/upsert,
  HU-06). No existe constraint de BD que lo respalde.
- **Integridad referencial con catálogos** (`dif_num_pais`,
  `dif_num_estado`): también se valida en el servicio (verificar que el
  ID exista en `catalogo_pais`/`catalogo_estado`) antes de guardar, sin
  `FOREIGN KEY` en `direccif`.

### 3.6 Mejora propuesta (fuera de paridad estricta): catálogo de CP
Hoy el Código Postal solo valida longitud (5 dígitos numéricos), sin
catálogo institucional. Negocio reconoce valor en agregar un catálogo
tipo SEPOMEX que autocomplete Colonia/Municipio/Estado. **Requiere
aprobación explícita como cambio de alcance** (constitution §1) antes
de incluirse en las tareas de implementación — no es paridad funcional.

### 3.7 ⚠️ Reconciliación con el esquema legado real (`DIRECCIF`)
El usuario proporcionó el DDL real de la tabla legada, y confirmó
inicialmente que **no se podía modificar su estructura de ninguna
forma** (sin columnas, PK, UNIQUE ni FK nuevos). **Esta regla se
flexibilizó el 4 ago 2026**: se aprobó explícitamente agregar la
columna `dif_mail` (ver punto 1). Salvo esa excepción puntual, el
resto de las restricciones (sin PK/UNIQUE/FK) se mantienen. Esto
define varias decisiones:

1. **`correoElectronico` — CORREGIDO (4 ago 2026, revierte decisión
   anterior).** Originalmente se documentó como defecto legado
   replicado (se capturaba en pantalla pero nunca se guardaba). Se
   **corrigió**: se agregó la columna `dif_mail VARCHAR(150)` a
   `DIRECCIF` (excepción aprobada a la regla de inmutabilidad), y ahora
   el campo se persiste normalmente como cualquier otro campo editable.
2. **`pais` y `estado` son catálogos numéricos** (`dif_num_pais`,
   `dif_num_estado`), no texto libre como se asumió originalmente en
   §3.2. Se corrige el tipo a `Integer`/FK lógica (sin `FOREIGN KEY`
   físico, ver §3.5).
3. **Sin PK/UNIQUE/FK en `DIRECCIF`.** Toda la integridad (unicidad,
   referencial) vive en la capa de servicio de `ms-direcciones-fiscales`,

   no en la base de datos. Esto es intencional y debe quedar como
   prueba unitaria/integración explícita (ver `03-tasks-opencode.md`).

### 3.8 Mapeo campo de negocio ↔ columna real (`direccif`)
| Campo de negocio         | Columna real          | Tipo/Notas                          |
|---------------------------|------------------------|--------------------------------------|
| No. de Fideicomiso        | `dif_num_contrato`     | VARCHAR(10)                          |
| Tipo de Participante      | `dif_cve_pers`         | FIDEICOMITENTE/FIDEICOMISARIO/TERCERO|
| No. de Participante       | `dif_num_pers_fid`     | VARCHAR(20)                          |
| Calle                     | `dif_recep_calle`      |                                       |
| No. Exterior              | `dif_recep_no_ext`     |                                       |
| No. Interior              | `dif_recep_no_int`     | opcional                              |
| Colonia                   | `dif_recep_colonia`    |                                       |
| Municipio/Delegación      | `dif_recep_municipio`  |                                       |
| Localidad                 | `dif_recep_localidad`  | no mencionado explícitamente antes — confirmar si es lo mismo que "Municipio/Delegación/Localidad" o un campo aparte |
| País                      | `dif_num_pais`         | FK numérica a catálogo                |
| Estado                    | `dif_num_estado`       | FK numérica a catálogo                |
| Código Postal             | `dif_recep_cp`         | VARCHAR(5)                            |
| Referencia                | `dif_recep_referencia` |                                       |
| Teléfono                  | `dif_telefono`         |                                       |
| Régimen Fiscal            | `dif_regimen_fiscal`   | texto, no FK a catálogo en el legado (ideal: migrar a FK) |
| Nombre Fiscal              | `dif_nom_legal`        | ⚠️ Ver §3.9 — pese al nombre de la columna (`nom_legal`), aquí se guarda el **Nombre Fiscal** (razón social/nombre SIN régimen de sociedades), no el "Nombre Legal" |
| Correo Electrónico        | `dif_mail`             | **REVERTIDO (4 ago 2026)**: columna nueva aprobada, ahora sí se persiste — ver §3.7 punto 1 |
| Fecha alta                | `dif_fec_alta`         | control                               |
| Fecha última modificación | `dif_fec_ultmod`       | control                               |

### 3.9 ⚠️ Aclaración de terminología: Nombre Fiscal vs. Nombre Legal (confirmado 21 jul 2026, corregido 23 jul 2026)
Requerimiento de negocio introdujo conceptos distintos de "nombre" que
hay que distinguir claramente, ya que `direccif` solo tiene **una**
columna relacionada (`dif_nom_legal`) y no se puede modificar:

| Concepto | Definición | ¿Se persiste? |
|---|---|---|
| **Nombre Fiscal** | Razón Social (persona moral) o Nombre completo (persona física), **sin** régimen de sociedades | ✅ **Sí — en `dif_nom_legal`**, a pesar de que el nombre de la columna sugiere lo contrario. ⚠️ **NO es editable por el usuario** (confirmado con captura real del modal, 22 jul 2026) — se resuelve automáticamente desde `fideicom`/`benefici`/`terceros`, igual que el RFC. |
| **Nombre Legal** | Nombre Fiscal + Régimen de Sociedades concatenados (ej. "NATURAL FOODS INTERNACIONAL, SOCIEDAD DE RESPONSABILIDAD LIMITADA DE CAPITAL VARIABLE"). Para persona física, la mayoría de las veces no aplica régimen, así que Nombre Legal = Nombre Fiscal | ❌ No — solo se muestra en pantalla, se calcula/extrae pero no tiene columna |

> ⚠️ **REVERTIDO (23 jul 2026)**: el concepto de **"Nombre Comercial"**
> (campo nuevo que se había pedido agregar) se **elimina por completo**
> — no se muestra, no se captura, no se persiste. Solo quedan dos
> conceptos de nombre: **Nombre Fiscal** (persistido, automático) y
> **Nombre Legal** (solo visualización, calculado). Cualquier mención
> anterior a "Nombre Comercial" en este documento o en el código ya
> generado debe eliminarse.

**Impacto en servicios ya construidos:**
- `ms-cif-procesamiento`: el valor que ya extrae hacia `dif_nom_legal`
  (Nombre(s)+Apellidos / Denominación o Razón Social) **no cambia** — ya
  corresponde correctamente al "Nombre Fiscal". Debe **agregarse** la
  extracción de "Régimen Capital" del texto del CIF, para regresarlo en
  la respuesta del endpoint como campo adicional de solo lectura (para
  construir "Nombre Legal" en el frontend) — **ya NO se extrae "Nombre
  Comercial"** (revertido).
- `ms-carga-masiva`: el nombre resuelto vía `ms-fideicomisos-adapter`
  (columnas `fid_nom_fideicom`/`ben_nom_benef`/`ter_nom_tercero`)
  corresponde al Nombre Fiscal, se sigue guardando en `dif_nom_legal`
  sin cambios.
- Frontend (`DomicilioForm`): debe mostrar **2** campos de nombre por
  separado (Nombre Fiscal — bloqueado, automático; Nombre Legal — solo
  visualización), sin ningún campo de "Nombre Comercial".

> El DDL completo, con la tabla `carga_interfaz` para el control de
> cargas masivas (HU-06), está en `04-esquema-datos-postgres.sql`.

## 4. Frontend — React + TypeScript + Storybook

### 4.0 Sistema de diseño — decisión confirmada (22 jul 2026)
**shadcn/ui** sobre Tailwind CSS (no Tailwind puro/manual). shadcn/ui no
es una librería de componentes instalada como dependencia tradicional —
son componentes fuente que se copian al proyecto (`npx shadcn@latest add
<componente>`) y se pueden modificar libremente. Se usan sus primitivos
(`Button`, `Input`, `Select`, `Dialog`, `Table`, `Alert`, etc.) como base
de todos los componentes de `features/direcciones-fiscales/components/`.

**Paleta de colores confirmada:**
- **Color principal (primary)**: rojo — usar en botones primarios,
  elementos de acción principal, y acentos de marca.
- **Fondos**: rango entre gris claro y blanco (evitar fondos oscuros/
  altos en contraste; mantener la interfaz clara y neutra, con el rojo
  como acento, no como color dominante de fondo).
- Configurar esto en el tema de shadcn/ui (`tailwind.config` / variables
  CSS de tema, ej. `--primary` en rojo) para que todos los componentes
  lo hereden automáticamente, en vez de aplicar el color manualmente
  componente por componente.

### 4.1 Árbol de componentes
```
src/
  features/direcciones-fiscales/
    api/
      direccionesFiscalesApi.ts     (fetch/axios + tipos)
      fideicomisosApi.ts
      cifApi.ts
      cargaMasivaApi.ts
    components/
      BusquedaCriteriosForm/         (+ .stories.tsx)
      DomiciliosGrid/                (+ .stories.tsx)
      DomicilioModal/                (contenedor del formulario)
      DomicilioForm/                 (+ .stories.tsx: readonly/editable)
      DomiciliosHeredablesGrid/      (grid dentro del modal, HU-03)
      CifUploader/                   (+ .stories.tsx: idle/loading/error/ok)
      CargaMasivaUploader/           (+ .stories.tsx, HU-06)
      CargaMasivaResultadoTabla/     (+ .stories.tsx: detalle de errores por línea, HU-06)
    hooks/
      useDireccionesFiscales.ts
      useCifUpload.ts
      useCargaMasiva.ts
    types/
      domicilioFiscal.ts
    DireccionesFiscalesPage.tsx
```

### 4.2 Referencia visual del diseño legado (capturada de screenshot, 22 jul 2026)
El usuario compartió una captura de la pantalla JSF/PrimeFaces original
(sin menú lateral, banner ni datos de usuario — esas partes se omiten
en la migración). Elementos a replicar:

- **Título de pantalla**: "Direcciones Fiscales" en barra roja sólida,
  texto blanco.
- **Grid de resultados**: encabezados en barra roja, texto blanco.
  Columnas visibles: Fideicomiso, Tipo Participante, No. Participante,
  Calle, No. Ext., No. Int., Colonia, Localidad, País (posiblemente hay
  más columnas fuera de vista, ej. Estado/CP — confirmar con negocio si
  el grid necesita scroll horizontal o se muestran todas).
- **Barra de paginación**: roja, texto blanco centrado
  ("1-N de M registros"), con 4 iconos de navegación
  (primero/anterior/siguiente/último).
- **Sección "Criterios de Búsqueda"**: título con barra en degradado rojo.
- **Botón de búsqueda se llama "Consultar"** (no "Aceptar" — corregido
  en `01-spec-direcciones-fiscales.md`).
- **Botones con icono + texto, estilo outline** (fondo blanco, borde
  gris, icono en rojo, texto oscuro): 🔍 Consultar, 🗑️ Limpiar,
  📤 Exportar Consulta.
- **Sección "Acción"** separada a la derecha con línea divisoria:
  ✏️ Mantenimiento, ⛔ Importar — mismo estilo outline.

Este estilo (outline con icono rojo) aplica también como referencia para
`DomiciliosGrid` y los demás componentes de Fase 5.

**Composición de página confirmada (22 jul 2026):** viendo la captura
completa, el orden real es: **título "Direcciones Fiscales"** (barra
roja) → **`DomiciliosGrid`** (resultados + paginación) → **sección
"Criterios de Búsqueda"** con `BusquedaCriteriosForm` debajo. No son
2 pantallas independientes, sino una sola composición en
`DireccionesFiscalesPage`. El estado `hasResults` del grid vive en el
componente contenedor (`DireccionesFiscalesPage`) y se pasa como prop a
`BusquedaCriteriosForm` para habilitar/deshabilitar "Exportar Consulta".

### 4.2b Layout de `DomicilioForm` — confirmado con negocio (23 jul 2026, actualizado 23 jul 2026)
- **Nombre del Fideicomiso** y **Nombre Fiscal**: ambos campos de
  **ancho completo** (ocupan todo el ancho del formulario/ventana), ya
  que pueden ser texto largo (razón social extensa).
- **2 secciones** (no 3):
  1. **Identificación**: Fideicomiso, Nombre del Fideicomiso (ancho
     completo), Participante, No. Participante, Nombre Fiscal (ancho
     completo), RFC.
  2. **Dirección Fiscal / Addenda**: **Nombre Legal (visualización)
     va primero**, seguido de Calle, No. Ext., No. Int., Colonia,
     Municipio, Localidad, País, Estado, Código Postal, Referencia,
     Teléfono, Régimen Fiscal.
- **Nombre Comercial NO existe** en ninguna sección (ver §3.9 —
  revertido).
- **Banner de origen CIF** ("Datos extraídos del CIF — verifique la
  información"): el ícono debe estar **alineado verticalmente al
  centro** con el texto (`items-center` en el contenedor flex), no
  desplazado hacia abajo/izquierda.

### 4.3 Estados clave a documentar en Storybook
- `DomicilioForm`: `readonly` (RFC/Fideicomiso/Nombre), `editable`,
  `cargadoDesdeCIF` (con banner "datos extraídos del CIF, verifique"),
  `error de validación`.
- `CifUploader`: `idle`, `subiendo`, `procesando`, `éxito`, `error-formato`,
  `error-extraccion`.
- `DomiciliosGrid`: `vacío`, `con datos`, `cargando`, `error de búsqueda`.

### 4.4 Gestión de estado
React Query (TanStack Query) para llamadas a los 3 servicios/BFF +
`zod` para validar el formulario en el cliente (mismas reglas que el
backend, ver §3).

## 5. Contrato OpenAPI (fragmento inicial)
```yaml
paths:
  /api/v1/direcciones-fiscales:
    get:
      parameters:
        - in: query
          name: fideicomisoId
          schema: { type: string }
      responses:
        "200":
          description: Lista de domicilios
    post:
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/DomicilioFiscalRequest'
      responses:
        "201": { description: Creado }
        "400": { description: Errores de validación }
components:
  schemas:
    DomicilioFiscalRequest:
      type: object
      required: [fideicomisoId, calle, numeroExterior, colonia, codigoPostal, municipio, estado, tipoPersona, origen]
      properties:
        fideicomisoId: { type: string }
        calle: { type: string }
        numeroExterior: { type: string }
        numeroInterior: { type: string }
        colonia: { type: string }
        codigoPostal: { type: string, pattern: '^[0-9]{5}$' }
        municipio: { type: string }
        estado: { type: string }
        pais: { type: string, default: "México" }
        tipoPersona: { type: string, enum: [FISICA, MORAL] }
        origen: { type: string, enum: [MANUAL, HEREDADO_GRID, CIF_PDF] }
        documentoCifId: { type: string, format: uuid, nullable: true }
```

## 6. No funcionales
- Observabilidad: cada microservicio expone `/actuator/health` y métricas
  Micrometer/Prometheus.
- Seguridad: OAuth2/JWT entre BFF y microservicios; validación de
  tipo/tamaño de PDF antes de llegar a `ms-cif-procesamiento`.
- Resiliencia: `ms-direcciones-fiscales` no debe fallar si
  `ms-cif-procesamiento` está caído — el usuario puede seguir capturando
  manualmente (fallback documentado en HU-04).
