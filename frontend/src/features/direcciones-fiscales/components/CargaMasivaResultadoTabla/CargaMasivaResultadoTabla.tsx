import { CheckCircle, XCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type { LineaResultado } from '../../types/domicilioFiscal';

function Detail({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex gap-1">
      <span className="font-medium text-foreground text-[11px]">{label}:</span>
      <span className="text-muted-foreground text-[11px] break-all">{value || '—'}</span>
    </div>
  );
}

export function CargaMasivaResultadoTabla({ lineas, onCerrar }: { lineas: LineaResultado[]; onCerrar?: () => void }) {
  return (
    <div className="space-y-3">
      <Accordion type="multiple" className="w-full">
        {lineas.map((linea) => (
          <AccordionItem key={linea.secuencial} value={String(linea.secuencial)}>
            <AccordionTrigger className="grid gap-3 px-4 py-2.5 text-[11px] hover:bg-muted/50 hover:no-underline">
              <span className="text-center text-muted-foreground">
                {linea.secuencial}
              </span>

              <div className="flex items-center gap-2">
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
            </AccordionTrigger>

            <AccordionContent>
              {linea.estatus === 'ERROR' && (
                <p className="text-red-600 text-[11px] break-all mb-3">
                  {linea.mensaje || 'Error desconocido'}
                </p>
              )}

              <div className="grid gap-2">
                <Detail label="Fideicomiso" value={linea.fideicomiso} />
                <Detail label="Tipo Participante" value={linea.tipoParticipante} />
                <Detail label="No. Participante" value={linea.numeroParticipante} />
                <Detail label="RFC" value={linea.rfc} />
                <Detail label="Nacionalidad" value={linea.nacionalidad} />
                <Detail label="Teléfono" value={linea.telefono} />
                <Detail label="Clave País/Lada" value={linea.clavePaisLada} />
                <Detail label="Correo Electrónico" value={linea.correoElectronico} />
                <Detail label="Calle" value={linea.calle} />
                <Detail label="No. Exterior" value={linea.numeroExterior} />
                <Detail label="No. Interior" value={linea.numeroInterior} />
                <Detail label="Colonia" value={linea.colonia} />
                <Detail label="Municipio" value={linea.municipio} />
                <Detail label="Localidad" value={linea.localidad} />
                <Detail label="Código Postal" value={linea.codigoPostal} />
                <Detail label="País" value={linea.pais} />
                <Detail label="Estado" value={linea.estado} />
                <Detail label="Régimen Fiscal" value={linea.regimenFiscalDescripcion || linea.regimenFiscal} />
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="flex justify-end">
        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={onCerrar}>
          <X className="h-3.5 w-3.5" />
          Cerrar
        </Button>
      </div>
    </div>
  );
}