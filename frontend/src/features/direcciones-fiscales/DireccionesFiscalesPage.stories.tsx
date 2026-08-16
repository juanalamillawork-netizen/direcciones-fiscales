import { useEffect, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';
import { DireccionesFiscalesPage } from './DireccionesFiscalesPage';
import { exportarResultadosCSV } from './utils/csvExport';

const MOCK_PAISES = [{ id: 484, nombre: 'México' }];

const MOCK_ESTADOS = [
  { id: 9, nombre: 'Ciudad de México', paisId: 484 },
  { id: 19, nombre: 'Nuevo León', paisId: 484 },
  { id: 14, nombre: 'Jalisco', paisId: 484 },
];

const MOCK_REGIMENES = [
  { clave: 601, descripcion: 'General de Ley Personas Morales' },
  { clave: 605, descripcion: 'Sueldos y Salarios e Ingresos Asimilados a Salarios' },
  { clave: 603, descripcion: 'Personas Morales con Fines no Lucrativos' },
];

const MOCK_DOMICILIOS = [
  {
    fideicomisoId: '1234567890',
    tipoPersona: 'FIDEICOMITENTE',
    numeroParticipante: '1',
    calle: 'Av. Reforma',
    numeroExterior: '100',
    numeroInterior: '',
    colonia: 'Centro',
    localidad: 'Cuauhtémoc',
    municipio: 'Cuauhtémoc',
    paisId: 484,
    estadoId: 9,
    codigoPostal: '06000',
    referencia: 'Frente al parque',
    telefono: '5512345678',
    regimenFiscal: '601',
    nombreLegal: 'JUAN GARCIA RAMIREZ',
    fechaAlta: '2024-01-15T10:00:00',
    fechaUltMod: '2025-06-20T14:30:00',
  },
];

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function mockApi(): () => void {
  const original = globalThis.fetch;
  globalThis.fetch = async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes('/api/v1/catalogos/paises')) return jsonResponse(MOCK_PAISES);
    if (url.includes('/api/v1/catalogos/estados')) return jsonResponse(MOCK_ESTADOS);
    if (url.includes('/api/v1/catalogos/regimenes-fiscales')) return jsonResponse(MOCK_REGIMENES);
    if (url.includes('/api/v1/direcciones-fiscales')) return jsonResponse(MOCK_DOMICILIOS);
    if (url.includes('/api/v1/carga-masiva/direcciones-fiscales')) {
      return jsonResponse({
        loteId: 'lote-mock-001',
        totalRegistros: 5,
        registrosExitosos: 3,
        registrosConError: 2,
        lineas: [
          { numLinea: 1, estatus: 'A', mensaje: '' },
          { numLinea: 2, estatus: 'A', mensaje: '' },
          { numLinea: 3, estatus: 'E', mensaje: 'RFC no coincide con el participante' },
          { numLinea: 4, estatus: 'A', mensaje: '' },
          { numLinea: 5, estatus: 'E', mensaje: 'Estado no encontrado en catálogo' },
        ],
      });
    }
    return jsonResponse({ mensaje: 'No encontrado' }, 404);
  };
  return () => {
    globalThis.fetch = original;
  };
}

function RestoreFetch({ onUnmount, children }: { onUnmount: () => void; children: ReactNode }) {
  useEffect(() => () => onUnmount(), [onUnmount]);
  return <>{children}</>;
}

const meta = {
  title: 'DireccionesFiscales/DireccionesFiscalesPage',
  component: DireccionesFiscalesPage,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <RestoreFetch onUnmount={mockApi()}>
        <Story />
      </RestoreFetch>
    ),
  ],
} satisfies Meta<typeof DireccionesFiscalesPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SinResultados: Story = {};

export const ConResultados: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.type(canvas.getByLabelText('No. Fideicomiso'), '1234567890');
    await userEvent.click(canvas.getByRole('button', { name: 'Consultar' }));

    await waitFor(() => expect(canvas.getByText('Av. Reforma')).toBeInTheDocument(), {
      timeout: 5000,
    });
  },
};

export const ConsultandoDuranteBusqueda: Story = {
  play: async ({ canvasElement }) => {
    const original = globalThis.fetch;
    const canvas = within(canvasElement);

    let resolver: (value: Response | PromiseLike<Response>) => void = () => undefined;
    globalThis.fetch = async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/api/v1/direcciones-fiscales')) {
        return new Promise<Response>((res) => {
          resolver = res;
        });
      }
      return original(input);
    };

    try {
      await userEvent.type(canvas.getByLabelText('No. Fideicomiso'), '1234567890');
      await userEvent.click(canvas.getByRole('button', { name: 'Consultar' }));

      // Mientras la petición está en vuelo se muestra el enmascaramiento/loading
      await waitFor(() => expect(canvas.getByTestId('grid-cargando')).toBeInTheDocument(), {
        timeout: 3000,
      });
      expect(canvas.getAllByText('Consultando…').length).toBeGreaterThanOrEqual(1);

      // Resolver la petición: el grid pasa a datos
      resolver(jsonResponse(MOCK_DOMICILIOS));

      await waitFor(() => expect(canvas.getByText('Av. Reforma')).toBeInTheDocument(), {
        timeout: 5000,
      });
    } finally {
      globalThis.fetch = original;
    }
  },
};

export const ExportarResultado: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const csv = exportarResultadosCSV({
      rows: MOCK_DOMICILIOS,
      paises: new Map([[484, 'México']]),
      estados: new Map([[9, 'Ciudad de México']]),
      regimenes: new Map([[601, 'General de Ley Personas Morales']]),
    });
    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv).toContain('"Fideicomiso","Nombre Fiscal","Tipo de Participante"');
    expect(csv).toContain('"Av. Reforma"');
    expect(csv).toContain('"México"');
    expect(csv).toContain('"Ciudad de México"');
    expect(csv).toContain('"General de Ley Personas Morales"');

    await userEvent.type(canvas.getByLabelText('No. Fideicomiso'), '1234567890');
    await userEvent.click(canvas.getByRole('button', { name: 'Consultar' }));
    await waitFor(() => expect(canvas.getByText('Av. Reforma')).toBeInTheDocument(), {
      timeout: 5000,
    });

    const exportarBtn = canvas.getByRole('button', { name: 'Exportar Consulta' });
    expect(exportarBtn).toBeEnabled();

    const originalCreate = URL.createObjectURL;
    const originalClick = HTMLAnchorElement.prototype.click;
    const descargo = { blob: null as Blob | null, archivo: null as string | null };
    URL.createObjectURL = (blob: Blob) => {
      descargo.blob = blob;
      return 'blob:registro-falso';
    };
    HTMLAnchorElement.prototype.click = function (this: HTMLAnchorElement) {
      descargo.archivo = this.download;
    };

    try {
      await userEvent.click(exportarBtn);

      expect(descargo.blob).toBeInstanceOf(Blob);
      expect(descargo.blob?.type).toMatch('text/csv');
      expect(descargo.archivo).toMatch(/^direcciones-fiscales-\d{4}-\d{2}-\d{2}\.csv$/);
    } finally {
      URL.createObjectURL = originalCreate;
      HTMLAnchorElement.prototype.click = originalClick;
    }
  },
};

export const FlujoImportacionCompleto: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 1. Click en "Importar"
    const importarBtn = canvas.getByRole('button', { name: 'Importar' });
    await userEvent.click(importarBtn);

    // 2. Esperar a que se abra el diálogo
    const dialog = await screen.findByRole('dialog');
    const dialogCanvas = within(dialog);

    // 3. Seleccionar archivo .txt en CargaMasivaUploader
    const dropZone = dialogCanvas.getByText('Seleccionar archivo .txt').closest('[role="button"]') as HTMLElement;
    const fileInput = dropZone.querySelector('input[type="file"]') as HTMLElement;

    const file = new File(['dummy content'], 'carga_masiva.txt', { type: 'text/plain' });
    Object.defineProperty(file, 'size', { value: 100 * 1024 });

    await userEvent.upload(fileInput, file);

    // 4. Esperar a que aparezca la tabla de resultados
    await waitFor(() => dialogCanvas.getByText('Resultado de importación'), { timeout: 5000 });

    // 5. Verificar que las líneas de error muestran su mensaje (regla de negocio)
    await waitFor(
      () => expect(dialogCanvas.getByText('RFC no coincide con el participante')).toBeInTheDocument(),
      { timeout: 5000 },
    );
    expect(dialogCanvas.getByText('Estado no encontrado en catálogo')).toBeInTheDocument();

    // 6. Cerrar el diálogo
    const cerrarBtn = dialogCanvas.getByRole('button', { name: 'Cerrar' });
    await userEvent.click(cerrarBtn);
  },
};
