import type { Meta, StoryObj } from '@storybook/react';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';
import { CargaMasivaUploader } from './CargaMasivaUploader';
import { catalogosFetchDecorator } from '../../../../../.storybook/catalogosMock';
import type { ResultadoCargaMasiva } from '../../types/domicilioFiscal';

const MOCK_RESULTADO_TODOS_EXITO: ResultadoCargaMasiva = {
  loteId: 'lote-001',
  totalRegistros: 4,
  registrosExitosos: 4,
  registrosConError: 0,
  lineas: [
    { secuencial: 1, estatus: 'EXITOSO' },
    { secuencial: 2, estatus: 'EXITOSO' },
    { secuencial: 3, estatus: 'EXITOSO' },
    { secuencial: 4, estatus: 'EXITOSO' },
  ],
};

const MOCK_RESULTADO_MIXTO: ResultadoCargaMasiva = {
  loteId: 'lote-002',
  totalRegistros: 5,
  registrosExitosos: 3,
  registrosConError: 2,
  lineas: [
    { secuencial: 1, estatus: 'EXITOSO' },
    { secuencial: 2, estatus: 'EXITOSO' },
    { secuencial: 3, estatus: 'ERROR', mensaje: 'RFC no coincide con el participante' },
    { secuencial: 4, estatus: 'EXITOSO' },
    { secuencial: 5, estatus: 'ERROR', mensaje: 'Código Postal debe ser de 5 dígitos' },
  ],
};

const MOCK_RESULTADO_TODOS_ERROR: ResultadoCargaMasiva = {
  loteId: 'lote-003',
  totalRegistros: 3,
  registrosExitosos: 0,
  registrosConError: 3,
  lineas: [
    { secuencial: 1, estatus: 'ERROR', mensaje: 'Fideicomiso no encontrado' },
    { secuencial: 2, estatus: 'ERROR', mensaje: 'CP inválido' },
    { secuencial: 3, estatus: 'ERROR', mensaje: 'RFC no coincide' },
  ],
};

const meta = {
  title: 'DireccionesFiscales/CargaMasivaUploader',
  component: CargaMasivaUploader,
  parameters: { layout: 'centered' },
  decorators: [catalogosFetchDecorator()],
} satisfies Meta<typeof CargaMasivaUploader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Idle: Story = {
  args: {
    demoStatus: 'idle',
  },
};

export const Subiendo: Story = {
  args: {
    demoStatus: 'subiendo',
  },
};

export const Procesando: Story = {
  args: {
    demoStatus: 'procesando',
  },
};

export const CompletadoTodosExitosos: Story = {
  args: {
    demoStatus: 'completado',
    demoResultado: MOCK_RESULTADO_TODOS_EXITO,
  },
};

export const CompletadoMixto: Story = {
  args: {
    demoStatus: 'completado',
    demoResultado: MOCK_RESULTADO_MIXTO,
  },
};

export const CompletadoTodosError: Story = {
  args: {
    demoStatus: 'completado',
    demoResultado: MOCK_RESULTADO_TODOS_ERROR,
  },
};

export const ErrorTecnico: Story = {
  args: {
    demoStatus: 'error',
  },
};

export const UploadReal: Story = {
  args: {
    onArchivoProcesado: (resultado) => {
      // eslint-disable-next-line no-console
      console.log('Archivo procesado:', resultado);
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dropZone = canvas.getByText('Seleccionar archivo .txt').closest('[role="button"]') as HTMLElement;
    const fileInput = dropZone.querySelector('input[type="file"]') as HTMLElement;

    const file = new File(['dummy content'], 'carga_masiva.txt', { type: 'text/plain' });
    Object.defineProperty(file, 'size', { value: 100 * 1024 });

    await userEvent.upload(fileInput, file);

    // El hook real dispara la mutación contra el fetch mockeado: debe terminar
    // en el resumen con las líneas del backend ya mapeadas.
    await waitFor(() => expect(screen.getByText('Archivo procesado')).toBeInTheDocument(), {
      timeout: 5000,
    });
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  },
};
