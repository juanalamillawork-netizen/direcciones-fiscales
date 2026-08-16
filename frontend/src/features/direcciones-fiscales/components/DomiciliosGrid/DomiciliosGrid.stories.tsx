import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { DomiciliosGrid } from './DomiciliosGrid';
import type { DomicilioFiscalRow } from '../../types/domicilioFiscal';

const MOCK_ROWS: DomicilioFiscalRow[] = [
  {
    fideicomisoId: 'F001',
    tipoPersona: 'FIDEICOMITENTE',
    numeroParticipante: 'P001',
    calle: 'Av. Principal',
    numeroExterior: '123',
    numeroInterior: '',
    colonia: 'Centro',
    localidad: 'Ciudad de México',
    municipio: 'Cuauhtémoc',
    paisId: 484,
    estadoId: 9,
    codigoPostal: '06000',
    referencia: 'Entre calles A y B',
    telefono: '5551234567',
    regimenFiscal: '601',
    nombreLegal: 'Empresa S.A. de C.V.',
    fechaAlta: '2024-01-15T10:00:00',
    fechaUltMod: '2025-06-20T14:30:00',
  },
  {
    fideicomisoId: 'F001',
    tipoPersona: 'FIDEICOMISARIO',
    numeroParticipante: 'P002',
    calle: 'Calle Secundaria',
    numeroExterior: '456',
    numeroInterior: 'B',
    colonia: 'Del Valle',
    localidad: 'Monterrey',
    municipio: 'Benito Juárez',
    paisId: 484,
    estadoId: 19,
    codigoPostal: '66220',
    telefono: '8187654321',
    regimenFiscal: '605',
    nombreLegal: 'Persona Física',
    fechaAlta: '2024-03-10T09:15:00',
    fechaUltMod: '2025-06-18T11:00:00',
  },
  {
    fideicomisoId: 'F002',
    tipoPersona: 'TERCERO',
    numeroParticipante: 'P003',
    calle: 'Boulevard Central',
    numeroExterior: '789',
    numeroInterior: '101',
    colonia: 'Las Palmas',
    localidad: 'Guadalajara',
    municipio: 'Zapopan',
    paisId: 484,
    estadoId: 14,
    codigoPostal: '45066',
    referencia: 'Edificio Corporativo',
    telefono: '3312345678',
    regimenFiscal: '603',
    nombreLegal: 'Tercero Ejemplo',
    fechaAlta: '2024-06-01T08:00:00',
    fechaUltMod: '2025-07-01T16:45:00',
  },
];

const MOCK_PAISES = new Map<number, string>([
  [484, 'México'],
]);

const MOCK_ESTADOS = new Map<number, string>([
  [9, 'Ciudad de México'],
  [19, 'Nuevo León'],
  [14, 'Jalisco'],
]);

const MOCK_REGIMENES = new Map<number, string>([
  [601, 'General de Ley Personas Morales'],
  [605, 'Sueldos y Salarios e Ingresos Asimilados a Salarios'],
  [603, 'Personas Morales con Fines no Lucrativos'],
]);

const MOCK_ROWS_11: DomicilioFiscalRow[] = Array.from({ length: 11 }, (_, i) => ({
  fideicomisoId: `F${String(i + 1).padStart(3, '0')}`,
  tipoPersona: 'FIDEICOMITENTE',
  numeroParticipante: `P${String(i + 1).padStart(3, '0')}`,
  calle: `Calle ${i + 1}`,
  numeroExterior: String(i + 1),
  numeroInterior: '',
  colonia: 'Centro',
  localidad: 'Ciudad de México',
  municipio: 'Cuauhtémoc',
  paisId: 484,
  estadoId: 9,
  codigoPostal: '06000',
  referencia: '',
  telefono: '5551234567',
  regimenFiscal: '601',
  nombreLegal: 'Empresa S.A. de C.V.',
  fechaAlta: '2024-01-15T10:00:00',
  fechaUltMod: '2025-06-20T14:30:00',
}));

const meta = {
  title: 'DireccionesFiscales/DomiciliosGrid',
  component: DomiciliosGrid,
  parameters: { layout: 'centered' },
  argTypes: {
    onEditarFila: { action: 'onEditarFila' },
    onEliminarFila: { action: 'onEliminarFila' },
  },
} satisfies Meta<typeof DomiciliosGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SinResultados: Story = {
  args: {
    rows: [],
    status: 'empty',
  },
};

export const Loading: Story = {
  args: {
    rows: [],
    status: 'loading',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByTestId('grid-cargando')).toBeInTheDocument();
    expect(canvas.getByText('Consultando…')).toBeInTheDocument();
    expect(canvas.queryByText('No. de Participante')).not.toBeInTheDocument();
  },
};

export const WithError: Story = {
  args: {
    rows: [],
    status: 'error',
    errorMessage: 'No se pudieron cargar los domicilios fiscales.',
  },
};

export const ConDatos: Story = {
  args: {
    rows: MOCK_ROWS,
    status: 'data',
    page: 1,
    pageSize: 10,
    total: 3,
    paises: MOCK_PAISES,
    estados: MOCK_ESTADOS,
    regimenes: MOCK_REGIMENES,
  },
};

export const SinCatalogos: Story = {
  args: {
    rows: MOCK_ROWS,
    status: 'data',
    page: 1,
    pageSize: 10,
    total: 3,
  },
  parameters: {
    docs: {
      description: {
        story: 'Sin catálogos cargados, el grid muestra los IDs sin resolver.',
      },
    },
  },
};

export const Paginado: Story = {
  args: {
    rows: MOCK_ROWS,
    status: 'data',
    page: 2,
    pageSize: 10,
    total: 23,
    paises: MOCK_PAISES,
    estados: MOCK_ESTADOS,
    regimenes: MOCK_REGIMENES,
  },
};

export const ConMuchosRegistros: Story = {
  args: {
    rows: Array.from({ length: 15 }, (_, i) => ({
      fideicomisoId: `F${String(i + 1).padStart(3, '0')}`,
      tipoPersona: 'FIDEICOMITENTE',
      numeroParticipante: `P${String(i + 1).padStart(3, '0')}`,
      calle: `Calle ${i + 1}`,
      numeroExterior: String(i + 1),
      numeroInterior: '',
      colonia: 'Centro',
      localidad: 'Ciudad de México',
      municipio: 'Cuauhtémoc',
      paisId: 484,
      estadoId: 9,
      codigoPostal: '06000',
      referencia: '',
      telefono: '5551234567',
      regimenFiscal: '601',
      nombreLegal: 'Empresa S.A. de C.V.',
      fechaAlta: '2024-01-15T10:00:00',
      fechaUltMod: '2025-06-20T14:30:00',
    })),
    status: 'data',
    page: 1,
    pageSize: 15,
    total: 15,
    paises: MOCK_PAISES,
    estados: MOCK_ESTADOS,
    regimenes: MOCK_REGIMENES,
  },
  parameters: {
    docs: {
      description: {
        story: 'Con más de 10 filas visibles por página (pageSize=15), el contenedor se mantiene en el tope de 10 filas y activa scroll vertical interno.',
      },
    },
  },
};

function PaginacionDemo() {
  const [page, setPage] = useState(1);
  return (
    <DomiciliosGrid
      rows={MOCK_ROWS_11}
      status="data"
      page={page}
      pageSize={10}
      total={11}
      paises={MOCK_PAISES}
      estados={MOCK_ESTADOS}
      regimenes={MOCK_REGIMENES}
      onFirstPage={() => setPage(1)}
      onPrevPage={() => setPage((p) => Math.max(1, p - 1))}
      onNextPage={() => setPage((p) => p + 1)}
      onLastPage={() => setPage(2)}
    />
  );
}

export const Paginacion11Registros: Story = {
  args: { rows: [], status: 'empty' },
  render: () => <PaginacionDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Página 1: solo los registros 1-10
    expect(canvas.getByText('F001')).toBeInTheDocument();
    expect(canvas.getByText('1–10 de 11 registros')).toBeInTheDocument();
    expect(canvas.queryByText('F011')).not.toBeInTheDocument();

    // Clic en "Siguiente página"
    await userEvent.click(canvas.getByRole('button', { name: 'Siguiente página' }));

    // Página 2: únicamente el registro 11, con etiqueta consistente
    await waitFor(() => {
      expect(canvas.getByText('F011')).toBeInTheDocument();
      expect(canvas.queryByText('F001')).not.toBeInTheDocument();
      expect(canvas.getByText('11–11 de 11 registros')).toBeInTheDocument();
    });
  },
};

export const ConAccionesDeFila: Story = {
  args: {
    rows: MOCK_ROWS,
    status: 'data',
    page: 1,
    pageSize: 10,
    total: 3,
    paises: MOCK_PAISES,
    estados: MOCK_ESTADOS,
    regimenes: MOCK_REGIMENES,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const editButtons = canvas.getAllByTitle('Editar registro');
    expect(editButtons.length).toBeGreaterThan(0);

    const deleteButtons = canvas.getAllByTitle('Eliminar registro');
    expect(deleteButtons.length).toBeGreaterThan(0);

    await userEvent.click(deleteButtons[0]);
    expect(canvas.getAllByTitle('Eliminar registro').length).toBe(deleteButtons.length);
  },
};

export const AcordeonExpandido: Story = {
  args: {
    rows: MOCK_ROWS,
    status: 'data',
    page: 1,
    pageSize: 10,
    total: 3,
    paises: MOCK_PAISES,
    estados: MOCK_ESTADOS,
    regimenes: MOCK_REGIMENES,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const firstRow = canvas.getAllByText('F001')[0]?.closest('[data-state]') ?? canvas.getAllByText('F001')[0];
    if (firstRow instanceof HTMLElement) {
      firstRow.click();
    }
  },
};
