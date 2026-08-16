import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, screen, userEvent, waitFor } from 'storybook/test';
import { DomicilioModal } from './DomicilioModal';
import { catalogosFetchDecorator } from '../../../../../.storybook/catalogosMock';

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

async function validarAlta(opciones?: {
  fideicomiso?: string;
  nombreFideicomiso?: string;
}) {
  const { fideicomiso = '1234567890', nombreFideicomiso = 'Fideicomiso Ejemplo Uno' } = opciones ?? {};
  const fidInput = screen.getByRole('textbox', { name: 'No. de Fideicomiso' });
  await userEvent.clear(fidInput);
  await userEvent.type(fidInput, fideicomiso);
  await userEvent.tab();
  await waitFor(() => expect(screen.getByDisplayValue(nombreFideicomiso)).toBeInTheDocument(), {
    timeout: 10000,
  });

  await userEvent.click(screen.getByRole('combobox', { name: 'Tipo de Participante' }));
  await userEvent.click(await screen.findByRole('option', { name: 'Fideicomitente' }, { timeout: 10000 }));

  const noParticipante = screen.getByRole('textbox', { name: 'No. de Participante' });
  await userEvent.type(noParticipante, '1');
  await userEvent.tab();
  await waitFor(
    () => expect(screen.getByText('Participante validado correctamente')).toBeInTheDocument(),
    { timeout: 10000 },
  );
}

async function llenarDireccion() {
  await userEvent.type(screen.getByPlaceholderText('Calle'), 'Av. Reforma');
  await userEvent.type(screen.getByPlaceholderText('No. Exterior'), '222');
  await userEvent.type(screen.getByPlaceholderText('Colonia'), 'Juárez');
  await userEvent.type(screen.getByPlaceholderText('Municipio/Alcaldía'), 'Cuauhtémoc');

  await userEvent.click(screen.getByRole('combobox', { name: 'País' }));
  await userEvent.click(await screen.findByRole('option', { name: 'México' }, { timeout: 10000 }));

  await userEvent.click(screen.getByRole('combobox', { name: 'Estado' }));
  await userEvent.click(
    await screen.findByRole('option', { name: 'Ciudad de México' }, { timeout: 10000 }),
  );

  await userEvent.type(screen.getByPlaceholderText('5 dígitos'), '06600');

  await userEvent.click(screen.getByRole('combobox', { name: 'Régimen Fiscal' }));
  await userEvent.click(
    await screen.findByRole('option', { name: '622 — Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras' }, { timeout: 10000 }),
  );
}

function ModalHarness(props: Omit<React.ComponentProps<typeof DomicilioModal>, 'open' | 'onCerrar' | 'onCancelar'>) {
  const [open, setOpen] = useState(true);
  return (
    <DomicilioModal
      {...props}
      open={open}
      onCerrar={() => setOpen(false)}
      onCancelar={() => setOpen(false)}
    />
  );
}

const meta = {
  title: 'DireccionesFiscales/DomicilioModal',
  component: DomicilioModal,
  parameters: { layout: 'centered' },
  decorators: [catalogosFetchDecorator()],
  argTypes: {
    onAlta: { action: 'onAlta' },
    onModificar: { action: 'onModificar' },
    onBaja: { action: 'onBaja' },
    onCerrar: { action: 'onCerrar' },
    onCancelar: { action: 'onCancelar' },
  },
} satisfies Meta<typeof DomicilioModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ModoConsulta: Story = {
  args: {
    open: true,
    modo: 'consulta',
    initialData: DATA_COMPLETO,
  },
};

export const ModoAlta: Story = {
  args: {
    open: true,
    modo: 'alta',
    initialData: {},
  },
  play: async () => {
    expect(screen.getByRole('textbox', { name: 'No. de Fideicomiso' })).toBeEnabled();
    expect(screen.getByPlaceholderText('Calle')).toBeDisabled();
  },
};

export const ModoAltaCompleto: Story = {
  args: {
    open: true,
    modo: 'alta',
    initialData: DATA_COMPLETO,
  },
  play: async () => {
    await validarAlta();
    expect(screen.getByPlaceholderText('Calle')).toBeEnabled();
  },
};

export const ModoModificar: Story = {
  args: {
    open: true,
    modo: 'modificar',
    initialData: DATA_COMPLETO,
  },
};

export const ModificarMuestraNombreFideicomisoYRfc: Story = {
  args: {
    open: true,
    modo: 'modificar',
    identidad: { numContrato: '111111111', cvePers: 'FIDEICOMITENTE', numPersFid: '1' },
  },
  play: async () => {
    await waitFor(() => expect(screen.getByDisplayValue('Fideicomiso Ejemplo Tres')).toBeInTheDocument(), {
      timeout: 10000,
    });
    expect(screen.getByDisplayValue('MORJ850101XXX')).toBeInTheDocument();
    expect(screen.getAllByDisplayValue('María González Ramírez').length).toBeGreaterThan(0);
  },
};

export const ModoEliminar: Story = {
  args: {
    open: true,
    modo: 'eliminar',
    identidad: { numContrato: '111111111', cvePers: 'FIDEICOMITENTE', numPersFid: '1' },
  },
  play: async () => {
    await waitFor(() => expect(screen.getByText(/¿Está seguro de eliminar este domicilio fiscal\?/)).toBeInTheDocument(), {
      timeout: 10000,
    });
    await waitFor(() => expect(screen.getByRole('button', { name: /Eliminar/ })).toBeEnabled(), {
      timeout: 10000,
    });
    expect(screen.getByDisplayValue('Fideicomiso Ejemplo Tres')).toBeInTheDocument();
    expect(screen.getByDisplayValue('MORJ850101XXX')).toBeInTheDocument();
  },
};

export const ConBannerCIF: Story = {
  args: {
    open: true,
    modo: 'consulta',
    initialData: DATA_COMPLETO,
    origen: 'CIF_PDF',
  },
};

export const ConErrorValidacionCP: Story = {
  args: {
    open: true,
    modo: 'alta',
    initialData: DATA_COMPLETO,
    errorCp: 'El Código Postal debe contener exactamente 5 dígitos numéricos.',
  },
  play: async () => {
    await validarAlta();
    expect(screen.getByText('El Código Postal debe contener exactamente 5 dígitos numéricos.')).toBeInTheDocument();
  },
};

export const ConErrorRegimenFiscal: Story = {
  args: {
    open: true,
    modo: 'alta',
    initialData: DATA_COMPLETO,
    tipoPersona: 'FISICA',
    errorRegimen: 'El régimen fiscal seleccionado no corresponde al tipo de persona (física/moral) del participante.',
  },
  play: async () => {
    await validarAlta();
    expect(
      screen.getByText('El régimen fiscal seleccionado no corresponde al tipo de persona (física/moral) del participante.'),
    ).toBeInTheDocument();
  },
};

export const RegimenIncompatibleBloqueaAceptar: Story = {
  render: (args) => <ModalHarness {...args} />,
  args: {
    open: true,
    modo: 'alta',
    initialData: DATA_COMPLETO,
  },
  play: async () => {
    // DATA_COMPLETO trae el régimen 601 (exclusivo de personas morales) y el
    // participante 1234567890 es persona física según el mock: al validar, la
    // compatibilidad debe romper y bloquear "Aceptar".
    await validarAlta();

    await waitFor(
      () => expect(screen.getByText(/corresponde a una persona MORAL y el participante es una persona FÍSICA/)).toBeInTheDocument(),
      { timeout: 10000 },
    );

    const aceptar = screen.getByRole('button', { name: /Aceptar/ });
    await waitFor(() => expect(aceptar).toBeDisabled(), { timeout: 10000 });
  },
};

export const AltaExitosa: Story = {
  render: (args) => <ModalHarness {...args} />,
  args: {
    open: true,
    modo: 'alta',
  },
  play: async () => {
    await validarAlta();
    await llenarDireccion();

    const aceptar = screen.getByRole('button', { name: /Aceptar/ });
    await waitFor(() => expect(aceptar).toBeEnabled(), { timeout: 10000 });
    await userEvent.click(aceptar);

    await waitFor(
      () =>
        expect(screen.queryByRole('textbox', { name: 'No. de Fideicomiso' })).not.toBeInTheDocument(),
      { timeout: 10000 },
    );
  },
};

export const AltaDuplicado: Story = {
  render: (args) => <ModalHarness {...args} />,
  args: {
    open: true,
    modo: 'alta',
  },
  play: async () => {
    await validarAlta({
      fideicomiso: '111111111',
      nombreFideicomiso: 'Fideicomiso Ejemplo Tres',
    });
    await llenarDireccion();

    const aceptar = screen.getByRole('button', { name: /Aceptar/ });
    await waitFor(() => expect(aceptar).toBeEnabled(), { timeout: 10000 });
    await userEvent.click(aceptar);

    await waitFor(
      () => expect(screen.getByText(/Ya existe un domicilio fiscal con la misma llave/)).toBeInTheDocument(),
      { timeout: 10000 },
    );
    expect(screen.getByRole('textbox', { name: 'No. de Fideicomiso' })).toBeInTheDocument();
  },
};

export const ModificarExitoso: Story = {
  render: (args) => <ModalHarness {...args} />,
  args: {
    open: true,
    modo: 'modificar',
    identidad: { numContrato: '111111111', cvePers: 'FIDEICOMITENTE', numPersFid: '1' },
  },
  play: async () => {
    const calle = await waitFor(() => screen.getByPlaceholderText('Calle'), { timeout: 10000 });
    await waitFor(() => expect(calle).toHaveValue('Av. Insurgentes Sur'), { timeout: 10000 });

    await waitFor(() => expect(screen.getByDisplayValue('Fideicomiso Ejemplo Tres')).toBeInTheDocument(), {
      timeout: 10000,
    });
    expect(screen.getByDisplayValue('MORJ850101XXX')).toBeInTheDocument();

    await userEvent.clear(calle);
    await userEvent.type(calle, 'Av. Revolución');

    const aceptar = screen.getByRole('button', { name: /Aceptar/ });
    await waitFor(() => expect(aceptar).toBeEnabled(), { timeout: 10000 });
    await userEvent.click(aceptar);

    await waitFor(() => expect(screen.queryByPlaceholderText('Calle')).not.toBeInTheDocument(), {
      timeout: 10000,
    });
  },
};

export const VistaHeredar: Story = {
  args: {
    open: true,
    modo: 'alta',
    initialData: DATA_COMPLETO,
    demoVistaActiva: 'heredar',
  },
  play: async () => {
    await waitFor(
      () => expect(screen.getByText('Av. Paseo de la Reforma 250')).toBeInTheDocument(),
      { timeout: 10000 },
    );
    expect(screen.getAllByText('México').length).toBeGreaterThan(0);
  },
};

export const HeredarSeleccionarDomicilio: Story = {
  args: {
    open: true,
    modo: 'alta',
    initialData: DATA_COMPLETO,
    demoVistaActiva: 'heredar',
  },
  play: async () => {
    await waitFor(
      () => expect(screen.getByText('Av. Paseo de la Reforma 250')).toBeInTheDocument(),
      { timeout: 10000 },
    );
    const botones = await screen.findAllByRole('button', { name: /seleccionar domicilio/i });
    await userEvent.click(botones[0]);

    await waitFor(() => expect(screen.getByText('Datos Heredados del Domicilio registrado')).toBeInTheDocument(), {
      timeout: 10000,
    });

    expect(screen.getByPlaceholderText('Calle')).toHaveValue('Av. Paseo de la Reforma');
    expect(screen.getByPlaceholderText('Calle')).toBeDisabled();
    expect(screen.getByPlaceholderText('No. Exterior')).toHaveValue('250');
    expect(screen.getByPlaceholderText('Colonia')).toHaveValue('Juárez');
    expect(screen.getByPlaceholderText('Municipio/Alcaldía')).toHaveValue('Cuauhtémoc');
    expect(screen.getByPlaceholderText('5 dígitos')).toHaveValue('06600');

    const pais = screen.getByRole('combobox', { name: 'País' });
    await waitFor(() => expect(pais).toHaveTextContent('México'), { timeout: 10000 });
    const estado = screen.getByRole('combobox', { name: 'Estado' });
    await waitFor(() => expect(estado).toHaveTextContent('Ciudad de México'), { timeout: 10000 });

    expect(screen.getByPlaceholderText('Teléfono')).toBeEnabled();
    expect(screen.getByPlaceholderText('Referencia (entre calles, notas)')).toBeEnabled();
    expect(screen.getByPlaceholderText('Correo electrónico')).toBeEnabled();

    expect(screen.getByDisplayValue('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Fideicomiso Ejemplo Uno')).toBeInTheDocument();
    expect(screen.getByDisplayValue('PELJ800101XXX')).toBeInTheDocument();
    expect(screen.getAllByDisplayValue('Juan Pérez López').length).toBeGreaterThan(0);
  },
};

const DATA_HEREDAR_SIN_CONTACTO = {
  fideicomiso: '1234567890',
  tipoParticipante: 'FIDEICOMITENTE',
  noParticipante: '1',
  nombreFideicomiso: 'Fideicomiso Ejemplo Uno',
  rfc: 'PELJ800101XXX',
  nombreFiscal: 'Juan Pérez López',
  nombreLegal: 'Juan Pérez López',
  pais: '484',
  estado: '9',
};

export const HeredarHabilitaAceptarSinContacto: Story = {
  args: {
    open: true,
    modo: 'alta',
    initialData: DATA_HEREDAR_SIN_CONTACTO,
    demoVistaActiva: 'heredar',
  },
  play: async () => {
    await waitFor(
      () => expect(screen.getByText('Av. Paseo de la Reforma 250')).toBeInTheDocument(),
      { timeout: 10000 },
    );
    const botones = await screen.findAllByRole('button', { name: /seleccionar domicilio/i });
    await userEvent.click(botones[0]);

    await waitFor(() => expect(screen.getByText('Datos Heredados del Domicilio registrado')).toBeInTheDocument(), {
      timeout: 10000,
    });

    const regimen = screen.getByRole('combobox', { name: 'Régimen Fiscal' });
    await userEvent.click(regimen);
    await userEvent.click(
      await screen.findByRole('option', { name: '622 — Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras' }, { timeout: 10000 }),
    );

    const aceptar = screen.getByRole('button', { name: /Aceptar/ });
    await waitFor(() => expect(aceptar).toBeEnabled(), { timeout: 10000 });

    expect(screen.getByPlaceholderText('Referencia (entre calles, notas)')).toHaveValue('');
    expect(screen.getByPlaceholderText('Teléfono')).toHaveValue('');
  },
};

export const VistaCIF: Story = {
  args: {
    open: true,
    modo: 'alta',
    initialData: DATA_COMPLETO,
    demoVistaActiva: 'cif',
  },
  play: async () => {
    await waitFor(() => expect(screen.getByText('Seleccionar archivo PDF')).toBeInTheDocument(), {
      timeout: 10000,
    });

    const dropZone = screen.getByText('Seleccionar archivo PDF').closest('[role="button"]') as HTMLElement;
    const fileInput = dropZone.querySelector('input[type="file"]') as HTMLElement;

    const file = new File(['dummy content'], 'cif_ejemplo.pdf', { type: 'application/pdf' });
    Object.defineProperty(file, 'size', { value: 100 * 1024 });
    await userEvent.upload(fileInput, file);

    await waitFor(
      () => expect(screen.getByText(/Datos extraídos del CIF/)).toBeInTheDocument(),
      { timeout: 10000 },
    );
    expect(screen.getByPlaceholderText('Calle')).toHaveValue('Av. Paseo de la Reforma');
    expect(screen.getByPlaceholderText('No. Exterior')).toHaveValue('250');
    expect(screen.getByPlaceholderText('Colonia')).toHaveValue('Juárez');
    expect(screen.getByPlaceholderText('Municipio/Alcaldía')).toHaveValue('Cuauhtémoc');
    expect(screen.getByPlaceholderText('5 dígitos')).toHaveValue('06600');

    const pais = screen.getByRole('combobox', { name: 'País' });
    await waitFor(() => expect(pais).toHaveTextContent('México'), { timeout: 10000 });
    const estado = screen.getByRole('combobox', { name: 'Estado' });
    await waitFor(() => expect(estado).toHaveTextContent('Ciudad de México'), { timeout: 10000 });

    const regimen = screen.getByRole('combobox', { name: 'Régimen Fiscal' });
    await waitFor(
      () => expect(regimen).toHaveTextContent('611 — Ingresos por Dividendos (socios y accionistas)'),
      { timeout: 10000 },
    );

    const aceptar = screen.getByRole('button', { name: 'Aceptar' });
    expect(aceptar).toBeEnabled();
  },
};
