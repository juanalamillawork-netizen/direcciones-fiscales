import { ApiError } from './direccionesFiscalesApi';
import type { TipoPersonaCatalogo } from './catalogosApi';
import type { DomicilioHeredable } from '../types/domicilioFiscal';

const BASE_URL = import.meta.env.VITE_API_FIDEICOMISOS_URL ?? 'http://localhost:8082';

export interface FideicomisoInfo {
  numContrato: number;
  nombre: string;
}

export interface RfcParticipante {
  rfc: string;
}

export interface NombreParticipante {
  nombre: string;
  tipoPersona: TipoPersonaCatalogo;
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);

  if (!res.ok) {
    let mensaje = `Error del servidor (${res.status})`;
    try {
      const body = await res.json();
      if (body?.mensaje) mensaje = body.mensaje;
    } catch {
      // usar mensaje genérico
    }
    throw new ApiError(mensaje, res.status);
  }

  return res.json() as Promise<T>;
}

export function obtenerFideicomiso(numContrato: number): Promise<FideicomisoInfo> {
  return getJson(`/api/v1/fideicomisos/${numContrato}`);
}

export function obtenerRfcParticipante(
  numContrato: number,
  tipoParticipante: string,
  numParticipante: number,
): Promise<RfcParticipante> {
  return getJson(`/api/v1/fideicomisos/${numContrato}/participantes/${tipoParticipante}/${numParticipante}/rfc`);
}

export function obtenerNombreParticipante(
  numContrato: number,
  tipoParticipante: string,
  numParticipante: number,
): Promise<NombreParticipante> {
  return getJson(`/api/v1/fideicomisos/${numContrato}/participantes/${tipoParticipante}/${numParticipante}/nombre`);
}

export function obtenerDomiciliosHeredables(
  numContrato: number,
  tipoParticipante: string,
  numParticipante: number,
): Promise<DomicilioHeredable[]> {
  const params = new URLSearchParams({
    tipoParticipante,
    numParticipante: String(numParticipante),
  });
  return getJson(`/api/v1/fideicomisos/${numContrato}/domicilios-heredables?${params.toString()}`);
}
