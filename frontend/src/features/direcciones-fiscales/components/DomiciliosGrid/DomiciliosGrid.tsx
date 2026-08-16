import { useLayoutEffect, useRef, useState } from 'react';
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, Loader2, Pencil, ChevronDown, Trash2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type { DomicilioFiscalRow } from '../../types/domicilioFiscal';

const COLUMNAS: { key: keyof DomicilioFiscalRow; label: string }[] = [
  { key: 'fideicomisoId', label: 'Fideicomiso' },
  { key: 'tipoPersona', label: 'Tipo de Participante' },
  { key: 'numeroParticipante', label: 'No. de Participante' },
  { key: 'calle', label: 'Calle' },
  { key: 'colonia', label: 'Colonia' },
  { key: 'localidad', label: 'Localidad' },
  { key: 'paisId', label: 'País' },
];

const MAX_VISIBLE_ROWS = 10;
const FALLBACK_MAX_HEIGHT = 420;

function rowKey(row: DomicilioFiscalRow): string {
  return `${row.fideicomisoId}-${row.tipoPersona}-${row.numeroParticipante}`;
}

const GRID_STYLE = { gridTemplateColumns: '64px repeat(7, 1fr) 20px' } as const;
const CELDA_CLASS = 'truncate text-center px-2';

export type GridStatus = 'idle' | 'loading' | 'error' | 'empty' | 'data';

interface DomiciliosGridProps {
  rows: DomicilioFiscalRow[];
  status: GridStatus;
  errorMessage?: string;
  page?: number;
  pageSize?: number;
  total?: number;
  paises?: ReadonlyMap<number, string>;
  estados?: ReadonlyMap<number, string>;
  regimenes?: ReadonlyMap<number, string>;
  onFirstPage?: () => void;
  onPrevPage?: () => void;
  onNextPage?: () => void;
  onLastPage?: () => void;
  onEditarFila?: (row: DomicilioFiscalRow) => void;
  onEliminarFila?: (row: DomicilioFiscalRow) => void;
}

export function DomiciliosGrid({
  rows,
  status,
  errorMessage,
  page = 1,
  pageSize = 10,
  total = 0,
  paises,
  estados,
  regimenes,
  onFirstPage,
  onPrevPage,
  onNextPage,
  onLastPage,
  onEditarFila,
  onEliminarFila,
}: DomiciliosGridProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const firstRowRef = useRef<HTMLDivElement>(null);
  const [maxHeight, setMaxHeight] = useState<number>(FALLBACK_MAX_HEIGHT);

  useLayoutEffect(() => {
    const header = headerRef.current;
    const firstRow = firstRowRef.current;
    if (!header || !firstRow) return;
    const headerHeight = header.offsetHeight;
    const rowHeight = firstRow.offsetHeight;
    if (headerHeight > 0 && rowHeight > 0) {
      setMaxHeight(headerHeight + MAX_VISIBLE_ROWS * rowHeight);
    }
  }, [rows.length]);

  if (status === 'loading') {
    return (
      <div
        aria-busy="true"
        data-testid="grid-cargando"
        className="flex flex-col items-center justify-center gap-3 rounded-lg border bg-card p-12 shadow-sm"
      >
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-xs font-medium text-muted-foreground">Consultando…</span>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{errorMessage ?? 'Ocurrió un error al cargar los datos.'}</AlertDescription>
      </Alert>
    );
  }

  const hasData = status === 'data' && rows.length > 0;
  const from = hasData ? (page - 1) * pageSize + 1 : 0;
  const to = hasData ? Math.min(page * pageSize, total) : 0;
  const visibleRows = hasData ? rows.slice((page - 1) * pageSize, page * pageSize) : [];

  return (
    <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
      <div ref={scrollContainerRef} className="overflow-y-auto" style={{ maxHeight }}>
        <div ref={headerRef} className="sticky top-0 z-10 bg-gradient-to-r from-primary to-red-700 px-4 py-1.5">
          <div className="grid gap-3 text-center text-[10px] font-medium text-primary-foreground" style={GRID_STYLE}>
            <span />
            {COLUMNAS.map((col) => (
              <span key={col.key} className={CELDA_CLASS}>{col.label}</span>
            ))}
            <span />
          </div>
        </div>

        {!hasData ? (
          <div className="px-4 py-10 text-center text-xs text-muted-foreground">
            Sin resultados
          </div>
        ) : (
          <Accordion type="multiple" className="divide-y">
            {visibleRows.map((row, index) => {
              const nombrePais = row.paisId != null ? (paises?.get(row.paisId) ?? String(row.paisId)) : '—';
              const nombreEstado = row.estadoId != null ? (estados?.get(row.estadoId) ?? String(row.estadoId)) : '—';
              const regimenDescripcion = resolverRegimen(row.regimenFiscal, regimenes);
              return (
                <AccordionItem
                  key={rowKey(row)}
                  value={rowKey(row)}
                  ref={index === 0 ? firstRowRef : undefined}
                  className="border-0 bg-white even:bg-gray-200"
                >
                  <AccordionTrigger
                    hideChevron
                    className="grid gap-3 px-4 py-3 text-[11px] hover:bg-muted/50 hover:no-underline"
                    style={GRID_STYLE}
                  >
                    <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => onEditarFila?.(row)}
                        className="text-muted-foreground hover:text-primary"
                        title="Editar registro"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <div className="h-4 w-px bg-gray-300" aria-hidden="true" />
                      <button
                        type="button"
                        onClick={() => onEliminarFila?.(row)}
                        className="text-muted-foreground hover:text-destructive"
                        title="Eliminar registro"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <span className={CELDA_CLASS}>{row.fideicomisoId}</span>
                    <span className={CELDA_CLASS}>{row.tipoPersona}</span>
                    <span className={CELDA_CLASS}>{row.numeroParticipante}</span>
                    <span className={CELDA_CLASS}>{row.calle}</span>
                    <span className={CELDA_CLASS}>{row.colonia}</span>
                    <span className={CELDA_CLASS}>{row.localidad ?? ''}</span>
                    <span className={CELDA_CLASS}>{nombrePais}</span>
                    <ChevronDown className="h-3.5 w-3.5 justify-self-end text-muted-foreground" />
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-1 px-4 pb-3 pt-1 text-[11px] text-muted-foreground">
                      <div className="col-span-full">
                        <Detail label="Calle" value={row.calle} />
                      </div>
                      <div className="grid grid-cols-2 gap-x-8 gap-y-1 sm:grid-cols-4">
                        <Detail label="No. Exterior" value={row.numeroExterior} />
                        <Detail label="No. Interior" value={row.numeroInterior} />
                        <Detail label="Colonia" value={row.colonia} />
                        <Detail label="Municipio" value={row.municipio} />
                        <Detail label="Localidad" value={row.localidad} />
                        <Detail label="Estado" value={nombreEstado} />
                        <Detail label="Código Postal" value={row.codigoPostal} />
                        <Detail label="Referencia" value={row.referencia} />
                        <Detail label="Teléfono" value={row.telefono} />
                        <Detail label="Régimen Fiscal" value={regimenDescripcion} />
                        <Detail label="Nombre Fiscal" value={row.nombreLegal} />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </div>

      <div className="flex items-center justify-center gap-4 bg-gradient-to-r from-primary to-red-700 px-4 py-1.5 text-[10px] text-primary-foreground">
        <span>
          {hasData ? `${from}–${to} de ${total} registros` : '0 registros'}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-primary-foreground hover:bg-white/20"
            aria-label="Primera página"
            disabled={!hasData || page <= 1}
            onClick={onFirstPage}
          >
            <ChevronsLeft className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-primary-foreground hover:bg-white/20"
            aria-label="Página anterior"
            disabled={!hasData || page <= 1}
            onClick={onPrevPage}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-primary-foreground hover:bg-white/20"
            aria-label="Siguiente página"
            disabled={!hasData || to >= total}
            onClick={onNextPage}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-primary-foreground hover:bg-white/20"
            aria-label="Última página"
            disabled={!hasData || to >= total}
            onClick={onLastPage}
          >
            <ChevronsRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function resolverRegimen(clave?: string, regimenes?: ReadonlyMap<number, string>): string {
  if (!clave) return '—';
  const numero = Number(clave);
  const descripcion = regimenes?.get(numero);
  if (!Number.isNaN(numero) && descripcion) return descripcion;
  return clave;
}

function Detail({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <span className="font-medium text-foreground">{label}: </span>
      <span>{value || '—'}</span>
    </div>
  );
}
