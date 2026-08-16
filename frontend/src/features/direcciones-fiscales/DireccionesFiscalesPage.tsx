import { useMemo, useState } from 'react';
import { Info } from 'lucide-react';
import { BusquedaCriteriosForm } from './components/BusquedaCriteriosForm/BusquedaCriteriosForm';
import { DomiciliosGrid, type GridStatus } from './components/DomiciliosGrid/DomiciliosGrid';
import { DomicilioModal } from './components/DomicilioModal/DomicilioModal';
import { CargaMasivaUploader } from './components/CargaMasivaUploader/CargaMasivaUploader';
import { CargaMasivaResultadoTabla } from './components/CargaMasivaResultadoTabla/CargaMasivaResultadoTabla';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useDireccionesFiscales } from './hooks/useDireccionesFiscales';
import { usePaises, useEstados, useRegimenesFiscales } from './hooks/useCatalogos';
import { descargarCSV, exportarResultadosCSV } from './utils/csvExport';
import type { IdentidadDomicilio } from './api/direccionesFiscalesApi';
import type { BusquedaCriterios, DomicilioFiscalRow, ModoFormulario, ResultadoCargaMasiva } from './types/domicilioFiscal';

const PAGE_SIZE = 10;

interface ModalAbierto {
  modo: ModoFormulario;
  identidad?: IdentidadDomicilio;
}

export function DireccionesFiscalesPage() {
  const [criterios, setCriterios] = useState<BusquedaCriterios | null>(null);
  const { data, refetch, isSuccess, isFetching, isError, error } = useDireccionesFiscales(criterios);
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [cargaResultado, setCargaResultado] = useState<ResultadoCargaMasiva | null>(null);
  const [modal, setModal] = useState<ModalAbierto | null>(null);

  function rowToIdentidad(row: DomicilioFiscalRow): IdentidadDomicilio {
    return {
      numContrato: row.fideicomisoId,
      cvePers: row.tipoPersona,
      numPersFid: row.numeroParticipante,
    };
  }

  const rows = data ?? [];
  const total = rows.length;
  const hasData = rows.length > 0;
  const searchExecuted = criterios !== null;
  const buscaActiva =
    searchExecuted && (criterios.numeroFideicomiso.trim().length > 0 || criterios.tipoParticipante.length > 0);
  const isSearching = buscaActiva && isFetching;
  const isEmptyResult = searchExecuted && isSuccess && !hasData;
  const gridStatus: GridStatus = isSearching
    ? 'loading'
    : isError
      ? 'error'
      : hasData
        ? 'data'
        : 'empty';
  const errorMensaje = error instanceof Error ? error.message : 'Ocurrió un error al cargar los datos.';

  const { data: paisesData } = usePaises(hasData);
  const { data: estadosData } = useEstados(undefined, hasData);
  const { data: regimenesData } = useRegimenesFiscales(undefined, hasData);

  const paises = useMemo(() => new Map((paisesData ?? []).map((p) => [p.id, p.nombre])), [paisesData]);
  const estados = useMemo(() => new Map((estadosData ?? []).map((e) => [e.id, e.nombre])), [estadosData]);
  const regimenes = useMemo(() => new Map((regimenesData ?? []).map((r) => [r.clave, r.descripcion])), [regimenesData]);

  function handleConsultar(criterios: BusquedaCriterios) {
    setCriterios(criterios);
    setPage(1);
    refetch();
  }

  function handleExportar() {
    const fecha = new Date().toISOString().slice(0, 10);
    descargarCSV(
      `direcciones-fiscales-${fecha}.csv`,
      exportarResultadosCSV({ rows, paises, estados, regimenes }),
    );
  }

  function handleImport() {
    setCargaResultado(null);
    setDialogOpen(true);
  }

  function handleArchivoProcesado(resultado: ResultadoCargaMasiva) {
    setCargaResultado(resultado);
  }

  function handleCerrarResultado() {
    setDialogOpen(false);
    setCargaResultado(null);
  }

  function handleDialogOpenChange(open: boolean) {
    setDialogOpen(open);
    if (!open) {
      setCargaResultado(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-4 p-4 sm:p-6">
      <div className="rounded-lg bg-gradient-to-r from-primary to-red-700 px-4 py-1 shadow-sm">
        <h1 className="text-sm font-bold text-primary-foreground">
          Direcciones Fiscales
        </h1>
      </div>

      <BusquedaCriteriosForm
        hasResults={hasData}
        isSearching={isSearching}
        onConsultar={handleConsultar}
        onExport={handleExportar}
        onAgregar={() => setModal({ modo: 'alta' })}
        onImport={handleImport}
      />

      {isEmptyResult && (
        <Alert className="border bg-card shadow-sm">
          <Info className="h-4 w-4" />
          <AlertTitle>Sin resultados</AlertTitle>
          <AlertDescription>
            No existe información para los criterios de búsqueda seleccionados.
          </AlertDescription>
        </Alert>
      )}

      {gridStatus !== 'empty' && (
        <DomiciliosGrid
          rows={rows}
          status={gridStatus}
          errorMessage={errorMensaje}
          page={page}
          pageSize={PAGE_SIZE}
          total={total}
          paises={paises}
          estados={estados}
          regimenes={regimenes}
          onFirstPage={() => setPage(1)}
          onPrevPage={() => setPage((p) => Math.max(1, p - 1))}
          onNextPage={() => setPage((p) => p + 1)}
          onLastPage={() => setPage(Math.ceil(total / PAGE_SIZE))}
          onEditarFila={(row) => setModal({ modo: 'modificar', identidad: rowToIdentidad(row) })}
          onEliminarFila={(row) => setModal({ modo: 'eliminar', identidad: rowToIdentidad(row) })}
        />
      )}

      <DomicilioModal
        open={modal !== null}
        modo={modal?.modo ?? 'consulta'}
        identidad={modal?.identidad}
        onCerrar={() => setModal(null)}
        onCancelar={() => setModal(null)}
      />

      <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="max-w-3xl p-0 gap-0">
          <div className="flex items-center justify-between rounded-t-lg bg-gradient-to-r from-primary to-red-700 px-4 py-1.5">
            <h2 className="text-sm font-bold text-primary-foreground">
              {cargaResultado ? 'Resultado de importación' : 'Importar Dirección Fiscal'}
            </h2>
          </div>

          <div className="px-5 py-4">
            {cargaResultado ? (
              <CargaMasivaResultadoTabla
                lineas={cargaResultado.lineas}
                onCerrar={handleCerrarResultado}
              />
            ) : (
              <CargaMasivaUploader onArchivoProcesado={handleArchivoProcesado} />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
