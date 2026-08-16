import type { DomicilioFiscalRow } from '../types/domicilioFiscal';

const BASE_URL = import.meta.env.VITE_API_DIRECCIONES_FISCALES_URL ?? 'http://localhost:8081';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export interface IdentidadDomicilio {
  numContrato: string;
  cvePers: string;
  numPersFid: string;
}

export interface CrearDomicilioFiscalRequest {
  fideicomisoId: string;
  tipoPersona: string;
  numeroParticipante: string;
  calle: string;
  numeroExterior: string;
  numeroInterior?: string;
  colonia: string;
  municipio: string;
  localidad?: string;
  paisId: number;
  estadoId: number;
  codigoPostal: string;
  referencia?: string;
  telefono?: string;
  regimenFiscal?: string;
  correoElectronico?: string;
}

export interface ActualizarDomicilioFiscalRequest {
  calle: string;
  numeroExterior: string;
  numeroInterior?: string;
  colonia: string;
  municipio: string;
  localidad?: string;
  paisId: number;
  estadoId: number;
  codigoPostal: string;
  referencia?: string;
  telefono?: string;
  regimenFiscal?: string;
  correoElectronico?: string;
}

async function extraerMensaje(res: Response): Promise<string> {
  const texto = await res.text();
  if (!texto) return `Error del servidor (${res.status})`;
  try {
    const json = JSON.parse(texto);
    if (json?.mensaje) return String(json.mensaje);
    if (json?.message) return String(json.message);
  } catch {
    // no era JSON — usar el texto tal cual
  }
  return texto;
}

async function solicitar<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    throw new ApiError(await extraerMensaje(res), res.status);
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}

export async function buscarDireccionesFiscales(
  fideicomisoId?: string,
  tipoPersona?: string,
): Promise<DomicilioFiscalRow[]> {
  const params = new URLSearchParams();
  if (fideicomisoId) params.set('fideicomisoId', fideicomisoId);
  if (tipoPersona) params.set('tipoPersona', tipoPersona);

  const qs = params.toString();
  const url = qs ? `${BASE_URL}/api/v1/direcciones-fiscales?${qs}` : `${BASE_URL}/api/v1/direcciones-fiscales`;
  return solicitar<DomicilioFiscalRow[]>(url);
}

export function obtenerDomicilioFiscal(identidad: IdentidadDomicilio): Promise<DomicilioFiscalRow> {
  const url = `${BASE_URL}/api/v1/direcciones-fiscales/${identidad.numContrato}/${identidad.cvePers}/${identidad.numPersFid}`;
  return solicitar<DomicilioFiscalRow>(url);
}

export function crearDomicilioFiscal(request: CrearDomicilioFiscalRequest): Promise<DomicilioFiscalRow> {
  return solicitar<DomicilioFiscalRow>(`${BASE_URL}/api/v1/direcciones-fiscales`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
}

export function actualizarDomicilioFiscal(
  identidad: IdentidadDomicilio,
  request: ActualizarDomicilioFiscalRequest,
): Promise<DomicilioFiscalRow> {
  const url = `${BASE_URL}/api/v1/direcciones-fiscales/${identidad.numContrato}/${identidad.cvePers}/${identidad.numPersFid}`;
  return solicitar<DomicilioFiscalRow>(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
}

export function eliminarDomicilioFiscal(identidad: IdentidadDomicilio): Promise<void> {
  const url = `${BASE_URL}/api/v1/direcciones-fiscales/${identidad.numContrato}/${identidad.cvePers}/${identidad.numPersFid}`;
  return solicitar<void>(url, { method: 'DELETE' });
}
