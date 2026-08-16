import type { Meta, StoryObj } from '@storybook/react';
import { DomiciliosHeredablesGrid } from './DomiciliosHeredablesGrid';
import type { DomicilioHeredable } from '../../types/domicilioFiscal';

const MOCK_DOMICILIOS: DomicilioHeredable[] = [
  {
    calle: 'Av. Paseo de la Reforma',
    numeroExterior: '250',
    colonia: 'Juárez',
    poblacion: 'Ciudad de México',
    municipio: 'Cuauhtémoc',
    estado: 'Ciudad de México',
    estadoId: 9,
    pais: 'México',
    paisId: 1,
    codigoPostal: '06600',
    tipoDomicilio: 'PARTICULAR',
    numSecDirecc: 1,
    nombreLegal: 'Juan Pérez',
  },
  {
    calle: 'Blvd. Manuel Ávila Camacho',
    numeroExterior: '36',
    colonia: 'Lomas de Chapultepec',
    poblacion: 'Ciudad de México',
    municipio: 'Miguel Hidalgo',
    estado: 'Ciudad de México',
    estadoId: 9,
    pais: 'México',
    paisId: 1,
    codigoPostal: '11000',
    tipoDomicilio: 'OFICINA',
    numSecDirecc: 2,
    nombreLegal: 'Martha López',
  },
  {
    calle: 'Calle Zaragoza',
    numeroExterior: '505',
    colonia: 'Centro',
    poblacion: 'Monterrey',
    municipio: 'Monterrey',
    estado: 'Nuevo León',
    estadoId: 19,
    pais: 'México',
    paisId: 1,
    codigoPostal: '64000',
    tipoDomicilio: 'EMPRESA',
    numSecDirecc: 3,
  },
];

const meta = {
  title: 'DireccionesFiscales/DomiciliosHeredablesGrid',
  component: DomiciliosHeredablesGrid,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof DomiciliosHeredablesGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loading: Story = {
  args: {
    domicilios: [],
    status: 'loading',
  },
};

export const SinResultados: Story = {
  args: {
    domicilios: [],
    status: 'empty',
  },
};

export const WithError: Story = {
  args: {
    domicilios: [],
    status: 'error',
    errorMessage: 'No se pudieron consultar los domicilios heredables.',
  },
};

export const ConDatos: Story = {
  args: {
    domicilios: MOCK_DOMICILIOS,
    status: 'data',
  },
  play: async ({ canvasElement }) => {
    const { expect, userEvent, within, waitFor } = await import('storybook/test');
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText('Av. Paseo de la Reforma 250')).toBeInTheDocument());
    expect(canvas.getByText('Calle')).toBeInTheDocument();
    expect(canvas.getByText('Código Postal')).toBeInTheDocument();
    expect(canvas.queryByText('Tipo de Domicilio')).not.toBeInTheDocument();
    const fila = canvas.getByRole('button', { name: /Av. Paseo de la Reforma 250/ });
    fila.scrollIntoView();
    await userEvent.click(fila);
    await waitFor(() => expect(canvas.getByText(/Tipo de Domicilio/)).toBeInTheDocument());
    expect(canvas.getByText(/PARTICULAR/)).toBeInTheDocument();
    expect(canvas.getByText(/Juan Pérez/)).toBeInTheDocument();
  },
};

export const SeleccionarDomicilio: Story = {
  args: {
    domicilios: MOCK_DOMICILIOS,
    status: 'data',
    onSeleccionar: (domicilio) => {
      // eslint-disable-next-line no-console
      console.log('Domicilio seleccionado:', domicilio);
    },
  },
  play: async ({ canvasElement }) => {
    const { userEvent, within } = await import('storybook/test');
    const canvas = within(canvasElement);
    const firstCheck = canvas.getAllByRole('button', { name: /seleccionar domicilio/i })[0];
    await userEvent.click(firstCheck);
  },
};
