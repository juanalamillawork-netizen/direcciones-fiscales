import { test, expect } from '@playwright/test';
import { apiCrear, apiBorrar, apiObtener, baseDir } from './helpers';

const CONTRATO = '1234567890';
const RTIPO = 'FIDEICOMITENTE';

async function validarModal(page: import('@playwright/test').Page, params: {
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
}

/** Espera a que el participante se valide (el formulario se habilita). */
async function esperarParticipanteValidado(page: import('@playwright/test').Page) {
  await expect(page.getByText('Participante validado correctamente')).toBeVisible();
}

async function llenarYGuardar(page: import('@playwright/test').Page, calle: string) {
  await expect(page.getByPlaceholder('Calle', { exact: true })).toBeEnabled();
  await page.getByPlaceholder('Calle', { exact: true }).fill(calle);
  await page.getByPlaceholder('No. Exterior', { exact: true }).fill('100');
  await page.getByPlaceholder('Colonia', { exact: true }).fill('CENTRO');
  await page.getByPlaceholder('Municipio/Alcaldía', { exact: true }).fill('CUAUHTEMOC');
  await page.getByPlaceholder('5 dígitos', { exact: true }).fill('06000');
  await page.getByRole('combobox', { name: 'País' }).click();
  await page.getByRole('option', { name: 'México' }).click();
  await page.getByRole('combobox', { name: 'Estado' }).click();
  await page.getByRole('option', { name: 'Ciudad de México' }).click();
  await page.getByRole('combobox', { name: 'Régimen Fiscal' }).click();
  await page.getByRole('option', { name: /^605 —/ }).click();
  await page.getByRole('button', { name: 'Aceptar' }).click();
}

test.describe('HU-02 Alta manual', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('alta completa → aparece en el grid', async ({ request, page }) => {
    const id = { numContrato: CONTRATO, cvePers: RTIPO, numPersFid: '1' };
    await apiBorrar(request, id).catch(() => {});

    await validarModal(page, { fideicomiso: CONTRATO, tipo: 'Fideicomitente', numero: '1' });
    if (await page.getByText('El Participante no existe').isVisible()) {
      test.skip(true, 'El seed del laboratorio no incluye participante 1.');
    }

    await expect(page.getByText('Participante validado correctamente')).toBeVisible();
    await llenarYGuardar(page, 'CALLE ALTA E2E');

    await expect(page.getByRole('dialog')).toBeHidden();

    const creado = await apiObtener(request, id);
    expect(creado?.calle).toBe('CALLE ALTA E2E');
    await apiBorrar(request, id);
  });

  test('alta con Fideicomiso inexistente → error claro, no permite avanzar', async ({ page }) => {
    await page.getByRole('button', { name: 'Agregar' }).click();
    await page.getByRole('textbox', { name: 'No. de Fideicomiso' }).fill('987654321');
    await page.getByRole('textbox', { name: 'No. de Fideicomiso' }).blur();
    await expect(page.getByText('El Fideicomiso no existe')).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'No. de Participante' })).toBeDisabled();
  });

  test('alta con Participante inexistente → error claro', async ({ page }) => {
    await validarModal(page, { fideicomiso: CONTRATO, tipo: 'Fideicomitente', numero: '99' });
    await expect(page.getByText('El Participante no existe')).toBeVisible();
  });

  test('alta duplicada → 409, modal se queda abierto', async ({ request, page }) => {
    const seed = baseDir({ numeroParticipante: '1', calle: 'DUP ALTA E2E' });
    await apiCrear(request, seed);
    try {
      await validarModal(page, { fideicomiso: CONTRATO, tipo: 'Fideicomitente', numero: '1' });
      await llenarYGuardar(page, 'DUP ALTA E2E');
      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(page.getByText(/Ya existe un domicilio fiscal con la misma llave/)).toBeVisible();
    } finally {
      await apiBorrar(request, {
        numContrato: String(seed.fideicomisoId),
        cvePers: RTIPO,
        numPersFid: String(seed.numeroParticipante),
      });
    }
  });

  test('Régimen Fiscal solo ofrece opciones del tipo de persona correcto', async ({ page }) => {
    await validarModal(page, { fideicomiso: CONTRATO, tipo: 'Fideicomitente', numero: '1' });
    if (await page.getByText('El Participante no existe').isVisible()) {
      test.skip(true, 'Participante requerido ausente en el seed');
    }
    await page.getByRole('combobox', { name: 'Régimen Fiscal' }).click();
    await expect(page.getByRole('option', { name: /^601 —/ })).toHaveCount(0);
    await expect(page.getByRole('option', { name: /^605 —/ })).toBeVisible();
  });

  test('No. Fideicomiso y No. Participante rechazan letras', async ({ page }) => {
    await page.getByRole('button', { name: 'Agregar' }).click();
    const fid = page.getByRole('textbox', { name: 'No. de Fideicomiso' });
    // maxLength=10 trunca primero los primeros 10 caracteres del texto ingresado
    // y luego el filtro elimina las letras: 'abc1234567890xyz' → 'abc1234567' → '1234567'.
    await fid.fill(`abc${CONTRATO}xyz`);
    await expect(fid).toHaveValue('1234567');

    await fid.fill(CONTRATO);
    await fid.blur();
    await expect(page.getByRole('combobox', { name: 'Tipo de Participante' })).toBeEnabled();
    await page.getByRole('combobox', { name: 'Tipo de Participante' }).click();
    await page.getByRole('option', { name: 'Fideicomitente' }).click();

    const num = page.getByRole('textbox', { name: 'No. de Participante' });
    // maxLength=2: 'ab1' → '1ab' trunca a '1a' (solo los no-dígitos se descartan),
    // 'ab1' → '1'.
    await num.fill('1ab');
    await expect(num).toHaveValue('1');
    await num.fill('ab1');
    await expect(num).toHaveValue('');
  });
});