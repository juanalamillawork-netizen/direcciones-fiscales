import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { type APIRequestContext } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Raíz del repositorio (dos niveles arriba de `frontend/e2e`). */
export const RAIZ = path.resolve(__dirname, '..', '..');

export const RutaArchivos = {
  cifAlejandra: path.join(RAIZ, 'ALEJANDRA DE LA TORRE VERDUZCO CSF.pdf'),
  cifNaturalFoods: path.join(RAIZ, 'cedula fiscal Naturalfoods.pdf'),
  cargaMasiva3: path.join(RAIZ, 'CargaMasiva_3_Exitosas.txt'),
  cargaMasivaMixto: path.join(RAIZ, 'CargaMasiva_4_Exitosas_3_Errores.txt'),
  noPdf: path.join(RAIZ, 'frontend', 'package.json'),
} as const;

export const apiUrlDireccion =
  process.env.E2E_API_DIRECCIONES ?? 'http://localhost:8081';

export interface Identidad {
  numContrato: string;
  cvePers: string;
  numPersFid: string;
}

export function baseDir(body: Record<string, unknown> = {}) {
  return {
    fideicomisoId: '1234567890',
    tipoPersona: 'FIDEICOMITENTE',
    numeroParticipante: '1',
    calle: 'AV. PRUEBA E2E',
    numeroExterior: '100',
    numeroInterior: '',
    colonia: 'CENTRO',
    municipio: 'CUAUHTEMOC',
    localidad: 'CUAUHTEMOC',
    paisId: 1,
    estadoId: 9,
    codigoPostal: '06000',
    referencia: '',
    telefono: '5512345678',
    regimenFiscal: '605',
    correoElectronico: 'e2e@prueba.com',
    ...body,
  };
}

export async function apiObtener(
  request: APIRequestContext,
  id: Identidad,
): Promise<Record<string, unknown> | null> {
  const res = await request.get(
    `${apiUrlDireccion}/api/v1/direcciones-fiscales/${id.numContrato}/${id.cvePers}/${id.numPersFid}`,
  );
  if (res.status() === 404) return null;
  if (!res.ok) throw new Error(`GET falló con ${res.status()}: ${await res.text()}`);
  return (await res.json()) as Record<string, unknown>;
}

export async function apiCrear(
  request: APIRequestContext,
  body: Record<string, unknown>,
): Promise<void> {
  const res = await request.post(`${apiUrlDireccion}/api/v1/direcciones-fiscales`, {
    data: body,
  });
  if (!res.ok) {
    throw new Error(
      `POST /direcciones-fiscales respondió ${res.status()}: ${await res.text()}`,
    );
  }
}

export async function apiBorrar(request: APIRequestContext, id: Identidad): Promise<void> {
  const res = await request.delete(
    `${apiUrlDireccion}/api/v1/direcciones-fiscales/${id.numContrato}/${id.cvePers}/${id.numPersFid}`,
  );
  if (res.status() !== 204 && res.status() !== 404) {
    throw new Error(`DELETE respondió ${res.status()}: ${await res.text()}`);
  }
}

export const DB_PSQL =
  process.env.E2E_DB_CARGO ??
  'docker exec direcciones-fiscales-db psql -U labuser -d direcciones_fiscales -t -A';

/** Ejecuta SQL directo contra la BD del laboratorio (para data-mápo determinista). */
export function runSql(sql: string): string {
  return execSync(`${DB_PSQL} -c ${JSON.stringify(sql)}`, { encoding: 'utf8' }).trim();
}