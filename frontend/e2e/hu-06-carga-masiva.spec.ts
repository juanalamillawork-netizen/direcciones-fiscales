import { test, expect, type Page } from '@playwright/test';
import { RutaArchivos } from './helpers';

const exitosos = (page: Page) => page.locator('span.text-green-700');
const errores = (page: Page) => page.locator('span.text-red-700');

async function importarArchivo(page: Page, ruta: string) {
  await page.getByRole('button', { name: 'Importar' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.locator('input[type=file]').setInputFiles(ruta);
  await expect(page.getByText('Resultado de importación')).toBeVisible({ timeout: 20_000 });
}

test.describe('HU-06 Carga masiva', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('archivo 100% válido → todas las líneas exitosas', async ({ page }) => {
    await importarArchivo(page, RutaArchivos.cargaMasiva3);

    await expect(exitosos(page)).toHaveCount(3);
    await expect(errores(page)).toHaveCount(0);
  });

  test('archivo mixto → conteo correcto y mensajes específicos por línea', async ({ page }) => {
    await importarArchivo(page, RutaArchivos.cargaMasivaMixto);

    await expect(exitosos(page)).toHaveCount(4);
    await expect(errores(page)).toHaveCount(3);

    // Cada línea con error tiene su mensaje específico.
    await expect(page.getByText(/RFC no coincide/)).toBeVisible();
    await expect(page.getByText(/País no encontrado en catálogo: 'MARTE'/)).toBeVisible();
    await expect(page.getByText(/Estado no encontrado en catálogo: 'ATLANTIDA'/)).toBeVisible();
  });

  test('RFC no coincidente → mensaje específico', async ({ page }) => {
    await importarArchivo(page, RutaArchivos.cargaMasivaMixto);
    await expect(page.getByText(/RFC no coincide: archivo='ZZZZ000000ZZ0'/)).toBeVisible();
  });

  test('error de catálogo no aborta el resto del archivo', async ({ page }) => {
    await importarArchivo(page, RutaArchivos.cargaMasivaMixto);
    // El archivo tiene 7 líneas y ninguna se detiene por las que fallan:
    // se listan las 7 (4 exitosas + 3 con error).
    await expect(page.locator('div.divide-y > div')).toHaveCount(7);
    await expect(exitosos(page)).toHaveCount(4);
    await expect(errores(page)).toHaveCount(3);
  });

  test('registro que ya existe → upsert (actualiza, no error)', async ({ page }) => {
    // Primera carga crea los registros.
    await importarArchivo(page, RutaArchivos.cargaMasiva3);
    await expect(exitosos(page)).toHaveCount(3);

    // Segunda carga con el mismo archivo → upsert (sigue siendo exitoso, sin errores).
    await page.getByRole('button', { name: 'Cerrar' }).click();
    await importarArchivo(page, RutaArchivos.cargaMasiva3);
    await expect(exitosos(page)).toHaveCount(3);
    await expect(errores(page)).toHaveCount(0);
  });
});