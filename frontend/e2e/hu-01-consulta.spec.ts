import { test, expect } from '@playwright/test';
import { apiCrear, apiBorrar, baseDir } from './helpers';

const CONTRATO_UNO = '1234567890';
const CONTRATO_11 = '777777777';

/**
 * HU-01 — Consulta
 * Escenarios de 20-fase7-pruebas-e2e-y-cierre.md §1.2 (HU-01).
 */

test.describe('HU-01 Consulta', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('buscar por No. de Fideicomiso exacto → resultados correctos', async ({ page }) => {
    await page.getByLabel('No. Fideicomiso').fill(CONTRATO_UNO);
    await page.getByRole('button', { name: 'Consultar' }).click();

    await expect(page.getByTestId('grid-cargando')).toBeHidden({ timeout: 20_000 });
    const footer = page.getByText(/registros$/).filter({ hasText: /\d/ }).first();
    await expect(footer).toBeVisible();
    await expect(page.getByText(CONTRATO_UNO).first()).toBeVisible();
  });

  test('buscar por Tipo de Participante solo → resultados de todos los Fideicomisos', async ({ page }) => {
    await page.getByLabel('Tipo Participante').click();
    await page.getByRole('option', { name: 'Fideicomitente' }).click();
    await page.getByRole('button', { name: 'Consultar' }).click();

    await expect(page.getByTestId('grid-cargando')).toBeHidden({ timeout: 20_000 });
    await expect(page.getByText(/FIDEICOMITENTE/).first()).toBeVisible();
  });

  test('buscar sin ningún criterio → error visible al usuario', async ({ page }) => {
    await page.getByRole('button', { name: 'Consultar' }).click();
    await expect(page.getByText('Debe seleccionar al menos un criterio de búsqueda')).toBeVisible();
  });

  test('buscar un Fideicomiso inexistente → mensaje "no existe información"', async ({ page }) => {
    await page.getByLabel('No. Fideicomiso').fill('9999999999');
    await page.getByRole('button', { name: 'Consultar' }).click();

    await expect(
      page.getByText('No existe información para los criterios de búsqueda seleccionados.'),
    ).toBeVisible();
  });

  test('grid con 11+ registros → paginación fija (1–10 / 11–11)', async ({ request, page }) => {
    const creados = [];
    for (let num = 1; num <= 11; num++) {
      await apiCrear(
        request,
        baseDir({
          fideicomisoId: CONTRATO_11,
          numeroParticipante: String(num),
          calle: `CALLE CERO MASIVO ${num}`,
        }),
      );
      creados.push({ numContrato: CONTRATO_11, cvePers: 'FIDEICOMITENTE', numPersFid: String(num) });
    }

    try {
      await page.getByLabel('No. Fideicomiso').fill(CONTRATO_11);
      await page.getByRole('button', { name: 'Consultar' }).click();
      await expect(page.getByTestId('grid-cargando')).toBeHidden({ timeout: 20_000 });

      await expect(page.getByText('1–10 de 11 registros')).toBeVisible();
      await page.getByRole('button', { name: 'Siguiente página' }).click();
      await expect(page.getByText('11–11 de 11 registros')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Siguiente página' })).toBeDisabled();
    } finally {
      for (const id of creados) await apiBorrar(request, id);
    }
  });
});