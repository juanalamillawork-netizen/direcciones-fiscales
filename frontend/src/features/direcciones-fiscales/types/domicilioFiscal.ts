export interface BusquedaCriterios {
  numeroFideicomiso: string;
  tipoParticipante: string;
}

export interface DomicilioFiscalRow {
  fideicomisoId: string;
  tipoPersona: string;
  numeroParticipante: string;
  calle: string;
  numeroExterior: string;
  numeroInterior?: string;
  colonia: string;
  localidad?: string;
  municipio?: string;
  paisId?: number;
  estadoId?: number;
  codigoPostal: string;
  referencia?: string;
  telefono?: string;
  regimenFiscal?: string;
  correoElectronico?: string;
  nombreLegal?: string;
  fechaAlta?: string;
  fechaUltMod?: string;
}

export type ModoFormulario = 'consulta' | 'alta' | 'modificar' | 'eliminar';

export interface Estado {
  id: string;
  nombre: string;
  paisId: string;
}

export interface RegimenFiscal {
  id: string;
  descripcion: string;
  aplicaFisica: boolean;
  aplicaMoral: boolean;
}

export interface DomicilioFiscalFormData {
  fideicomiso: string;
  tipoParticipante: string;
  noParticipante: string;
  nombreFideicomiso: string;
  rfc: string;
  nombreFiscal: string;
  nombreLegal: string;
  calle: string;
  numeroExterior: string;
  numeroInterior: string;
  colonia: string;
  municipio: string;
  localidad: string;
  pais: string;
  estado: string;
  codigoPostal: string;
  referencia: string;
  telefono: string;
  regimenFiscal: string;
  correoElectronico: string;
  tipoPersonaCatalogo?: 'FISICA' | 'MORAL';
}

export interface DomicilioHeredable {
  calle: string;
  numeroExterior: string;
  colonia: string;
  poblacion: string;
  municipio?: string;
  estado: string;
  estadoId?: number;
  pais: string;
  paisId?: number;
  codigoPostal: string;
  nombreLegal?: string;
  tipoDomicilio?: string;
  numSecDirecc?: number;
}

export interface DatosExtraidosCIF {
  calle: string;
  numeroExterior: string;
  numeroInterior?: string;
  colonia: string;
  cp: string;
  municipio: string;
  localidad?: string;
  estado: string;
  estadoId?: number;
  pais: string;
  paisId?: number;
  rfcValidado: boolean;
  nombreLegal?: string;
  regimenFiscal?: string;
  regimenFiscalId?: number;
  telefono?: string;
  correoElectronico?: string;
  referencia?: string;
}

export type OrigenDato = 'MANUAL' | 'HEREDADO_GRID' | 'CIF_PDF';

export const TIPOS_PARTICIPANTE = [
  { value: 'FIDEICOMITENTE', label: 'Fideicomitente' },
  { value: 'FIDEICOMISARIO', label: 'Fideicomisario' },
  { value: 'TERCERO', label: 'Tercero' },
] as const;

export const PAISES = [
  { value: '1', label: 'México' },
] as const;

export interface LineaResultado {
  secuencial: number;
  estatus: 'EXITOSO' | 'ERROR';
  mensaje?: string;
}

export interface ResultadoCargaMasiva {
  loteId: string;
  totalRegistros: number;
  registrosExitosos: number;
  registrosConError: number;
  lineas: LineaResultado[];
}
