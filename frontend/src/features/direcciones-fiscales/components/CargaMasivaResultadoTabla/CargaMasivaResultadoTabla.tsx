import { XCircle, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { LineaResultado } from '../../types/domicilioFiscal';

function KPICard({
  label,
  count,
  children,
  className,
}: {
  label: string;
  count: number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-lg border p-4 flex flex-col items-center gap-2',
        'transition-colors hover:border-primary/50',
        className,
      )}
    >
      <span className="text-2xl font-bold {count > 0 ? 'text-foreground' : 'text-muted-foreground'}">
        {count}
      </span>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}

export function CargaMasivaResultadoTabla({
  lineas,
  onCerrar,
}: {
  lineas: LineaResultado[];
  onCerrar?: () => void;
}) {
  const totalRegistros = lineas.length;
  const registrosExitosos = lineas.filter((l) => l.estatus === 'EXITOSO').length;
  const registrosFallidos = lineas.filter((l) => l.estatus === 'ERROR').length;

  const estadoIcono = registrosFallidos > 0 ? <XCircle className="h-6 w-6 text-red-600" /> : <CheckCircle className="h-6 w-6 text-green-600" />;

  function getEstiloFila(linea: LineaResultado) {
    if (linea.estatus === 'ERROR') return 'text-red-600';
    if (linea.estatus === 'EXITOSO') return 'text-green-700';
    return 'text-muted-foreground';
  }

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {/* Sección Superior: Estado General */}
      <div className="text-center p-6">
        <div className="mx-auto mb-4">
          {estadoIcono}
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {registrosFallidos > 0 ? 'Carga completada con errores' : 'Carga completada exitosamente'}
        </h2>
        <p className="text-muted-foreground">
          Se procesaron <strong>{totalRegistros} registros.</strong>
        </p>
      </div>

      {/* Fila de Indicadores (KPIs) */}
      <div className="grid grid-cols-2 gap-2 px-6 pb-4">
        <KPICard
          label="Registros Exitosos"
          count={registrosExitosos}
        >
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="text-green-700">Exitosos</span>
        </KPICard>

        <KPICard
          label="Registros Fallidos"
          count={registrosFallidos}
        >
          <XCircle className="h-4 w-4 text-red-600" />
          <span className="text-red-700">Errores</span>
        </KPICard>
      </div>

      {/* Tabla de Errores con Desplazamiento */}
      {registrosFallidos > 0 && (
        <div className="overflow-x-auto rounded-lg border p-4">
          <div className="shadow-sm sm:rounded-lg">
            <table className="w-full text-sm text-muted-foreground">
              <thead>
                <tr className="sticky top-0 z-10 bg-background">
                  <th className="left-0 p-3 border-b border-border text-left font-medium uppercase text-xs text-muted-foreground">
                    Fila
                  </th>
                  <th className="p-3 border-b border-border text-left font-medium uppercase text-xs text-muted-foreground">
                    Registro
                  </th>
                  <th className="p-3 border-b border-border text-left font-medium uppercase text-xs text-muted-foreground">
                    Motivo del error
                  </th>
                </tr>
              </thead>
              <tbody>
                {lineas
                  .filter((l) => l.estatus === 'ERROR')
                  .map((linea) => (
                    <tr key={linea.secuencial} className="border-b transition-colors hover:bg-muted/50">
                      <td className="p-3">
                        <p className="font-medium">{linea.secuencial}</p>
                      </td>
                      <td className="p-3">
                        <p className="font-medium">{linea.rfc || linea.calle || '—'}</p>
                        <p className="text-xs text-muted-foreground">
                          {linea.calle || ''} {linea.numeroExterior || ''}
                        </p>
                      </td>
                      <td className="p-3 break-all">
                        <p className={getEstiloFila(linea)}>{linea.mensaje || 'Error desconocido'}</p>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Botón Cerrar */}
      <div className="flex justify-end p-6">
        <Button
          variant="outline"
          size="sm"
          onClick={onCerrar}
          className="h-7 text-xs w-auto"
        >
          <X className="h-3.5 w-3.5" />
          Cerrar
        </Button>
      </div>
    </div>
  );
}