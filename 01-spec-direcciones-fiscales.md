# Spec — Pantalla Direcciones Fiscales

## 1. Resumen
Pantalla que permite **consultar** domicilios fiscales asociados a un
Fideicomiso (u otros criterios) y **capturar/editar** el detalle de un
domicilio en una ventana modal, con tres formas de origen del dato:
manual, heredado de un grid relacionado, o cargado desde un CIF (PDF).

## 2. Actores
- **Usuario de negocio / operador fiduciario**: consulta y captura domicilios.
- **Sistema origen de Fideicomisos**: fuente maestra de RFC / Fideicomiso / Nombre.
- **Servicio de extracción de CIF**: procesa el PDF y extrae los datos fiscales.

## 3. Historias de usuario

### HU-01 Consultar domicilios fiscales
**Como** usuario de negocio
**Quiero** buscar domicilios fiscales por Fideicomiso u otros criterios
**Para** ubicar y revisar la información capturada.

**Criterios de búsqueda (confirmados):**
- **No. de Fideicomiso**: numérico, longitud máxima 10 dígitos.
- **Tipo de Participante**: combo con valores `FIDEICOMITENTE` / `FIDEICOMISARIO` / `TERCERO`.
  > Nota: agrega el valor `TERCERO` que no estaba en el modelo de datos
  > original de §3.1 (`participante` en `DomicilioFiscal` solo tenía
  > FIDEICOMITENTE/FIDEICOMISARIO). Hay que confirmar si `TERCERO` es
  > únicamente un criterio de búsqueda o también un valor válido del
  > campo `participante` en el domicilio — ver pregunta abierta nueva en §5.

**Acciones/botones de la sección de consulta:**
- **Consultar** — ejecuta la búsqueda con los criterios capturados.
- **Limpiar** — resetea los criterios de búsqueda y el grid.
- **Exportar Consulta** — exporta el resultado del grid (definir formato:
  Excel/CSV — ver pregunta abierta). **Confirmado (22 jul 2026)**: debe
  estar **deshabilitado** hasta que el grid de resultados tenga al menos
  un registro — no tiene sentido exportar sin haber consultado antes.
  Esto implica que `BusquedaCriteriosForm` no puede controlar este
  estado de forma aislada: necesita recibir si el grid tiene resultados
  (prop `hasResults` o equivalente) desde el componente contenedor
  (`DireccionesFiscalesPage`), ya que el grid y el formulario de
  criterios son dos componentes separados que comparten este estado.
- **Mantenimiento** — abre el modal de captura/edición (probablemente
  el disparador de HU-02/03/04, a confirmar si es alta libre o requiere
  selección previa en el grid).
- **Importar** — probablemente el punto de entrada para la carga masiva o
  la carga por CIF/PDF (a confirmar si es lo mismo que HU-04 o una función
  adicional de importación masiva).

Criterios de aceptación:
- Given la pantalla de consulta cargada
  When el usuario captura No. de Fideicomiso y/o Tipo de Participante y
       presiona **Consultar**
  Then el grid muestra los domicilios que cumplen esos criterios.
- Given que el usuario no captura ningún criterio
  When presiona **Consultar**
  Then el sistema exige al menos un criterio antes de consultar.
- Given resultados en el grid
  When el usuario selecciona un registro y presiona **Mantenimiento**
       (o hace doble clic, a confirmar)
  Then se abre el modal de captura con los datos del registro.
- Given el usuario presiona **Limpiar**
  When no hay búsqueda en curso
  Then se limpian los criterios y el grid vuelve a su estado vacío.
- **RESUELTO (24 jul 2026, revierte una decisión anterior de UI)**: el
  grid de resultados permanece **oculto** hasta que exista al menos una
  consulta con resultados — no se muestra vacío por default. La sección
  "Criterios de Búsqueda" va **arriba**, y el grid aparece **debajo**,
  solo cuando hay registros que mostrar.
- **Columnas visibles del grid (confirmado 24 jul 2026)**: Fideicomiso,
  Tipo de Participante, No. de Participante, Calle, Colonia, Localidad,
  País — **mostrando el nombre del país** (ej. "México"), no el ID
  numérico. El resto de los campos de `direccif` (No. Exterior, No.
  Interior, Municipio, Estado, Código Postal, Referencia, Teléfono,
  Régimen Fiscal —con su **descripción**, no el código—, Nombre Fiscal)
  se muestran en el **acordeón de detalle** por registro, no en las
  columnas principales.

### HU-02 Capturar domicilio manualmente
**Como** usuario de negocio
**Quiero** capturar manualmente los datos de un domicilio
**Para** registrar información que no proviene de otra fuente.

**Flujo completo del modal confirmado con negocio (22 jul 2026):**

El modal "Dirección Fiscal" tiene **3 modos**: Consulta (default), Alta,
y Modificar.

**Modo Consulta (default al abrir):** todos los campos en solo lectura,
mostrando el registro ya guardado (si existe).

**Modo Alta** (al presionar el botón "Alta"):
1. Se limpian todos los campos del modal.
2. Se habilita el campo **Fideicomiso** — el usuario captura el número.
3. El sistema **valida que el Fideicomiso exista** y obtiene su
   **Nombre del Fideicomiso** (de `CONTRATO`).
4. El usuario selecciona **Tipo de Participante** (combo) y captura el
   **No. de Participante**.
5. Si el participante existe, el sistema obtiene automáticamente:
   **Nombre del Participante**, **Nombre Fiscal**, y **RFC** (para
   persona moral se hereda también el RFC de la fuente — estos 3
   siempre se resuelven automáticamente, nunca se capturan a mano).
6. Ya con Fideicomiso+Participante+No. resueltos, se captura el
   **domicilio fiscal** por una de 3 vías: **Carga de CIF**, **captura
   manual**, o **heredando una dirección ya existente en `DIRECCI`**
   (HU-03). **RESUELTO**: el "Importar" dentro del modal **es lo mismo**
   que heredar de `DIRECCI` (HU-03) — es una coincidencia de nombre con
   el botón "Importar" de la pantalla de consulta principal (carga
   masiva por archivo, HU-06), que son 2 acciones **completamente
   distintas** a pesar de compartir etiqueta. El frontend/UI debe
   distinguirlos claramente (ej. con texto/ícono diferente, o ubicación)
   para no confundir al operador ni al desarrollador.
7. **Aceptar** → guarda el domicilio fiscal, cierra a modo Consulta.
   **Cancelar** → descarta los cambios, vuelve a modo Consulta.

**Modo Modificar** (al presionar el botón "Modificar", sobre un registro
existente): **Fideicomiso, Participante, No. Participante, Nombre del
Fideicomiso, Nombre del Participante, RFC y Nombre Fiscal quedan
bloqueados** (no se recapturan — ya están fijos del alta original). Solo
se puede editar **a partir de Nombre Legal en adelante** (es decir, los
campos de domicilio: Calle, No. Ext./Int., Colonia, Municipio,
Localidad, País, Estado, CP, Referencia, Teléfono, Régimen Fiscal),
igual por 3 vías: manual, heredando de `DIRECCI`, o Cargar CIF.

Criterios de aceptación:
- Given el modal abierto en modo captura manual (Alta)
  When el usuario llena los campos obligatorios de domicilio (calle, número,
       colonia, código postal, municipio/alcaldía, estado, país, tipo de
       persona, etc. — ver `02-plan-tecnico.md` §Modelo de datos)
  Then el sistema valida formato (ej. CP de 5 dígitos) y campos obligatorios
       antes de permitir guardar.
- Given RFC, FIDEICOMISO, Nombre de Fideicomiso, Nombre del Participante
       y Nombre Fiscal ya resueltos (automático en Alta, o ya existentes
       en Modificar)
  When se muestra el modal
  Then estos campos se muestran **solo lectura** (no editables) —
       tanto en Alta (tras resolverse) como en Modificar (siempre).
- Given modo Modificar sobre un registro existente
  When el usuario edita el domicilio
  Then únicamente los campos de domicilio (a partir de Nombre Legal en
       la disposición del formulario) son editables; el resto permanece
       bloqueado.

### HU-02b Validar Régimen Fiscal contra tipo de persona (confirmado 22 jul 2026)
**Como** usuario de negocio
**Quiero** que el sistema valide el Régimen Fiscal seleccionado
**Para** evitar seleccionar un régimen que no corresponde al tipo de
persona (física/moral) del participante.

Se usa el catálogo real del SAT (ver `04-esquema-datos-postgres.sql`,
tabla `catalogo_regimen_fiscal` — 19 regímenes con indicador de si
aplica a persona física, moral, o ambas).

Criterios de aceptación:
- Given el combo de Régimen Fiscal
  When se despliega
  Then solo debe mostrar los regímenes cuyo indicador
       (`reg_aplica_fisica`/`reg_aplica_moral`) corresponda al tipo de
       persona del participante actual (física o moral, obtenido de
       `fid_cve_tipo_per`/`ben_cve_tipo_per`/`ter_cve_tipo_pers` según
       el tipo de participante).
- Given que el usuario selecciona un régimen que no aplica al tipo de
  persona del participante (ej. por un error de datos o de UI)
  When intenta guardar
  Then el sistema rechaza con un mensaje claro indicando que el régimen
       no corresponde al tipo de persona.
- **RESUELTO**: existe un botón **"Valida Régimen Fiscal"** para
  validación manual/bajo demanda, pero **si el usuario lo omite**, la
  validación se ejecuta de todas formas **automáticamente al presionar
  "Aceptar"** — es decir, antes de mandar a insertar/modificar, siempre
  se valida (con o sin el clic manual previo). El botón manual es solo
  una comprobación anticipada opcional para el usuario, no un requisito
  para que la regla se aplique.

### HU-03 Heredar domicilio desde grid relacionado
**Como** usuario de negocio
**Quiero** seleccionar un domicilio ya existente asociado al
Fideicomiso/tipo de persona desde un grid secundario dentro del modal
**Para** reutilizar un domicilio ya registrado sin volver a capturarlo.

Criterios de aceptación:
- Given el modal abierto
  When el usuario abre el grid de domicilios relacionados y selecciona uno
  Then los campos del formulario se autocompletan:
  - Se precargan **Calle, Colonia, Localidad, Código Postal** desde el
    domicilio heredable y **País/Estado** se resuelven contra los catálogos
    (búsqueda del ID cuyo nombre coincide, con tolerancia a
    mayúsculas/acentos).
  - Solo se sobrescriben los campos de domicilio; **no se tocan ni se
    resetean** los campos de identificación ya resueltos (Nombre del
    Fideicomiso, Nombre del Participante, RFC, Nombre Fiscal).
  - Tras heredar quedan **bloqueados (solo lectura)**: Calle, Colonia,
    Localidad, Municipio, País, Estado y Código Postal.
  - Quedan **editables** para que el usuario los capture: Teléfono,
    Referencia, Correo Electrónico y Régimen Fiscal.
  - El grid muestra un acordeón por fila con un ícono de despliegue
    (`ChevronDown` que rota al expandirse) y detalle con Tipo de Domicilio,
    Secuencia y Nombre de Atención.
- El banner informativo tras heredar muestra: **"Datos Heredados del
  Domicilio registrado"**.
- El origen del registro queda marcado como `HEREDADO_GRID`.

### HU-04 Cargar domicilio desde CIF (PDF)
**Como** usuario de negocio
**Quiero** adjuntar el PDF de la Cédula de Identificación Fiscal (CIF)
**Para** que el sistema extraiga y precargue automáticamente el domicilio
fiscal.

**Mecanismo técnico confirmado**: el CIF es un PDF de **texto plano
renderizado** emitido por el SAT (no tiene campos de formulario/AcroForm,
confirmado al inspeccionar 2 PDFs reales) — la extracción es lectura de
texto completo + parseo con expresiones regulares sobre las etiquetas
visibles, no lectura de campos de formulario ni OCR.

**Regla de negocio confirmada — validación cruzada de RFC**: el sistema
compara el RFC que trae el CIF contra el **RFC ya registrado** para ese
participante (Fideicomiso+Tipo de Participante+No. Participante) en
`FIDEICOM`/`BENEFICI`/`TERCEROS` según corresponda (vía
`ms-fideicomisos-adapter`). **Si no coinciden, el CIF se rechaza** — no
se carga ningún dato al formulario.

Criterios de aceptación:
- Given el modal abierto
  When el usuario adjunta un archivo PDF
  Then el sistema valida: es PDF, tamaño máximo permitido (definir, ej. 5MB),
       y no está corrupto.
- Given un PDF válido con campos AcroForm legibles
  When se procesa
  Then el sistema extrae calle, número, colonia, CP, municipio, estado,
       y precarga el formulario, marcando origen `CIF_PDF`.
- Given que el CIF trae **múltiples regímenes fiscales** listados (caso
  frecuente en personas físicas)
  When se extrae el dato de Régimen Fiscal
  Then el sistema toma el **primer régimen que aparece en el documento**
       (no el más reciente por fecha, no el vigente/sin fecha de fin —
       simplemente el primero en el orden en que aparece en el CIF).
- Given que el CIF trae los campos "Entre Calle" y/o "Y Calle"
  When se extraen los datos
  Then ambos se **concatenan dentro de `dif_recep_referencia`** (ej.
       "Entre Calle: X, Y Calle: Y" — formato exacto de concatenación a
       definir en la implementación).
- Given que los datos provienen del CIF
  When se muestra el formulario
  Then los campos autocompletados desde el CIF quedan **bloqueados para
       captura manual** (el operador no puede sobrescribir lo que dice
       el documento oficial del SAT).
- Given un PDF cuyo RFC **no coincide** con el RFC ya registrado del
  participante (Fideicomiso+Participante+No.Participante)
  When se intenta cargar
  Then el sistema **rechaza la carga** — no se precarga ningún campo,
       y se muestra un mensaje indicando que el RFC del CIF no
       corresponde al participante.
- Given un PDF que no puede procesarse (campos AcroForm ausentes,
  formato no reconocido, corrupto)
  When se intenta cargar
  Then se muestra un mensaje de error claro y se permite capturar manualmente
       como alternativa.

### HU-05 Guardar y validar el domicilio
**Como** usuario de negocio
**Quiero** guardar el domicilio capturado/heredado/cargado
**Para** persistir la información y verla reflejada en el grid de consulta.

Criterios de aceptación:
- Given el formulario completo y válido (cualquier origen)
  When el usuario guarda
  Then se persiste el domicilio, se cierra el modal y el grid de consulta
       se refresca mostrando el nuevo/actualizado registro.
- Given errores de validación
  When el usuario intenta guardar
  Then se listan los errores por campo sin cerrar el modal.

### HU-06 Importación masiva por Layout
**Como** usuario de negocio
**Quiero** cargar varios domicilios fiscales a la vez mediante un archivo
de layout definido
**Para** evitar captura manual registro por registro.

**Especificación del layout (confirmada):**
- Formato: archivo de texto **delimitado por tabulador** (`\t`).
- Primera columna: **consecutivo de renglón** (número de línea dentro
  del archivo, no es un campo de negocio).
- Columnas siguientes: los campos de la tabla `DIRECCIF` en orden
  (ver `04-esquema-datos-postgres.sql` para la definición exacta de
  cada columna): `dif_num_contrato`, `dif_cve_pers`, `dif_num_pers_fid`,
  `dif_recep_calle`, `dif_recep_no_ext`, `dif_recep_no_int`,
  `dif_recep_colonia`, `dif_recep_localidad`, `dif_recep_municipio`,
  `dif_num_pais`, `dif_num_estado`, `dif_recep_cp`,
  `dif_recep_referencia`, `dif_telefono`, `dif_regimen_fiscal`,
  `dif_nom_legal`.
  > `[PENDIENTE-VALIDAR]` confirmar el orden exacto de columnas del
  > archivo real, ya que puede no coincidir 1:1 con el orden de la
  > tabla (a veces el layout histórico difiere del DDL actual).

**Las 2 acciones que ejecuta "Importar" (confirmadas):**
1. **Inserta un registro de control por cada línea del archivo** en
   `CARGA_INTERFAZ`, con:
   - `carint_num_usuario`: usuario que ejecuta la carga.
   - `rut_id_rutina`: código duro `"MASIVO DIRECCIONES FISCAL"`.
   - `carint_fecha`: fecha del sistema.
   - `carint_sec_archivo`: fijo `1`.
   - `carint_secuencial`: número de renglón obtenido del archivo.
   - `carint_nom_path` / `carint_nom_arch`: nombre del archivo cargado
     (mismo valor en ambos campos).
   - `carint_arch_tmp`: fijo `"N/A"`.
   - `carint_cadena`: la línea completa del archivo, tal cual.
   - `carint_estatus`: fijo `"A"` al insertar.
   - `carint_mensaje`: vacío al insertar.
2. **Inserta/actualiza el domicilio fiscal en `DIRECCIF`** con los datos
   de esa línea, respetando la misma restricción de unicidad
   (`Fideicomiso + Participante + No. Participante`) y las mismas
   validaciones que la captura individual (CP 5 dígitos, obligatorios,
   etc.).

Criterios de aceptación:
- Given un archivo de layout válido con N líneas
  When se ejecuta "Importar"
  Then se insertan N registros en `CARGA_INTERFAZ` (uno por línea, como
       bitácora/tabla de paso) y se procesan N líneas contra `DIRECCIF`.
- Given una línea con datos inválidos (ej. CP no numérico, faltante de
  obligatorio, o violación de reglas de formato)
  When se procesa esa línea
  Then el detalle del error se registra en `carint_mensaje` de esa línea,
       y el procesamiento **continúa con las siguientes líneas** del
       archivo (no se aborta el lote completo).
- Given una línea cuya combinación Fideicomiso+Participante+No. Participante
  **ya existe** en `direccif`
  When se procesa esa línea
  Then el registro existente se **actualiza/reemplaza** (upsert) con los
       datos de la línea.
- Given que el archivo terminó de procesarse con una o más líneas con error
  When el operador ve el resultado de la carga en el frontend
  Then debe mostrarse claramente **qué líneas fallaron y por qué**
       (usando el `carint_mensaje` de cada línea con error), no solo un
       conteo genérico de "N exitosas / M con error" — el operador
       necesita saber **cuál** línea corregir y **por qué** motivo,
       para poder arreglar el archivo y volver a intentar la carga.
       *(Nota de implementación: el backend ya regresa esta información
       en la respuesta de `POST /api/v1/carga-masiva/direcciones-fiscales`
       — `lineas[]` — y en `GET /{loteId}/detalle`; queda pendiente
       construir la pantalla del frontend que lo consuma y lo muestre,
       ver Fase 5/6 de `03-tasks-opencode.md`.)*

**Preguntas de esta HU — RESUELTAS:**
- ~~¿Qué valores puede tomar `carint_estatus`?~~ **RESUELTO**: `CARGA_INTERFAZ`
  es solo una **tabla de paso/bitácora** — no maneja más estatus que `"A"`.
  No se requiere máquina de estados adicional.
- ~~¿Un error detiene todo el archivo o solo esa línea?~~ **RESUELTO**:
  al detectar una línea con error, se registra el detalle en
  `carint_mensaje` de esa línea y **se continúa evaluando el resto**
  del archivo (no se aborta el lote).
- ~~¿Reemplaza o solo inserta?~~ **RESUELTO**: si el Fideicomiso+
  Participante+No. Participante **ya existe**, la carga masiva
  **actualiza/reemplaza** el registro en `direccif` (upsert).

## 4. Entidades de negocio (alto nivel)
- **Fideicomiso**: identificador, nombre, RFC asociado (fuente maestra, solo lectura aquí).
- **DomicilioFiscal**: calle, número exterior/interior, colonia, CP, municipio,
  estado, país, tipo de persona, origen (`MANUAL`/`HEREDADO_GRID`/`CIF_PDF`),
  fideicomisoId, fechaCaptura, usuarioCaptura.
- **DocumentoCIF**: referencia al PDF cargado (para trazabilidad, no
  necesariamente se re-muestra en pantalla).

## 5. Preguntas abiertas para validar con el equipo de negocio
> Estas quedan marcadas explícitamente porque cambian el `plan` y las `tasks`.

1. ~~En HU-03, ¿los campos heredados del grid quedan editables o
   bloqueados?~~ **RESUELTO, y CORREGIDO (22 jul 2026 con captura real
   del modal)**: Fideicomiso, Participante y No. Participante siempre
   bloqueados. **Nombre Fiscal también es siempre no editable** — se
   resuelve automáticamente desde `fideicom`/`benefici`/`terceros` (vía
   `ms-fideicomisos-adapter`), igual que el RFC; el usuario nunca lo
   captura a mano, ni en alta ni en edición (corrige una afirmación
   anterior en esta misma spec que lo marcaba como editable con límite
   de 250 caracteres — esa afirmación era incorrecta). El resto de los
   campos (domicilio, contacto, Régimen Fiscal) sí son editables, sin
   importar el origen (manual/heredado/CIF).
2. ~~¿Cuáles son los criterios de búsqueda?~~ **RESUELTO**: No. de
   Fideicomiso (máx. 10 dígitos) y Tipo de Participante
   (FIDEICOMITENTE/FIDEICOMISARIO/TERCERO).
3. ~~¿Cuál es el motor/servicio actual que extrae datos del CIF?~~
   **RESUELTO**: el CIF es un PDF emitido por el **SAT**; se lee y
   autocompleta el formulario, y el sistema **bloquea la captura manual**
   de esos campos mientras provengan del CIF (evita que el operador los
   teclee, para no contradecir el documento oficial).
4. ~~¿Un Fideicomiso puede tener múltiples domicilios vigentes?~~
   **RESUELTO**: solo puede existir **un** domicilio fiscal por la
   combinación única `Fideicomiso + Tipo Participante + No. Participante`.
   → Esto es una regla de integridad importante: se implementa como
   restricción única (unique constraint) en la tabla y validación de
   negocio antes de insertar.
5. ~~Reglas de validación de CP?~~ **RESUELTO (con mejora propuesta)**:
   hoy **no** hay catálogo institucional — solo se valida longitud de
   5 caracteres numéricos. El usuario/negocio reconoce que **sería
   valioso agregar un catálogo institucional** (tipo SEPOMEX) en la
   migración para autocompletar Colonia/Municipio/Estado y reducir
   errores de captura.
   → Se marca como **mejora propuesta para la migración** (no es
   paridad estricta, así que debe aprobarse explícitamente como cambio
   de alcance, según el principio #1 de `00-constitution.md`).
6. ~~¿`TERCERO` es válido en `participante` del domicilio?~~
   **RESUELTO**: sí, `TERCERO` es un valor válido del campo
   `participante` (no solo un filtro de búsqueda). El enum
   `participante` en `02-plan-tecnico.md` §3.1 debe actualizarse a
   `FIDEICOMITENTE / FIDEICOMISARIO / TERCERO`.
7. ~~¿Formato de exportación?~~ **RESUELTO**: **CSV**.
8. ~~¿Mantenimiento requiere selección previa?~~ **RESUELTO (con nota de
   mejora de diseño)**: hoy **sí requiere** un registro seleccionado en
   el grid, pero ese mismo botón también se usa para **dar de alta** un
   domicilio nuevo (ahí se habilitan Fideicomiso y Nombre de Fideicomiso,
   el cual se autocompleta al capturar el número de Fideicomiso si
   existe). El propio usuario de negocio identifica esto como **posible
   mal diseño de UX** en la pantalla original (un mismo botón para dos
   intenciones distintas: editar vs. dar de alta).
   → **Recomendación para la migración**: separar en dos acciones
   explícitas en el nuevo frontend — **"Nuevo domicilio"** (alta, sin
   selección previa, con Fideicomiso editable hasta que se valida) y
   **"Editar"** (requiere selección en el grid, Fideicomiso bloqueado).
   Esto mejora la UX sin romper paridad funcional (las dos operaciones
   ya existen, solo se exponen como dos botones en vez de uno
   sobrecargado). **Requiere validar con negocio antes de implementarse**
   como mejora explícita de UX.
9. ~~¿Qué hace "Importar"?~~ **PARCIALMENTE RESUELTO**: es una **carga
   masiva vía Layout** (archivo con formato definido, probablemente
   CSV/TXT de ancho fijo o delimitado) — **distinta** de la carga por
   CIF (HU-04), que es individual y por PDF. **Pendiente**: el usuario
   aún no ha proporcionado la especificación exacta del Layout
   (columnas, delimitador, reglas de validación por lote, manejo de
   errores parciales). Se marca como `[PENDIENTE-ESPECIFICACION]` y se
   documentará como **HU-06** en cuanto se tenga el layout.
