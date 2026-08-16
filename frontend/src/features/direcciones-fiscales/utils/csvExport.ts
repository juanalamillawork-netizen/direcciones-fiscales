import type { DomicilioFiscalRow } from '../types/domicilioFiscal';

export interface CsvExportDatos {
  rows: DomicilioFiscalRow[];
  paises?: ReadonlyMap<number, string>;
  estados?: ReadonlyMap<number, string>;
  regimenes?: ReadonlyMap<number, string>;
}

type Columna = {
  key: string;
  label: string;
  resolver: (row: DomicilioFiscalRow, ctx: CsvExportDatos) => string;
};

const COLUMNAS: Columna[] = [
  { key: 'fideicomisoId', label: 'Fideicomiso', resolver: (r) => r.fideicomisoId },
  { key: 'nombreLegal', label: 'Nombre Fiscal', resolver: (r) => r.nombreLegal ?? '' },
  { key: 'tipoPersona', label: 'Tipo de Participante', resolver: (r) => r.tipoPersona },
  { key: 'numeroParticipante', label: 'No. de Participante', resolver: (r) => r.numeroParticipante },
  { key: 'calle', label: 'Calle', resolver: (r) => r.calle },
  { key: 'numeroExterior', label: 'No. Exterior', resolver: (r) => r.numeroExterior },
  { key: 'numeroInterior', label: 'No. Interior', resolver: (r) => r.numeroInterior ?? '' },
  { key: 'colonia', label: 'Colonia', resolver: (r) => r.colonia },
  { key: 'localidad', label: 'Localidad', resolver: (r) => r.localidad ?? '' },
  { key: 'municipio', label: 'Municipio', resolver: (r) => r.municipio ?? '' },
  {
    key: 'estadoId',
    label: 'Entidad Federativa',
    resolver: (r, { estados }) => (r.estadoId != null ? (estados?.get(r.estadoId) ?? String(r.estadoId)) : '—'),
  },
  {
    key: 'paisId',
    label: 'País',
    resolver: (r, { paises }) => (r.paisId != null ? (paises?.get(r.paisId) ?? String(r.paisId)) : '—'),
  },
  { key: 'codigoPostal', label: 'Código Postal', resolver: (r) => r.codigoPostal },
  { key: 'referencia', label: 'Referencia', resolver: (r) => r.referencia ?? '' },
  { key: 'telefono', label: 'Teléfono', resolver: (r) => r.telefono ?? '' },
  {
    key: 'regimenFiscal',
    label: 'Régimen Fiscal',
    resolver: (r, { regimenes }) => resolverRegimen(r.regimenFiscal, regimenes),
  },
  { key: 'correoElectronico', label: 'Correo Electrónico', resolver: (r) => r.correoElectronico ?? '' },
  { key: 'fechaAlta', label: 'Fecha Alta', resolver: (r) => r.fechaAlta?.slice(0, 10) ?? '' },
  { key: 'fechaUltMod', label: 'Fecha Última Modificación', resolver: (r) => r.fechaUltMod?.slice(0, 10) ?? '' },
];

function resolverRegimen(clave?: string, regimenes?: ReadonlyMap<number, string>): string {
  if (!clave) return '—';
  const numero = Number(clave);
  const descripcion = regimenes?.get(numero);
  if (!Number.isNaN(numero) && descripcion) return descripcion;
  return clave;
}

function escapar(valor: string): string {
  return `"${valor.replace(/"/g, '""')}"`;
}

export function exportarResultadosCSV(datos: CsvExportDatos): string {
  const lineas = [COLUMNAS.map((c) => escapar(c.label)).join(',')];
  for (const row of datos.rows) {
    lineas.push(COLUMNAS.map((c) => escapar(c.resolver(row, datos))).join(','));
  }
  return `\uFEFF${lineas.join('\r\n')}`;
}

export function descargarCSV(nombreArchivo: string, contenido: string): void {
  const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = nombreArchivo;
  anchor.click();
  URL.revokeObjectURL(url);
}
