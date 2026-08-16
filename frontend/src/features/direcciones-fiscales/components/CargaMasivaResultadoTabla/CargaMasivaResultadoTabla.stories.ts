import type { Meta, StoryObj } from '@storybook/react';
import { CargaMasivaResultadoTabla } from './CargaMasivaResultadoTabla';
import type { LineaResultado } from '../../types/domicilioFiscal';

const MOCK_LINEAS_MIXTO: LineaResultado[] = [
  { secuencial: 1, estatus: 'EXITOSO' },
  { secuencial: 2, estatus: 'EXITOSO' },
  { secuencial: 3, estatus: 'ERROR', mensaje: 'RFC no coincide con el participante' },
  { secuencial: 4, estatus: 'EXITOSO' },
  { secuencial: 5, estatus: 'ERROR', mensaje: 'Código Postal debe ser de 5 dígitos' },
];

const MOCK_LINEAS_TODOS_EXITO: LineaResultado[] = [
  { secuencial: 1, estatus: 'EXITOSO' },
  { secuencial: 2, estatus: 'EXITOSO' },
  { secuencial: 3, estatus: 'EXITOSO' },
  { secuencial: 4, estatus: 'EXITOSO' },
];

const MOCK_LINEAS_TODOS_ERROR: LineaResultado[] = [
  { secuencial: 1, estatus: 'ERROR', mensaje: 'Fideicomiso no encontrado' },
  { secuencial: 2, estatus: 'ERROR', mensaje: 'Código Postal debe ser de 5 dígitos' },
  { secuencial: 3, estatus: 'ERROR', mensaje: 'RFC no coincide con el participante' },
];

const MOCK_LINEAS_NEGOCIO: LineaResultado[] = [
  { secuencial: 1, estatus: 'EXITOSO' },
  { secuencial: 2, estatus: 'ERROR', mensaje: "RFC no coincide: archivo='XAXX010101000' sistema='PELJ800101XXX'" },
  { secuencial: 3, estatus: 'ERROR', mensaje: "País no encontrado en catálogo: 'Colombia'" },
  { secuencial: 4, estatus: 'ERROR', mensaje: 'Error al guardar dirección fiscal: clave única duplicada' },
  { secuencial: 5, estatus: 'EXITOSO' },
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
