import { useEffect, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export const PAISES_MOCK = [
  { id: 484, nombre: 'México' },
  { id: 840, nombre: 'Estados Unidos' },
];

export const ESTADOS_MOCK = [
  { id: 9, nombre: 'Ciudad de México', paisId: 484 },
  { id: 15, nombre: 'México', paisId: 484 },
  { id: 19, nombre: 'Nuevo León', paisId: 484 },
  { id: 14, nombre: 'Jalisco', paisId: 484 },
  { id: 1, nombre: 'California', paisId: 840 },
  { id: 2, nombre: 'Texas', paisId: 840 },
];

interface RegimenMock {
  clave: number;
  descripcion: string;
  aplicaFisica: boolean;
  aplicaMoral: boolean;
}

export const REGIMENES_MOCK: RegimenMock[] = [
  { clave: 601, descripcion: 'General de Ley Personas Morales', aplicaFisica: false, aplicaMoral: true },
  { clave: 603, descripcion: 'Personas Morales con Fines no Lucrativos', aplicaFisica: false, aplicaMoral: true },
  { clave: 605, descripcion: 'Sueldos y Salarios e Ingresos Asimilados a Salarios', aplicaFisica: true, aplicaMoral: false },
  { clave: 606, descripcion: 'Arrendamiento', aplicaFisica: true, aplicaMoral: false },
  { clave: 607, descripcion: 'Régimen de Enajenación o Adquisición de Bienes', aplicaFisica: true, aplicaMoral: false },
  { clave: 608, descripcion: 'Demás ingresos', aplicaFisica: true, aplicaMoral: false },
  { clave: 610, descripcion: 'Residentes en el Extranjero sin Establecimiento Permanente en México', aplicaFisica: true, aplicaMoral: true },
  { clave: 611, descripcion: 'Ingresos por Dividendos (socios y accionistas)', aplicaFisica: true, aplicaMoral: false },
  { clave: 612, descripcion: 'Personas Físicas con Actividades Empresariales y Profesionales', aplicaFisica: true, aplicaMoral: false },
  { clave: 614, descripcion: 'Ingresos por intereses', aplicaFisica: true, aplicaMoral: false },
  { clave: 615, descripcion: 'Régimen de los ingresos por obtención de premios', aplicaFisica: true, aplicaMoral: false },
  { clave: 616, descripcion: 'Sin obligaciones fiscales', aplicaFisica: true, aplicaMoral: false },
  { clave: 620, descripcion: 'Sociedades Cooperativas de Producción que optan por diferir sus ingresos', aplicaFisica: false, aplicaMoral: true },
  { clave: 621, descripcion: 'Incorporación Fiscal', aplicaFisica: true, aplicaMoral: false },
  { clave: 622, descripcion: 'Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras', aplicaFisica: true, aplicaMoral: true },
  { clave: 623, descripcion: 'Opcional para Grupos de Sociedades', aplicaFisica: false, aplicaMoral: true },
  { clave: 624, descripcion: 'Coordinados', aplicaFisica: false, aplicaMoral: true },
  { clave: 625, descripcion: 'Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas', aplicaFisica: true, aplicaMoral: false },
  { clave: 626, descripcion: 'Régimen Simplificado de Confianza', aplicaFisica: true, aplicaMoral: true },
];

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

const FIDEICOMISOS_MOCK: Record<
  string,
  { numContrato: number; nombre: string; rfc: string; nombreParticipante: string; tipoPersona: 'FISICA' | 'MORAL' }
> = {
  '1234567890': {
    numContrato: 1234567890,
    nombre: 'Fideicomiso Ejemplo Uno',
    rfc: 'PELJ800101XXX',
    nombreParticipante: 'Juan Pérez López',
    tipoPersona: 'FISICA',
  },
  '999': {
    numContrato: 999,
    nombre: 'Fideicomiso Ejemplo Dos',
    rfc: 'PELJ800101XXX',
    nombreParticipante: 'Juan Pérez López',
    tipoPersona: 'MORAL',
  },
  '111111111': {
    numContrato: 111111111,
    nombre: 'Fideicomiso Ejemplo Tres',
    rfc: 'MORJ850101XXX',
    nombreParticipante: 'María González Ramírez',
    tipoPersona: 'MORAL',
  },
};

interface DomicilioFiscalMockRow {
  fideicomisoId: string;
  tipoPersona: string;
  numeroParticipante: string;
  calle: string;
  numeroExterior: string;
  numeroInterior?: string;
  colonia: string;
  localidad?: string;
  municipio?: string;
  paisId?: number;
  estadoId?: number;
  codigoPostal: string;
  referencia?: string;
  telefono?: string;
  regimenFiscal?: string;
  nombreLegal?: string;
  fechaAlta?: string;
  fechaUltMod?: string;
}
export const DIRECCIONES_MOCK_SEED: DomicilioFiscalMockRow[] = [
  {
    fideicomisoId: '111111111',
    tipoPersona: 'FIDEICOMITENTE',
    numeroParticipante: '1',
    calle: 'Av. Insurgentes Sur',
    numeroExterior: '1605',
    numeroInterior: 'Piso 4',
    colonia: 'Crédito Constructor',
    localidad: '',
    municipio: 'Benito Juárez',
    paisId: 484,
    estadoId: 9,
    codigoPostal: '03940',
    referencia: 'Frente al centro comercial',
    telefono: '5555555555',
    regimenFiscal: '601',
    nombreLegal: 'María González Ramírez',
    fechaAlta: '2026-01-15',
    fechaUltMod: '2026-01-15',
  },
];

export const DOMICILIOS_HEREDABLES_MOCK = [
  {
    calle: 'Av. Paseo de la Reforma',
    numeroExterior: '250',
    colonia: 'Juárez',
    poblacion: 'Ciudad de México',
    municipio: 'Cuauhtémoc',
    estado: 'Ciudad de México',
    estadoId: 9,
    pais: 'México',
    paisId: 484,
    codigoPostal: '06600',
    nombreLegal: 'Juan Pérez',
    tipoDomicilio: 'PARTICULAR',
    numSecDirecc: 1,
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
    paisId: 484,
    codigoPostal: '11000',
    nombreLegal: 'Martha López',
    tipoDomicilio: 'OFICINA',
    numSecDirecc: 2,
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
    paisId: 484,
    codigoPostal: '64000',
    nombreLegal: '',
    tipoDomicilio: 'EMPRESA',
    numSecDirecc: 3,
  },
];

export const CIF_RESPONSE_MOCK = {
  calle: 'Av. Paseo de la Reforma',
  numeroExterior: '250',
  numeroInterior: 'Piso 12',
  colonia: 'Juárez',
  localidad: 'Centro',
  municipio: 'Cuauhtémoc',
  estado: 'Ciudad de México',
  estadoId: 9,
  pais: 'México',
  paisId: 484,
  codigoPostal: '06600',
  referencia: 'Entre Calle: A, Y Calle: B',
  telefono: '5551234567',
  regimenFiscal: 'Régimen de Ingresos por Dividendos (socios y accionistas)',
  regimenFiscalId: 611,
  rfc: 'PELJ800101XXX',
  nombreOLRazonSocial: 'Juan Pérez López',
};

let DIRECCIONES_STORE: DomicilioFiscalMockRow[] = [...DIRECCIONES_MOCK_SEED];

export function resetDireccionesMock() {
  DIRECCIONES_STORE = [...DIRECCIONES_MOCK_SEED];
}

function claveDomicilio(row: Pick<DomicilioFiscalMockRow, 'fideicomisoId' | 'tipoPersona' | 'numeroParticipante'>) {
  return `${row.fideicomisoId}|${row.tipoPersona}|${row.numeroParticipante}`;
}

export function mockCatalogosFetch(delayMs = 0, fideicomisosDelayMs = delayMs): () => void {
  const original = globalThis.fetch;
  DIRECCIONES_STORE = [...DIRECCIONES_MOCK_SEED];
  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    const method = init?.method ?? 'GET';
    const searchParams = new URL(url, 'http://localhost').searchParams;

    const fideicomisoMatch = url.match(/\/api\/v1\/fideicomisos\/([0-9]+)$/);
    const domiciliosHeredablesMatch = url.match(/\/api\/v1\/fideicomisos\/([0-9]+)\/domicilios-heredables\?/);
    const participanteMatch = url.match(
      /\/api\/v1\/fideicomisos\/([0-9]+)\/participantes\/([A-Z]+)\/([0-9]+)\/(rfc|nombre)$/,
    );
    const direccionesDetalleMatch = url.match(
      /\/api\/v1\/direcciones-fiscales\/([0-9]+)\/([A-Z]+)\/([0-9]+)$/,
    );
    const direccionesColeccionMatch = /\/api\/v1\/direcciones-fiscales\/?(\?|$)/.test(url);

    if (direccionesDetalleMatch) {
      const numContrato = direccionesDetalleMatch[1];
      const cvePers = direccionesDetalleMatch[2];
      const numPersFid = direccionesDetalleMatch[3];
      const fila = DIRECCIONES_STORE.find(
        (d) =>
          d.fideicomisoId === numContrato &&
          d.tipoPersona === cvePers &&
          d.numeroParticipante === numPersFid,
      );
      if (method === 'PUT') {
        if (!fila) return jsonResponse({ mensaje: 'Domicilio fiscal no encontrado' }, 404);
        const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
        Object.assign(fila, body, { fechaUltMod: '2026-08-01' });
        return jsonResponse(fila);
      }
      if (method === 'DELETE') {
        if (!fila) return jsonResponse({ mensaje: 'Domicilio fiscal no encontrado' }, 404);
        DIRECCIONES_STORE = DIRECCIONES_STORE.filter(
          (d) => claveDomicilio(d) !== claveDomicilio(fila),
        );
        return new Response(null, { status: 204 });
      }
      return fila
        ? jsonResponse(fila)
        : jsonResponse({ mensaje: 'Domicilio fiscal no encontrado' }, 404);
    }

    if (direccionesColeccionMatch) {
      if (method === 'POST') {
        const body = JSON.parse(String(init?.body)) as DomicilioFiscalMockRow;
        const existe = DIRECCIONES_STORE.some((d) => claveDomicilio(d) === claveDomicilio(body));
        if (existe) {
          return jsonResponse(
            {
              mensaje:
                'Registro duplicado en la clave única (fideicomiso, tipo de persona, número de participante)',
            },
            409,
          );
        }
        const nuevo: DomicilioFiscalMockRow = {
          ...body,
          nombreLegal: FIDEICOMISOS_MOCK[body.fideicomisoId]?.nombreParticipante ?? 'Sin nombre',
          fechaAlta: '2026-08-01',
          fechaUltMod: '2026-08-01',
        };
        DIRECCIONES_STORE.push(nuevo);
        return jsonResponse(nuevo, 201);
      }
      const fideicomisoId = searchParams.get('fideicomisoId') ?? undefined;
      const tipoPersona = searchParams.get('tipoPersona') ?? undefined;
      const rows = DIRECCIONES_STORE.filter(
        (d) =>
          (!fideicomisoId || d.fideicomisoId === fideicomisoId) &&
          (!tipoPersona || d.tipoPersona === tipoPersona),
      );
      return jsonResponse(rows);
    }

    if (domiciliosHeredablesMatch) {
      if (fideicomisosDelayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, fideicomisosDelayMs));
      }
      const registro = FIDEICOMISOS_MOCK[domiciliosHeredablesMatch[1]];
      return registro
        ? jsonResponse(DOMICILIOS_HEREDABLES_MOCK)
        : jsonResponse({ mensaje: 'Fideicomiso no encontrado' }, 404);
    }

    if (fideicomisoMatch) {
      if (fideicomisosDelayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, fideicomisosDelayMs));
      }
      const registro = FIDEICOMISOS_MOCK[fideicomisoMatch[1]];
      return registro
        ? jsonResponse({ numContrato: registro.numContrato, nombre: registro.nombre })
        : jsonResponse({ mensaje: 'Fideicomiso no encontrado' }, 404);
    }

    if (participanteMatch) {
      if (fideicomisosDelayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, fideicomisosDelayMs));
      }
      const registro = FIDEICOMISOS_MOCK[participanteMatch[1]];
      if (!registro) {
        return jsonResponse({ mensaje: 'Fideicomiso no encontrado' }, 404);
      }
      if (participanteMatch[4] === 'rfc') {
        return jsonResponse({ rfc: registro.rfc });
      }
      return jsonResponse({ nombre: registro.nombreParticipante, tipoPersona: registro.tipoPersona });
    }

    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    if (url.includes('/api/v1/catalogos/paises')) {
      return jsonResponse(PAISES_MOCK);
    }
    if (url.includes('/api/v1/catalogos/estados')) {
      const paisId = searchParams.get('paisId');
      const estados = paisId ? ESTADOS_MOCK.filter((e) => e.paisId === Number(paisId)) : ESTADOS_MOCK;
      return jsonResponse(estados);
    }
    if (url.includes('/api/v1/catalogos/regimenes-fiscales')) {
      const tipoPersona = searchParams.get('tipoPersona');
      let regimenes = REGIMENES_MOCK;
      if (tipoPersona === 'FISICA') regimenes = regimenes.filter((r) => r.aplicaFisica);
      if (tipoPersona === 'MORAL') regimenes = regimenes.filter((r) => r.aplicaMoral);
      return jsonResponse(regimenes.map((r) => ({
        clave: r.clave,
        descripcion: r.descripcion,
        aplicaFisica: r.aplicaFisica,
        aplicaMoral: r.aplicaMoral,
      })));
    }
    if (url.includes('/api/v1/carga-masiva/direcciones-fiscales') && method === 'POST') {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      return jsonResponse({
        loteId: 'lote-mock-001',
        totalRegistros: 5,
        registrosExitosos: 3,
        registrosConError: 2,
        lineas: [
          { numLinea: 1, fideicomiso: '1234567890', rfcArchivo: 'PELJ800101XXX', rfcSistema: 'PELJ800101XXX', estatus: 'A', mensaje: '' },
          { numLinea: 2, fideicomiso: '1234567890', rfcArchivo: 'PELJ800101XXX', rfcSistema: 'PELJ800101XXX', estatus: 'A', mensaje: '' },
          { numLinea: 3, fideicomiso: '999', rfcArchivo: 'XAXX010101000', rfcSistema: 'PELJ800101XXX', estatus: 'E', mensaje: "RFC no coincide: archivo='XAXX010101000' sistema='PELJ800101XXX'" },
          { numLinea: 4, fideicomiso: '1234567890', rfcArchivo: 'PELJ800101XXX', rfcSistema: 'PELJ800101XXX', estatus: 'A', mensaje: '' },
          { numLinea: 5, fideicomiso: '111111111', rfcArchivo: 'MORJ850101XXX', rfcSistema: 'MORJ850101XXX', estatus: 'E', mensaje: 'Estado no encontrado en catálogo: \'X\' ' },
        ],
      });
    }
    if (url.includes('/api/v1/cif/procesar')) {
      let fideicomisoId = searchParams.get('fideicomisoId') ?? '';
      if (init?.body instanceof FormData) {
        fideicomisoId = String(init.body.get('fideicomisoId') ?? '');
      }
      const rfcEsperado = FIDEICOMISOS_MOCK[fideicomisoId]?.rfc;
      if (rfcEsperado && CIF_RESPONSE_MOCK.rfc !== rfcEsperado) {
        return jsonResponse(
          { mensaje: `El RFC del CIF (${CIF_RESPONSE_MOCK.rfc}) no coincide con el RFC registrado del participante (${rfcEsperado})` },
          409,
        );
      }
      return jsonResponse(CIF_RESPONSE_MOCK);
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

export function catalogosFetchDecorator(delayMs = 0) {
  return (Story: () => ReactNode) => (
    <RestoreFetch onUnmount={mockCatalogosFetch(delayMs)}>
      <Story />
    </RestoreFetch>
  );
}

export function catalogosLoadingDecorator() {
  return (Story: () => ReactNode) => {
    const client = new QueryClient();
    return (
      <RestoreFetch onUnmount={mockCatalogosFetch(60000, 0)}>
        <QueryClientProvider client={client}>
          <Story />
        </QueryClientProvider>
      </RestoreFetch>
    );
  };
}
