import { ApiError } from './direccionesFiscalesApi';
import type { DatosExtraidosCIF } from '../types/domicilioFiscal';

const BASE_URL = import.meta.env.VITE_API_CIF_URL ?? 'http://localhost:8083';

interface CifProcesarResponseApi {
  calle: string | null;
  numeroExterior: string | null;
  numeroInterior: string | null;
  colonia: string | null;
  localidad: string | null;
  municipio: string | null;
  estado: string | null;
  estadoId: number | null;
  pais: string | null;
  paisId: number | null;
  codigoPostal: string | null;
  referencia: string | null;
  telefono: string | null;
  correoElectronico: string | null;
  regimenFiscal: string | null;
  regimenFiscalId: number | null;
  rfc: string | null;
  nombreOLRazonSocial: string | null;
}

export interface ProcesarCifParams {
  archivo: File;
  fideicomisoId: string;
  tipoParticipante: string;
  numeroParticipante: string;
}

function mapearRespuesta(r: CifProcesarResponseApi): DatosExtraidosCIF {
  return {
    calle: r.calle ?? '',
    numeroExterior: r.numeroExterior ?? '',
    numeroInterior: r.numeroInterior ?? undefined,
    colonia: r.colonia ?? '',
    cp: r.codigoPostal ?? '',
    municipio: r.municipio ?? '',
    estado: r.estado ?? '',
    estadoId: r.estadoId ?? undefined,
    pais: r.pais ?? '',
    paisId: r.paisId ?? undefined,
    localidad: r.localidad ?? '',
    rfcValidado: true,
    nombreLegal: r.nombreOLRazonSocial ?? '',
    regimenFiscal: r.regimenFiscal ?? '',
    regimenFiscalId: r.regimenFiscalId ?? undefined,
    telefono: r.telefono ?? '',
    correoElectronico: r.correoElectronico ?? '',
    referencia: r.referencia ?? '',
  };
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

export async function procesarCif({
  archivo,
  fideicomisoId,
  tipoParticipante,
  numeroParticipante,
}: ProcesarCifParams): Promise<DatosExtraidosCIF> {
  const formData = new FormData();
  formData.append('file', archivo);
  formData.append('fideicomisoId', fideicomisoId);
  formData.append('tipoParticipante', tipoParticipante);
  formData.append('numeroParticipante', numeroParticipante);

  const res = await fetch(`${BASE_URL}/api/v1/cif/procesar`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    throw new ApiError(await extraerMensaje(res), res.status);
  }

  const raw = (await res.json()) as CifProcesarResponseApi;
  return mapearRespuesta(raw);
}