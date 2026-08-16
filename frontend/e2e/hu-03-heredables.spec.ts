import { test, expect, type Page } from '@playwright/test';
import { runSql } from './helpers';

const CONTRATO = '1234567890';

function campoIdentificado(page: Page, nombre: string) {
  return page.locator('label').filter({ hasText: nombre }).locator('..').locator('input');
}

async function validarModalHeredes(page: Page, params: {
  fideicomiso: string;
  tipo: string;
  numero: string;
}) {
  await page.getByRole('button', { name: 'Agregar' }).click();
  await page.getByRole('textbox', { name: 'No. de Fideicomiso' }).fill(params.fideicomiso);
  await page.getByRole('textbox', { name: 'No. de Fideicomiso' }).blur();
  // El Tipo de Participante se habilita solo tras validar el Fideicomiso.
  await expect(page.getByRole('combobox', { name: 'Tipo de Participante' })).toBeEnabled();
  await page.getByRole('combobox', { name: 'Tipo de Participante' }).click();
  await page.getByRole('option', { name: params.tipo }).click();
  await page.getByRole('textbox', { name: 'No. de Participante' }).fill(params.numero);
  await page.getByRole('textbox', { name: 'No. de Participante' }).blur();
  await expect(page.getByText('Participante validado correctamente')).toBeVisible();
}

test.describe('HU-03 Heredar domicilio', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('participante con 1 domicilio en DIRECCI → aparece 1 opción y se hereda', async ({ page }) => {
    const calle = 'CALLE UNICA E2E';
    const sql = `INSERT INTO direcci (dir_num_contrato, dir_cve_pers_fid, dir_num_pers_fid, dir_num_sec_direcc, dir_cve_tipo_domic, dir_calle_num, dir_nom_colonia, dir_nom_poblacion, dir_nom_estado, dir_num_estado, dir_nom_pais, dir_num_pais, dir_codigo_postal, dir_cve_st_direcc) VALUES (1234567890, 'FIDEICOMITENTE', 3, 1, 'PARTICULAR', '${calle}', 'CENTRO', 'CIUDAD DE MEXICO', 'CIUDAD DE MEXICO', 9, 'MEXICO', 1, '06000', 'ACTIVO') ON CONFLICT DO NOTHING`;
    try {
      runSql(sql);

      await validarModalHeredes(page, { fideicomiso: CONTRATO, tipo: 'Fideicomitente', numero: '3' });
      await page.getByRole('button', { name: 'Heredar Domicilio' }).click();

      await expect(page.getByTitle('Seleccionar domicilio')).toHaveCount(1);
      await expect(page.getByText(calle)).toBeVisible();

      await page.getByTitle('Seleccionar domicilio').click();
      await expect(page.getByPlaceholder('Calle', { exact: true })).toHaveValue(calle);
      await expect(page.getByText('Datos Heredados del Domicilio registrado')).toBeVisible();
    } finally {
      runSql(`DELETE FROM direcci WHERE dir_num_contrato=1234567890 AND dir_cve_pers_fid='FIDEICOMITENTE' AND dir_num_pers_fid=3`);
    }
  });

  test('participante con varios domicilios → todas las opciones, sin duplicados', async ({ page }) => {
    await validarModalHeredes(page, { fideicomiso: CONTRATO, tipo: 'Fideicomitente', numero: '2' });
    await page.getByRole('button', { name: 'Heredar Domicilio' }).click();

    const seleccionables = page.getByTitle('Seleccionar domicilio');
    await expect(seleccionables).toHaveCount(2);

    const calles = await page
      .locator('span')
      .filter({ hasText: /INSURGENTES|AVILA CAMACHO/ })
      .allTextContents();
    expect(new Set(calles.map((c) => c.trim())).size).toBe(2);
    expect(calles.length).toBeGreaterThanOrEqual(2);
  });

  test('participante sin domicilios → mensaje claro', async ({ page }) => {
    await validarModalHeredes(page, { fideicomiso: CONTRATO, tipo: 'Fideicomisario', numero: '1' });
    await page.getByRole('button', { name: 'Heredar Domicilio' }).click();

    await expect(page.getByText('No hay domicilios heredables para este participante')).toBeVisible();
  });

  test('tras heredar: dirección bloqueada y contacto/régimen editables', async ({ page }) => {
    await validarModalHeredes(page, { fideicomiso: CONTRATO, tipo: 'Fideicomitente', numero: '2' });
    await page.getByRole('button', { name: 'Heredar Domicilio' }).click();
    await page.getByTitle('Seleccionar domicilio').first().click();

    for (const campo of [
      page.getByPlaceholder('Calle', { exact: true }),
      page.getByPlaceholder('Colonia', { exact: true }),
      page.getByPlaceholder('5 dígitos', { exact: true }),
    ]) {
      await expect(campo).toBeDisabled();
    }
    for (const campo of [
      page.getByPlaceholder('Teléfono', { exact: true }),
      page.getByPlaceholder('Referencia (entre calles, notas)', { exact: true }),
      page.getByPlaceholder('Correo electrónico', { exact: true }),
    ]) {
      await expect(campo).toBeEnabled();
    }
    await expect(page.getByRole('combobox', { name: 'Régimen Fiscal' })).toBeEnabled();
  });

  test('la identidad no se pierde al heredar', async ({ page }) => {
    await validarModalHeredes(page, { fideicomiso: CONTRATO, tipo: 'Fideicomitente', numero: '1' });

    const nombreFid = campoIdentificado(page, 'Nombre del Fideicomiso');
    const rfc = campoIdentificado(page, 'RFC');
    const nombreFiscal = campoIdentificado(page, 'Nombre Fiscal');

    await expect(nombreFid).toHaveValue(/[A-Z0-9]/);
    await expect(rfc).toHaveValue(/[A-Z0-9]/);
    await expect(nombreFiscal).toHaveValue(/[A-Z0-9]/);

    await page.getByRole('button', { name: 'Heredar Domicilio' }).click();
    await page.getByTitle('Seleccionar domicilio').first().click();

    await expect(nombreFid).toHaveValue(/[A-Z0-9]/);
    await expect(rfc).toHaveValue(/[A-Z0-9]/);
    await expect(nombreFiscal).toHaveValue(/[A-Z0-9]/);
  });
});