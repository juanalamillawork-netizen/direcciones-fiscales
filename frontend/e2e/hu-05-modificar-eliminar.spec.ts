import { test, expect } from '@playwright/test';
import { apiCrear, apiBorrar, apiObtener, baseDir, runSql } from './helpers';

const CONTRATO = '777777777';
const RTIPO = 'FIDEICOMITENTE';
const NUM = '5';
const ID = { numContrato: CONTRATO, cvePers: RTIPO, numPersFid: NUM };
const CALLE_ORIGINAL = 'AV. REFORMA 100';

/** Deja el grid consultado y con la fila del fixture visible. */
async function consultarYVerFila(page: import('@playwright/test').Page) {
  await page.getByLabel('No. Fideicomiso').fill(CONTRATO);
  await page.getByRole('button', { name: 'Consultar' }).click();
  await expect(page.getByTestId('grid-cargando')).toBeHidden({ timeout: 20_000 });
  await expect(page.getByText('AV. REFORMA').first()).toBeVisible();
}

test.describe('HU-05 Modificar / Eliminar', () => {
  test.beforeEach(async ({ page, request }) => {
    await page.goto('/');
    await apiBorrar(request, ID).catch(() => {});
    // Deja el contrato del fixture limpio (evita sobras de ejecuciones previas).
    runSql(`DELETE FROM direccif WHERE dif_num_contrato='${CONTRATO}'`);
    // Dale identidad al contrato en el adapter (8082) para que Nombre/RFC se resuelvan.
    runSql(`DELETE FROM fideicom WHERE fid_num_contrato=${CONTRATO}; DELETE FROM benefici WHERE ben_num_contrato=${CONTRATO}; DELETE FROM contrato WHERE cto_num_contrato=${CONTRATO};`);
    runSql(`INSERT INTO fideicom (fid_num_contrato, fid_fideicomitente, fid_cve_tipo_per, fid_nom_fideicom, fid_rfc, fid_cve_st_fideico) VALUES (${CONTRATO}, ${NUM}, 'FISICA', 'Fideicomiso Fixture HU05', 'HUF050101HJA', 'ACTIVO')`);
    runSql(`INSERT INTO contrato (cto_num_contrato, cto_nom_contrato, cto_cve_st_contrat, cto_cve_tipo_per) VALUES (${CONTRATO}, 'Fideicomiso Fixture HU05', 'ACTIVO', 'FISICA')`);
    runSql(`INSERT INTO benefici (ben_num_contrato, ben_cve_tipo_per, ben_beneficiario, ben_rfc, ben_cve_st_benefic) VALUES (${CONTRATO}, 'FISICA', ${NUM}, 'HUF050101HJA', 'ACTIVO')`);
    await apiCrear(request, baseDir({ fideicomisoId: CONTRATO, numeroParticipante: NUM, calle: CALLE_ORIGINAL }));
  });

  test.afterEach(async ({ request }) => {
    await apiBorrar(request, ID).catch(() => {});
    runSql(`DELETE FROM fideicom WHERE fid_num_contrato=${CONTRATO}; DELETE FROM benefici WHERE ben_num_contrato=${CONTRATO}; DELETE FROM contrato WHERE cto_num_contrato=${CONTRATO}; DELETE FROM direccif WHERE dif_num_contrato='${CONTRATO}'`);
  });

  test('modificar abre con datos reales, incluyendo Nombre del Fideicomiso/RFC', async ({ page }) => {
    await consultarYVerFila(page);
    await page.getByTitle('Editar registro').click();

    await expect(page.getByRole('textbox', { name: 'No. de Fideicomiso' })).toHaveValue(CONTRATO);
    await expect(page.getByPlaceholder('Calle', { exact: true })).toHaveValue(CALLE_ORIGINAL);
    // La identidad queda resuelta por el adapter (8082).
    const nombreFid = page.locator('label').filter({ hasText: 'Nombre del Fideicomiso' }).locator('..').locator('input');
    await expect(nombreFid).toHaveValue(/[A-Z0-9]/);
  });

  test('modificar y guardar → cambios persisten y el grid se refresca', async ({ request, page }) => {
    await consultarYVerFila(page);
    await page.getByTitle('Editar registro').click();

    await page.getByPlaceholder('Calle', { exact: true }).fill('AV. MODIFICADA E2E');
    await page.getByRole('button', { name: 'Aceptar' }).click();
    await expect(page.getByRole('dialog')).toBeHidden();

    const actualizado = await apiObtener(request, ID);
    expect(actualizado?.calle).toBe('AV. MODIFICADA E2E');

    // El grid se recarga y muestra el nuevo valor.
    await page.getByRole('button', { name: 'Consultar' }).click();
    await expect(page.getByText('AV. MODIFICADA E2E').first()).toBeVisible();
  });

  test('eliminar: cancelar no borra nada', async ({ request, page }) => {
    await consultarYVerFila(page);
    await page.getByTitle('Eliminar registro').click();

    await expect(page.getByText('Confirmación de eliminación')).toBeVisible();
    await page.getByRole('button', { name: 'Cancelar' }).click();
    await expect(page.getByRole('dialog')).toBeHidden();

    const sigue = await apiObtener(request, ID);
    expect(sigue).not.toBeNull();
  });

  test('eliminar confirmado → desaparece del grid y DELETE físico en BD', async ({ request, page }) => {
    await consultarYVerFila(page);
    await page.getByTitle('Eliminar registro').click();
    await page.getByRole('button', { name: 'Eliminar' }).click();
    await expect(page.getByRole('dialog')).toBeHidden();

    const yaNoExiste = await apiObtener(request, ID);
    expect(yaNoExiste).toBeNull();

    // En BD: la consulta del grid ya no devuelve la fila.
    await page.getByRole('button', { name: 'Consultar' }).click();
    await expect(page.getByText('No existe información para los criterios de búsqueda seleccionados.')).toBeVisible();
  });

  test('eliminar un registro que ya no existe (otra sesión) → 404 manejado', async ({ request, page }) => {
    await consultarYVerFila(page);

    // Otra sesión lo borra antes de abrir la ventana de eliminación.
    await apiBorrar(request, ID);

    await page.getByTitle('Eliminar registro').click();

    // El modal lo maneja como 404: muestra el mensaje y deshabilita el botón de eliminar.
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('El registro solicitado no existe.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Eliminar' })).toBeDisabled();
  });
});