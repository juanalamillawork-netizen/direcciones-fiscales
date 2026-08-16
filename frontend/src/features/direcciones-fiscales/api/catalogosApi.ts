import { ApiError } from './direccionesFiscalesApi';
import type { PaisCatalogo, EstadoCatalogo, RegimenFiscalCatalogo } from '../types/catalogos';

const BASE_URL = import.meta.env.VITE_API_DIRECCIONES_FISCALES_URL ?? 'http://localhost:8081';

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

export function getPaises(): Promise<PaisCatalogo[]> {
  return getJson('/api/v1/catalogos/paises');
}

export function getEstados(paisId?: number): Promise<EstadoCatalogo[]> {
  const qs = paisId != null ? `?paisId=${paisId}` : '';
  return getJson(`/api/v1/catalogos/estados${qs}`);
}

export type TipoPersonaCatalogo = 'FISICA' | 'MORAL';

export function getRegimenesFiscales(tipoPersona?: TipoPersonaCatalogo): Promise<RegimenFiscalCatalogo[]> {
  const qs = tipoPersona ? `?tipoPersona=${tipoPersona}` : '';
  return getJson(`/api/v1/catalogos/regimenes-fiscales${qs}`);
}
