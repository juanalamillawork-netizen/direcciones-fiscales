import { test, expect, type Page } from '@playwright/test';
import { RutaArchivos } from './helpers';

async function validarModalCif(page: Page, params: {
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

async function abrirVistaCif(page: Page) {
  await page.getByRole('button', { name: 'Cargar CIF' }).click();
  await expect(page.getByText('Cargue el PDF del CIF')).toBeVisible();
}

async function subirCif(page: Page, ruta: string) {
  await page.locator('input[type=file]').setInputFiles(ruta);
}

test.describe('HU-04 Cargar CIF', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });
  test.setTimeout(120000);

  test('CIF persona física con RFC coincidente → precarga correcta', async ({ page }) => {
    test.setTimeout(120000);
    await validarModalCif(page, { fideicomiso: '1234567890', tipo: 'Fideicomitente', numero: '3' });
    await abrirVistaCif(page);
    await subirCif(page, RutaArchivos.cifAlejandra);

    // El modal vuelve al formulario con el banner de origen CIF y los datos precargados.
    await expect(page.getByText('Datos extraídos del CIF — verifique la información')).toBeVisible();
    await expect(page.getByPlaceholder('Calle', { exact: true })).toHaveValue(/AUTOPISTA MEXICO QUERETARO/);
    await expect(page.getByPlaceholder('Colonia', { exact: true })).toHaveValue(/PARQUE INDUSTRIAL CUAMATLA/);
    await expect(page.getByPlaceholder('Teléfono', { exact: true })).toHaveValue('');
    await expect(page.getByPlaceholder('Correo electrónico', { exact: true })).toHaveValue('');
    await expect(page.getByPlaceholder('Referencia (entre calles, notas)', { exact: true })).toHaveValue('');
  });

  test('CIF persona moral con RFC coincidente → precarga correcta', async ({ page }) => {
    test.setTimeout(120000);
    await validarModalCif(page, { fideicomiso: '555555555', tipo: 'Fideicomisario', numero: '1' });
    await abrirVistaCif(page);
    await subirCif(page, RutaArchivos.cifNaturalFoods);

    await expect(page.getByText('Datos extraídos del CIF — verifique la información')).toBeVisible({ timeout: 90000 });
    await expect(page.getByPlaceholder('Calle', { exact: true })).toHaveValue('CARRETERA FEDERAL LIBRE IRAPUATO-GUANAJUATO');
    await expect(page.getByPlaceholder('Correo electrónico', { exact: true })).toHaveValue('patricio.gomez@naturalfoods.com.mx');
    await expect(page.getByPlaceholder('Teléfono', { exact: true })).toHaveValue('');
    await expect(page.getByPlaceholder('Referencia (entre calles, notas)', { exact: true })).toHaveValue('CALLE SIN NOMBRE/CALLE SIN NOMBRE');
  });

  test('CIF con RFC que NO coincide → 409, no precarga nada', async ({ page }) => {
    // Participante 1 de 1234567890 tiene otro RFC (no TOVA…).
    await validarModalCif(page, { fideicomiso: '1234567890', tipo: 'Fideicomitente', numero: '1' });
    await abrirVistaCif(page);
    await subirCif(page, RutaArchivos.cifAlejandra);

    await expect(
      page.getByText('El RFC del CIF no coincide con el RFC registrado para este participante. No se puede cargar el domicilio.'),
    ).toBeVisible();
  });

  test('archivo no-PDF → error claro, sin 500', async ({ page }) => {
    await validarModalCif(page, { fideicomiso: '1234567890', tipo: 'Fideicomitente', numero: '3' });
    await abrirVistaCif(page);
    await subirCif(page, RutaArchivos.noPdf);

    await expect(page.getByText('Solo se aceptan archivos PDF.')).toBeVisible();
  });

  test('régimen fiscal se extrae con el prefijo "Régimen de" resuelto', async ({ page }) => {
    test.setTimeout(120000);
    await validarModalCif(page, { fideicomiso: '1234567890', tipo: 'Fideicomitente', numero: '3' });
    await abrirVistaCif(page);
    await subirCif(page, RutaArchivos.cifAlejandra);

    await expect(page.getByText('Datos extraídos del CIF — verifique la información')).toBeVisible({ timeout: 90000 });
    await expect(page.getByRole('combobox', { name: 'Régimen Fiscal' })).toContainText(/Ingresos por Dividendos/);
  });
});