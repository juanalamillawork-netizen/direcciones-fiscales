import type { Meta, StoryObj } from '@storybook/react';
import { CargaMasivaResultadoTabla } from './CargaMasivaResultadoTabla';
import type { LineaResultado } from '../../types/domicilioFiscal';

const MOCK_LINEA_COMPLETA: LineaResultado = {
  secuencial: 1,
  fideicomiso: '1850084029',
  tipoParticipante: 'FIDEICOMITENTE',
  numeroParticipante: '1',
  rfc: 'CABF860205560',
  nacionalidad: 'MEXICANA',
  telefono: '5555000001',
  clavePaisLada: '52',
  correoElectronico: 'uno@prueba.com',
  calle: 'CALLE PRIMERA',
  numeroExterior: '100',
  numeroInterior: '',
  colonia: 'COLONIA CENTRO',
  municipio: 'ECATEPEC DE MORELOS',
  localidad: 'ECATEPEC DE MORELOS',
  codigoPostal: '55100',
  pais: 'MEXICO',
  estado: 'MEXICO',
  regimenFiscal: '605',
  regimenFiscalDescripcion: 'Sueldos y Salarios e Ingresos Asimilados a Salarios',
  estatus: 'EXITOSO',
};

const MOCK_LINEA_ERROR_COMPLETA: LineaResultado = {
  secuencial: 2,
  fideicomiso: '1850084029',
  tipoParticipante: 'FIDEICOMISARIO',
  numeroParticipante: '1',
  rfc: 'BBBB810202BB3',
  nacionalidad: 'MEXICANA',
  telefono: '5555000002',
  clavePaisLada: '52',
  correoElectronico: 'dos@prueba.com',
  calle: 'CALLE SEGUNDA',
  numeroExterior: '200',
  numeroInterior: 'B',
  colonia: 'COLONIA COLORADO',
  municipio: 'NAUCALPAN DE JUAREZ',
  localidad: 'NAUCALPAN DE JUAREZ',
  codigoPostal: '53100',
  pais: 'MEXICO',
  estado: 'MEXICO',
  regimenFiscal: '601',
  regimenFiscalDescripcion: 'Ingresos por Dividendos (socios y accionistas)',
  estatus: 'ERROR',
  mensaje: 'RFC no coincide con el participante',
};

const MOCK_LINEA_TERCERO_COMPLETA: LineaResultado = {
  secuencial: 3,
  fideicomiso: '1850084029',
  tipoParticipante: 'TERCERO',
  numeroParticipante: '1',
  rfc: 'CCCC820303CC4',
  nacionalidad: 'MEXICANA',
  telefono: '5555000003',
  clavePaisLada: '52',
  correoElectronico: 'tres@prueba.com',
  calle: 'CALLE TERCERA',
  numeroExterior: '300',
  numeroInterior: '',
  colonia: 'COLONIA SUR',
  municipio: 'MONTERREY',
  localidad: 'MONTERREY',
  codigoPostal: '64000',
  pais: 'MEXICO',
  estado: 'NUEVO LEON',
  regimenFiscal: '612',
  regimenFiscalDescripcion: 'General de Ley Personas Morales',
  estatus: 'EXITOSO',
};

const MOCK_LINEAS_MIXTO: LineaResultado[] = [
  { ...MOCK_LINEA_COMPLETA, secuencial: 1 },
  { ...MOCK_LINEA_ERROR_COMPLETA, secuencial: 2 },
  { ...MOCK_LINEA_TERCERO_COMPLETA, secuencial: 3 },
  { ...MOCK_LINEA_COMPLETA, secuencial: 4, estatus: 'EXITOSO' },
  { ...MOCK_LINEA_ERROR_COMPLETA, secuencial: 5, mensaje: 'Código Postal debe ser de 5 dígitos' },
];

const MOCK_LINEAS_TODOS_EXITO: LineaResultado[] = [
  { ...MOCK_LINEA_COMPLETA, secuencial: 1 },
  { ...MOCK_LINEA_COMPLETA, secuencial: 2 },
  { ...MOCK_LINEA_COMPLETA, secuencial: 3 },
  { ...MOCK_LINEA_COMPLETA, secuencial: 4 },
];

const MOCK_LINEAS_TODOS_ERROR: LineaResultado[] = [
  { ...MOCK_LINEA_ERROR_COMPLETA, secuencial: 1, mensaje: 'Fideicomiso no encontrado' },
  { ...MOCK_LINEA_ERROR_COMPLETA, secuencial: 2, mensaje: 'Código Postal debe ser de 5 dígitos' },
  { ...MOCK_LINEA_ERROR_COMPLETA, secuencial: 3, mensaje: 'RFC no coincide con el participante' },
];

const MOCK_LINEAS_NEGOCIO: LineaResultado[] = [
  MOCK_LINEA_COMPLETA,
  { ...MOCK_LINEA_ERROR_COMPLETA, secuencial: 2, mensaje: "RFC no coincide: archivo='XAXX010101000' sistema='PELJ800101XXX'" },
  { ...MOCK_LINEA_ERROR_COMPLETA, secuencial: 3, mensaje: "País no encontrado en catálogo: 'Colombia'" },
  { ...MOCK_LINEA_ERROR_COMPLETA, secuencial: 4, mensaje: 'Error al guardar dirección fiscal: clave única duplicada' },
  { ...MOCK_LINEA_COMPLETA, secuencial: 5 },
];

const meta = {
  title: 'DireccionesFiscales/CargaMasivaResultadoTabla',
  component: CargaMasivaResultadoTabla,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof CargaMasivaResultadoTabla>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Vacio: Story = {
  args: {
    lineas: [],
  },
};

export const TodosExitosos: Story = {
  args: {
    lineas: MOCK_LINEAS_TODOS_EXITO,
  },
};

export const Mixto: Story = {
  args: {
    lineas: MOCK_LINEAS_MIXTO,
  },
};

export const TodosError: Story = {
  args: {
    lineas: MOCK_LINEAS_TODOS_ERROR,
  },
};

export const LineasNegocio: Story = {
  args: {
    lineas: MOCK_LINEAS_NEGOCIO,
  },
};
