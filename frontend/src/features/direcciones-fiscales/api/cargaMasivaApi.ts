import { ApiError } from './direccionesFiscalesApi';
import type { LineaResultado, ResultadoCargaMasiva } from '../types/domicilioFiscal';

const BASE_URL = import.meta.env.VITE_API_CARGA_MASIVA_URL ?? 'http://localhost:8084';

interface LineaDetalleResponseApi {
  numLinea: number;
  fideicomiso?: string | null;
  tipoParticipante?: string | null;
  numParticipante?: string | null;
  rfcArchivo?: string | null;
  rfcSistema?: string | null;
  nacionalidad?: string | null;
  telefono?: string | null;
  clavePaisLada?: string | null;
  correoElectronico?: string | null;
  calle?: string | null;
  numeroExterior?: string | null;
  numeroInterior?: string | null;
  colonia?: string | null;
  municipio?: string | null;
  localidad?: string | null;
  codigoPostal?: string | null;
  pais?: string | null;
  estado?: string | null;
  regimenFiscal?: string | null;
  regimenFiscalDescripcion?: string | null;
  estatus: string;
  mensaje?: string | null;
}

interface LoteDetalleResponseApi {
  loteId: string;
  totalRegistros: number;
  registrosExitosos: number;
  registrosConError: number;
  lineas: LineaDetalleResponseApi[];
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

function mapearEstatus(estatus: string): LineaResultado['estatus'] {
  return estatus === 'A' ? 'EXITOSO' : 'ERROR';
}

function mapearRespuesta(r: LoteDetalleResponseApi): ResultadoCargaMasiva {
  return {
    loteId: r.loteId,
    totalRegistros: r.totalRegistros,
    registrosExitosos: r.registrosExitosos,
    registrosConError: r.registrosConError,
    lineas: r.lineas.map((l) => ({
      secuencial: l.numLinea,
      fideicomiso: l.fideicomiso ?? undefined,
      tipoParticipante: l.tipoParticipante ?? undefined,
      numeroParticipante: l.numParticipante ?? undefined,
      rfc: l.rfcArchivo ?? l.rfcSistema ?? undefined,
      nacionalidad: l.nacionalidad ?? undefined,
      telefono: l.telefono ?? undefined,
      clavePaisLada: l.clavePaisLada ?? undefined,
      correoElectronico: l.correoElectronico ?? undefined,
      calle: l.calle ?? undefined,
      numeroExterior: l.numeroExterior ?? undefined,
      numeroInterior: l.numeroInterior ?? undefined,
      colonia: l.colonia ?? undefined,
      municipio: l.municipio ?? undefined,
      localidad: l.localidad ?? undefined,
      codigoPostal: l.codigoPostal ?? undefined,
      pais: l.pais ?? undefined,
      estado: l.estado ?? undefined,
      regimenFiscal: l.regimenFiscal ?? undefined,
      regimenFiscalDescripcion: l.regimenFiscalDescripcion ?? undefined,
      estatus: mapearEstatus(l.estatus),
      mensaje: l.estatus === 'E' ? (l.mensaje || 'Error desconocido') : undefined,
    })),
  };
}

export async function procesarCargaMasiva(
  archivo: File,
  usuario = 'SISTEMA',
): Promise<ResultadoCargaMasiva> {
  const formData = new FormData();
  formData.append('archivo', archivo);
  formData.append('usuario', usuario);

  const res = await fetch(`${BASE_URL}/api/v1/carga-masiva/direcciones-fiscales`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    throw new ApiError(await extraerMensaje(res), res.status);
  }

  const raw = (await res.json()) as LoteDetalleResponseApi;
  return mapearRespuesta(raw);
}