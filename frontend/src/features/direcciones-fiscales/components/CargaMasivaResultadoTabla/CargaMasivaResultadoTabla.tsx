import { CheckCircle, XCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { LineaResultado } from '../../types/domicilioFiscal';

const GRID_STYLE = { gridTemplateColumns: '80px 100px 1fr' } as const;

const COLUMNAS: { key: string; label: string }[] = [
  { key: 'secuencial', label: 'Secuencial' },
  { key: 'estatus', label: 'Estatus' },
  { key: 'mensaje', label: 'Mensaje' },
];

interface CargaMasivaResultadoTablaProps {
  lineas: LineaResultado[];
  onCerrar?: () => void;
}

function deriveDisplayState(lineas: LineaResultado[]) {
  if (lineas.length === 0) return 'vacio' as const;
  const hasError = lineas.some((l) => l.estatus === 'ERROR');
  const hasExito = lineas.some((l) => l.estatus === 'EXITOSO');
  if (hasError && hasExito) return 'mixto' as const;
  if (hasError) return 'todos-error' as const;
  return 'todos-exito' as const;
}

export function CargaMasivaResultadoTabla({ lineas, onCerrar }: CargaMasivaResultadoTablaProps) {
  const state = deriveDisplayState(lineas);

  if (state === 'vacio') {
    return (
      <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
        <div className="sticky top-0 z-10 bg-gradient-to-r from-primary to-red-700 px-4 py-1.5">
          <div
            className="grid gap-2 text-center text-[10px] font-medium text-primary-foreground"
            style={GRID_STYLE}
          >
            {COLUMNAS.map((col) => (
              <span key={col.key}>{col.label}</span>
            ))}
          </div>
        </div>
        <div className="px-4 py-10 text-center text-xs text-muted-foreground">
          Sin resultados de carga masiva
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
        <div className="sticky top-0 z-10 bg-gradient-to-r from-primary to-red-700 px-4 py-1.5">
          <div
            className="grid gap-2 text-center text-[10px] font-medium text-primary-foreground"
            style={GRID_STYLE}
          >
            {COLUMNAS.map((col) => (
              <span key={col.key}>{col.label}</span>
            ))}
          </div>
        </div>

        <div className="divide-y">
          {lineas.map((linea) => (
            <div
              key={linea.secuencial}
              className="grid gap-2 px-4 py-2.5 text-[11px] bg-white even:bg-gray-200 items-center"
              style={GRID_STYLE}
            >
              <span className="text-center tabular-nums text-muted-foreground">
                {linea.secuencial}
              </span>

              <div className="flex items-center justify-center gap-1.5">
                {linea.estatus === 'EXITOSO' ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                    <span className="text-green-700">Exitoso</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-red-600 shrink-0" />
                    <span className="text-red-700">Error</span>
                  </>
                )}
              </div>

              <span className="text-muted-foreground truncate">
                {linea.estatus === 'ERROR' ? (linea.mensaje || 'Error desconocido') : ''}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={onCerrar}>
          <X className="h-3.5 w-3.5" />
          Cerrar
        </Button>
      </div>
    </div>
  );
}
