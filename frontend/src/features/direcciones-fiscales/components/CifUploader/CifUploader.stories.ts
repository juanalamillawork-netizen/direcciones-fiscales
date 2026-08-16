import type { Meta, StoryObj } from '@storybook/react';
import { CifUploader } from './CifUploader';
import { catalogosFetchDecorator } from '../../../../../.storybook/catalogosMock';
import type { DatosExtraidosCIF } from '../../types/domicilioFiscal';

const MOCK_DATOS: DatosExtraidosCIF = {
  calle: 'Av. Paseo de la Reforma',
  numeroExterior: '250',
  numeroInterior: 'Piso 12',
  colonia: 'Juárez',
  cp: '06600',
  municipio: 'Cuauhtémoc',
  localidad: 'Centro',
  estado: 'CIUDAD DE MÉXICO',
  estadoId: 9,
  pais: 'México',
  paisId: 484,
  rfcValidado: true,
  nombreLegal: 'Persona Física o Moral S.A. de C.V.',
  regimenFiscal: 'Régimen de Ingresos por Dividendos (socios y accionistas)',
  regimenFiscalId: 611,
  telefono: '5551234567',
};

const meta = {
  title: 'DireccionesFiscales/CifUploader',
  component: CifUploader,
  parameters: { layout: 'centered' },
  decorators: [catalogosFetchDecorator()],
} satisfies Meta<typeof CifUploader>;

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

export const Exito: Story = {
  args: {
    demoStatus: 'exito',
    demoDatos: MOCK_DATOS,
  },
};

export const ErrorFormato: Story = {
  args: {
    demoStatus: 'error-formato',
  },
};

export const ErrorRFC: Story = {
  args: {
    demoStatus: 'error-rfc',
  },
};

export const CargarCIFExitoso: Story = {
  args: {
    fideicomisoId: '1234567890',
    tipoParticipante: 'FIDEICOMITENTE',
    numeroParticipante: '1',
  },
  play: async ({ canvasElement }) => {
    const { userEvent, within, expect, waitFor } = await import('storybook/test');
    const canvas = within(canvasElement);
    const dropZone = canvas.getByText('Seleccionar archivo PDF').closest('[role="button"]') as HTMLElement;
    const fileInput = dropZone.querySelector('input[type="file"]') as HTMLElement;

    const file = new File(['dummy content'], 'cif_ejemplo.pdf', { type: 'application/pdf' });
    Object.defineProperty(file, 'size', { value: 100 * 1024 });

    await userEvent.upload(fileInput, file);

    await waitFor(() => expect(canvas.getByText('CIF procesado correctamente')).toBeInTheDocument(), {
      timeout: 10000,
    });
    expect(canvas.getByText(/Av. Paseo de la Reforma/)).toBeInTheDocument();
  },
};

export const ErrorCargaRFC: Story = {
  args: {
    fideicomisoId: '111111111',
    tipoParticipante: 'FIDEICOMITENTE',
    numeroParticipante: '1',
  },
  play: async ({ canvasElement }) => {
    const { userEvent, within, expect, waitFor } = await import('storybook/test');
    const canvas = within(canvasElement);
    const dropZone = canvas.getByText('Seleccionar archivo PDF').closest('[role="button"]') as HTMLElement;
    const fileInput = dropZone.querySelector('input[type="file"]') as HTMLElement;

    const file = new File(['dummy content'], 'cif_rfc.pdf', { type: 'application/pdf' });
    Object.defineProperty(file, 'size', { value: 100 * 1024 });

    await userEvent.upload(fileInput, file);

    await waitFor(
      () => expect(canvas.getByText(/no coincide con el RFC registrado para este participante/)).toBeInTheDocument(),
      { timeout: 10000 },
    );
  },
};
