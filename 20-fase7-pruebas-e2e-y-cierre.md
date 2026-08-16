# Fase 7 — Pruebas End-to-End y Cierre de Brecha

> Última fase del laboratorio: verificar el sistema completo de punta a
> punta, confirmar paridad funcional contra la pantalla legada, y dejar
> documentado el historial de decisiones para quien retome el proyecto.

---

## 1. Plan de pruebas E2E (Playwright)

### 1.1 Alcance
Pruebas que ejerciten el flujo completo **a través de la UI real**,
contra los 4 microservicios corriendo (no mocks) — a diferencia de las
pruebas de Storybook/Vitest ya existentes, que usan mocks.

### 1.2 Escenarios por Historia de Usuario

**HU-01 — Consulta**
- [ ] Buscar por No. de Fideicomiso exacto → resultados correctos.
- [ ] Buscar por Tipo de Participante solo → resultados de todos los Fideicomisos que aplican.
- [ ] Buscar sin ningún criterio → error 400 visible al usuario.
- [ ] Buscar un Fideicomiso inexistente → mensaje "no existe información".
- [ ] Grid con 11+ registros → scroll interno, ancho/paginación fijos (ya verificado manualmente, formalizar como test).

**HU-02 — Alta manual**
- [ ] Alta completa: validar Fideicomiso → validar Participante → llenar domicilio → Aceptar → aparece en el grid.
- [ ] Alta con Fideicomiso inexistente → error claro, no permite avanzar.
- [ ] Alta con Participante inexistente → error claro.
- [ ] Alta duplicada (mismo Fideicomiso+Participante+No.) → 409, modal no se cierra.
- [ ] Régimen Fiscal solo muestra opciones del tipo de persona correcto.
- [ ] No. de Fideicomiso y No. de Participante rechazan letras.

**HU-03 — Heredar domicilio**
- [ ] Participante con 1 domicilio en `DIRECCI` → aparece 1 opción, se hereda correctamente.
- [ ] Participante con varios domicilios (casa/oficina/empresa) → todas las opciones aparecen, cada una con sus propios datos (no duplicados).
- [ ] Participante sin domicilios → mensaje claro, no un grid vacío sin explicación.
- [ ] Tras heredar: Calle/Colonia/CP/País/Estado/Municipio bloqueados; Teléfono/Referencia/Correo/Régimen Fiscal editables.
- [ ] Identidad (Nombre Fideicomiso/Participante/RFC/Nombre Fiscal) no se pierde al heredar.

**HU-04 — Cargar CIF**
- [ ] CIF de persona física (`ALEJANDRA_DE_LA_TORRE_VERDUZCO_CSF.pdf`) con RFC coincidente → precarga correcta.
- [ ] CIF de persona moral (`cedula_fiscal_Naturalfoods.pdf`) con RFC coincidente → precarga correcta.
- [ ] CIF con RFC que NO coincide con el participante validado → 409, no precarga nada.
- [ ] Archivo no-PDF o corrupto → error claro, no 500.
- [ ] Régimen Fiscal se extrae correctamente (primer régimen listado, con el prefijo "Régimen de" resuelto).

**HU-05 — Modificar / Eliminar**
- [ ] Modificar: abre con datos reales, incluyendo Nombre del Fideicomiso/RFC ya resueltos.
- [ ] Modificar y guardar → cambios persisten, grid se refresca.
- [ ] Eliminar: confirmación con datos completos, cancelar no borra nada.
- [ ] Eliminar confirmado → registro desaparece del grid, DELETE físico confirmado en BD.
- [ ] Eliminar un registro que ya no existe (borrado por otra sesión) → 404 manejado.

**HU-06 — Carga masiva**
- [ ] Archivo 100% válido → todas las líneas exitosas.
- [ ] Archivo mixto (éxitos + errores) → conteo correcto, cada línea de error con su mensaje específico visible.
- [ ] Error de RFC no coincidente → mensaje específico.
- [ ] Error de catálogo (País/Estado no encontrado) → mensaje específico, línea no aborta el resto del archivo.
- [ ] Registro que ya existe (mismo Fideicomiso+Participante+No.) → upsert (actualiza, no error).

### 1.3 Prompt sugerido para OpenCode

> "Implementa pruebas E2E con Playwright para los escenarios listados en
> `20-fase7-pruebas-e2e-y-cierre.md` §1.2, contra los 4 microservicios
> corriendo localmente (no mocks). Organiza los tests por Historia de
> Usuario (`e2e/hu-01-consulta.spec.ts`, `e2e/hu-02-alta.spec.ts`,
> etc.). Usa los datos semilla ya sembrados en la base de datos del
> laboratorio (Fideicomisos `1234567890`, `555555555`, `777777777`,
> `222222222`, etc.) en vez de crear datos nuevos en cada test, para
> evitar dependencias frágiles entre corridas. Documenta en el README
> del proyecto cómo levantar los 4 servicios + Postgres antes de correr
> la suite E2E."

---

## 2. Checklist de paridad funcional vs. pantalla legada (JSF/PrimeFaces)

| Funcionalidad original | Estado en la migración |
|---|---|
| Consulta con grid + criterios (Fideicomiso, Tipo Participante) | ✅ Migrado |
| Botones Consultar/Limpiar/Exportar Consulta | ✅ Consultar/Limpiar implementados. ⏳ Exportar Consulta — **pendiente de conectar** (componente existe, falta el endpoint/lógica real de exportación CSV) |
| Botón Mantenimiento → Alta/Modificar/Baja/Cerrar | ✅ Rediseñado como "Agregar" (alta directa) + íconos de editar/eliminar por fila — mejora de UX aprobada, no paridad literal |
| Modal Dirección Fiscal con 3 modos (Consulta/Alta/Modificar) | ✅ Migrado, con modo adicional "Eliminar" |
| Campos bloqueados (Fideicomiso, Participante, No., Nombre Fideicomiso, Nombre Participante, RFC, Nombre Fiscal) | ✅ Migrado |
| Nombre Legal vs. Nombre Fiscal (terminología corregida) | ✅ Migrado con aclaración de negocio |
| Heredar domicilio desde grid relacionado (`DIRECCI`) | ✅ Migrado, incluye múltiples domicilios por participante |
| Cargar CIF con validación cruzada de RFC | ✅ Migrado |
| Botón "Valida Régimen Fiscal" | ❌ **Eliminado deliberadamente** — redundante, el combo ya filtra por tipo de persona (decisión de negocio, no una brecha) |
| Importar (carga masiva por layout) | ✅ Migrado |
| Correo Electrónico (defecto legado: no se persistía) | ✅ **Corregido** — ahora se persiste (`dif_mail`, columna nueva aprobada) |
| Municipio/Alcaldía en domicilios heredables | ✅ **Corregido** — `DIRECCI` no lo tenía, se agregó (`dir_nom_mun_alcaldia`) |

**Pendiente de definir antes de considerar el laboratorio 100% cerrado:**
- [ ] Formato exacto de "Exportar Consulta" (¿CSV, Excel?) y su implementación real.
- [ ] BFF/Gateway (Fase 4 del plan original) — evaluado como opcional, no se implementó; confirmar si se requiere para producción real o el laboratorio se considera completo sin él.

---

## 3. Historial de decisiones clave (resumen para referencia)

Esto documenta las veces que una regla de negocio se confirmó, se
cuestionó, y a veces se revirtió — útil para que quien retome el
proyecto no repita las mismas preguntas:

1. **Spring Boot 3.5 → 4.1**: la versión original quedó EOL a mitad del
   laboratorio; se migró sin impacto en las decisiones de negocio.
2. **`DIRECCI` — múltiples domicilios por participante**: se confirmó
   que NO (solo uno), luego se **revirtió** — SÍ permite varios (casa/
   oficina/empresa), usando `dir_num_sec_direcc` como parte de la llave.
3. **Nombre Fiscal**: inicialmente documentado como editable (250
   caracteres) — se corrigió: es automático/no editable, igual que RFC.
4. **Nombre Comercial**: se pidió agregar como campo nuevo, después se
   **revirtió por completo** — no existe.
5. **Correo Electrónico**: defecto legado (no se persistía) → se
   **corrigió**, agregando `dif_mail` a `DIRECCIF` (excepción aprobada
   a la regla de inmutabilidad de esa tabla).
6. **País/Estado en `DIRECCI`**: se implementó una resolución de texto→
   ID innecesaria: la tabla siempre tuvo `dir_num_pais`/`dir_num_estado`
   numéricos, solo se habían pasado por alto.
7. **Botón "Valida Régimen Fiscal"**: se agregó y luego se **eliminó**
   por redundante.

---

## 4. Siguientes pasos sugeridos (fuera del alcance de este laboratorio)

- Pruebas de carga/rendimiento (el laboratorio se probó con volúmenes
  pequeños, 11 registros máximo).
- Seguridad: autenticación/autorización entre servicios (no se
  implementó, fuera de alcance del ejercicio SDD).
- CI/CD para los 4 microservicios + frontend.
- Documentación de despliegue (Docker Compose de producción, más allá
  del `docker-compose.yml` de desarrollo local).
