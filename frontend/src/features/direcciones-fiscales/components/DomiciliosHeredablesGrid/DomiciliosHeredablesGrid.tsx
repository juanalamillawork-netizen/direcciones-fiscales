import { Check, ChevronDown, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type { DomicilioHeredable } from '../../types/domicilioFiscal';

const COLUMNAS: { key: string; label: string }[] = [
  { key: 'calle', label: 'Calle' },
  { key: 'colonia', label: 'Colonia' },
  { key: 'poblacion', label: 'Localidad' },
  { key: 'estado', label: 'Estado' },
  { key: 'pais', label: 'País' },
  { key: 'codigoPostal', label: 'Código Postal' },
];

const GRID_STYLE = { gridTemplateColumns: '36px repeat(6, 1fr) 20px' } as const;

export type HGridStatus = 'loading' | 'empty' | 'error' | 'data';

interface DomiciliosHeredablesGridProps {
  domicilios: DomicilioHeredable[];
  status: HGridStatus;
  errorMessage?: string;
  onSeleccionar?: (domicilio: DomicilioHeredable) => void;
}

export function DomiciliosHeredablesGrid({
  domicilios,
  status,
  errorMessage,
  onSeleccionar,
}: DomiciliosHeredablesGridProps) {
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center rounded-lg border bg-card p-12 shadow-sm">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {errorMessage ?? 'Ocurrió un error al cargar los domicilios heredables.'}
        </AlertDescription>
      </Alert>
    );
  }

  const hasData = status === 'data' && domicilios.length > 0;

  return (
    <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
      <div className="overflow-y-auto h-[420px]">
        <div className="sticky top-0 z-10 bg-gradient-to-r from-primary to-red-700 px-4 py-1.5">
          <div
            className="grid gap-2 text-center text-[10px] font-medium text-primary-foreground"
            style={GRID_STYLE}
          >
            <span />
            {COLUMNAS.map((col) => (
              <span key={col.key}>{col.label}</span>
            ))}
            <span />
          </div>
        </div>

        {!hasData ? (
          <div className="px-4 py-10 text-center text-xs text-muted-foreground">
            No hay domicilios heredables para este participante
          </div>
        ) : (
          <Accordion type="multiple" className="divide-y">
            {domicilios.map((domicilio, index) => (
              <AccordionItem
                key={domicilio.numSecDirecc != null ? domicilio.numSecDirecc : index}
                value={domicilio.numSecDirecc != null ? String(domicilio.numSecDirecc) : String(index)}
                className="border-0 bg-white even:bg-gray-200"
              >
                <AccordionTrigger
                  hideChevron
                  className="grid gap-2 px-4 py-3 text-[11px] hover:bg-muted/50 hover:no-underline"
                  style={GRID_STYLE}
                >
                  <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => onSeleccionar?.(domicilio)}
                      className="flex items-center justify-center text-muted-foreground hover:text-primary"
                      title="Seleccionar domicilio"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <span className="truncate text-center">
                    {[domicilio.calle, domicilio.numeroExterior].filter(Boolean).join(' ')}
                  </span>
                  <span className="truncate text-center">{domicilio.colonia}</span>
                  <span className="truncate text-center">{domicilio.poblacion}</span>
                  <span className="truncate text-center">{domicilio.estado}</span>
                  <span className="truncate text-center">{domicilio.pais}</span>
                  <span className="truncate text-center">{domicilio.codigoPostal}</span>
                  <ChevronDown className="h-3.5 w-3.5 justify-self-end text-muted-foreground" />
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-1 px-4 pb-3 pt-1 text-[11px] text-muted-foreground">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-1 sm:grid-cols-4">
                      <Detail label="Calle" value={domicilio.calle} />
                      <Detail label="No. Exterior" value={domicilio.numeroExterior} />
                      <Detail label="Colonia" value={domicilio.colonia} />
                      <Detail label="Localidad" value={domicilio.poblacion} />
                      <Detail label="Municipio/Alcaldía" value={domicilio.municipio} />
                      <Detail label="Estado" value={domicilio.estado} />
                      <Detail label="País" value={domicilio.pais} />
                      <Detail label="Código Postal" value={domicilio.codigoPostal} />
                      <Detail label="Tipo de Domicilio" value={domicilio.tipoDomicilio} />
                      <Detail label="Secuencia" value={domicilio.numSecDirecc != null ? String(domicilio.numSecDirecc) : undefined} />
                      <Detail label="Nombre Legal" value={domicilio.nombreLegal} />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <span className="font-medium text-foreground">{label}: </span>
      <span>{value || '—'}</span>
    </div>
  );
}
