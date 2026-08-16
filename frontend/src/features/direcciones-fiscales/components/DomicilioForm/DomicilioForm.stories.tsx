import type { Meta, StoryObj } from '@storybook/react';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';
import { DomicilioForm } from './DomicilioForm';
import { catalogosFetchDecorator, catalogosLoadingDecorator } from '../../../../../.storybook/catalogosMock';

const DATA_COMPLETO = {
  fideicomiso: '1234567890',
  tipoParticipante: 'FIDEICOMITENTE',
  noParticipante: '1',
  nombreFideicomiso: 'Fideicomiso Ejemplo Uno',
  rfc: 'PELJ800101XXX',
  nombreFiscal: 'Juan Pérez López',
  nombreLegal: 'Juan Pérez López',
  calle: 'Av. Principal',
  numeroExterior: '123',
  numeroInterior: 'A',
  colonia: 'Colonia Centro',
  municipio: 'Ciudad de México',
  localidad: 'Centro',
  pais: '484',
  estado: '9',
  codigoPostal: '06600',
  referencia: 'Entre calles A y B',
  telefono: '5551234567',
  regimenFiscal: '601',
  correoElectronico: 'correo@ejemplo.com',
};

async function validarAlta(canvas: ReturnType<typeof within>) {
  const fidInput = canvas.getByRole('textbox', { name: 'No. de Fideicomiso' });
  await userEvent.clear(fidInput);
  await userEvent.type(fidInput, '1234567890');
  await userEvent.tab();
  await waitFor(() =>
    expect(canvas.getByDisplayValue('Fideicomiso Ejemplo Uno')).toBeInTheDocument(),
  );

  await userEvent.click(canvas.getByRole('combobox', { name: 'Tipo de Participante' }));
  await userEvent.click(await screen.findByRole('option', { name: 'Fideicomitente' }));

  const noParticipante = canvas.getByRole('textbox', { name: 'No. de Participante' });
  await userEvent.type(noParticipante, '1');
  await userEvent.tab();
  await waitFor(() => expect(canvas.getByDisplayValue('Juan Pérez López')).toBeInTheDocument());
}

const meta = {
  title: 'DireccionesFiscales/DomicilioForm',
  component: DomicilioForm,
  parameters: { layout: 'centered' },
  decorators: [catalogosFetchDecorator()],
  argTypes: {
    onHeredarDomicilio: { action: 'onHeredarDomicilio' },
    onCargarCif: { action: 'onCargarCif' },
  },
} satisfies Meta<typeof DomicilioForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ModoConsulta: Story = {
  args: {
    modo: 'consulta',
    initialData: DATA_COMPLETO,
  },
};

export const ModoAltaInicial: Story = {
  args: {
    modo: 'alta',
    initialData: {},
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole('textbox', { name: 'No. de Fideicomiso' })).toBeEnabled();
    expect(canvas.getByRole('textbox', { name: 'Calle' })).toBeDisabled();
  },
};

export const ModoAltaCompleto: Story = {
  args: {
    modo: 'alta',
    initialData: DATA_COMPLETO,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await validarAlta(canvas);
    expect(canvas.getByRole('textbox', { name: 'Calle' })).toBeEnabled();
  },
};

export const ModoModificar: Story = {
  args: {
    modo: 'modificar',
    initialData: DATA_COMPLETO,
  },
};

export const ConBannerCIF: Story = {
  args: {
    modo: 'modificar',
    initialData: DATA_COMPLETO,
    origen: 'CIF_PDF',
  },
};

export const ConErrorValidacionCP: Story = {
  args: {
    modo: 'alta',
    initialData: { ...DATA_COMPLETO, codigoPostal: 'abc' },
    errorCp: 'El Código Postal debe contener exactamente 5 dígitos numéricos.',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await validarAlta(canvas);
    expect(canvas.getByText('El Código Postal debe contener exactamente 5 dígitos numéricos.')).toBeInTheDocument();
  },
};

export const ConErrorRegimenFiscal: Story = {
  args: {
    modo: 'alta',
    tipoPersona: 'FISICA',
    initialData: DATA_COMPLETO,
    errorRegimen: 'El régimen fiscal seleccionado no corresponde al tipo de persona (física/moral) del participante.',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await validarAlta(canvas);
    expect(
      canvas.getByText('El régimen fiscal seleccionado no corresponde al tipo de persona (física/moral) del participante.'),
    ).toBeInTheDocument();
  },
};

export const SinPaisSeleccionado: Story = {
  args: {
    modo: 'alta',
    initialData: { fideicomiso: '1234567890', tipoParticipante: 'FIDEICOMITENTE', noParticipante: '1' },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await validarAlta(canvas);
    expect(canvas.getByRole('combobox', { name: 'País' })).toBeEnabled();
  },
};

export const ConPaisSinEstado: Story = {
  args: {
    modo: 'alta',
    initialData: { ...DATA_COMPLETO, pais: '484', estado: '' },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await validarAlta(canvas);
    expect(canvas.getByRole('combobox', { name: 'Estado' })).toBeEnabled();
  },
};

export const CargandoCatalogos: Story = {
  args: {
    modo: 'alta',
    initialData: { fideicomiso: '1234567890', tipoParticipante: 'FIDEICOMITENTE', noParticipante: '1' },
  },
  decorators: [catalogosLoadingDecorator()],
  parameters: {
    docs: {
      description: {
        story: 'Mientras los catálogos cargan, los combos de País, Estado y Régimen Fiscal se muestran deshabilitados con un indicador "Cargando…".',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await validarAlta(canvas);
    await waitFor(() => expect(canvas.getByRole('combobox', { name: 'País' })).toBeDisabled());
  },
};

export const CascadaPaisEstado: Story = {
  args: {
    modo: 'alta',
    initialData: { fideicomiso: '1234567890', tipoParticipante: 'FIDEICOMITENTE', noParticipante: '1' },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await validarAlta(canvas);

    const estadoSelect = canvas.getByRole('combobox', { name: 'Estado' });
    expect(estadoSelect).toBeDisabled();

    await userEvent.click(canvas.getByRole('combobox', { name: 'País' }));
    await userEvent.click(await screen.findByRole('option', { name: 'México' }));

    await waitFor(() => expect(canvas.getByRole('combobox', { name: 'Estado' })).toBeEnabled());

    await userEvent.click(canvas.getByRole('combobox', { name: 'Estado' }));
    expect(await screen.findByRole('option', { name: 'Ciudad de México' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'California' })).not.toBeInTheDocument();
  },
};

export const RegimenesFiltradosPorTipoPersona: Story = {
  args: {
    modo: 'alta',
    initialData: { fideicomiso: '1234567890', tipoParticipante: 'FIDEICOMITENTE', noParticipante: '1' },
  },
  parameters: {
    docs: {
      description: {
        story: 'Tras validar al participante (FISICA según el mock), el catálogo de Régimen Fiscal se recarga filtrado: se excluyen regímenes exclusivos de personas morales (601).',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await validarAlta(canvas);

    await waitFor(() => expect(canvas.getByRole('combobox', { name: 'Régimen Fiscal' })).toBeEnabled());

    await userEvent.click(canvas.getByRole('combobox', { name: 'Régimen Fiscal' }));
    expect(
      await screen.findByRole('option', {
        name: '612 — Personas Físicas con Actividades Empresariales y Profesionales',
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('option', { name: '601 — General de Ley Personas Morales' }),
    ).not.toBeInTheDocument();
  },
};
