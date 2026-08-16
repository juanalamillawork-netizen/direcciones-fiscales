import { useState, useRef, useEffect, type ChangeEvent } from 'react';
import { Upload, Loader2, FileCheck, AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ApiError } from '../../api/direccionesFiscalesApi';
import { useCifUpload } from '../../hooks/useCifUpload';
import type { DatosExtraidosCIF } from '../../types/domicilioFiscal';

export type CifStatus = 'idle' | 'subiendo' | 'procesando' | 'exito' | 'error-formato' | 'error-rfc';

const TAMANO_MAXIMO = 5 * 1024 * 1024;
const ERROR_TAMANO = `El archivo excede el tamaño máximo de 5 MB.`;
const ERROR_TIPO = 'Solo se aceptan archivos PDF.';
const ERROR_PROCESAMIENTO = 'El archivo PDF no pudo ser procesado. Verifica que no esté corrupto o protegido.';
const ERROR_RFC = 'El RFC del CIF no coincide con el RFC registrado para este participante. No se puede cargar el domicilio.';

interface CifUploaderProps {
  fideicomisoId?: string;
  tipoParticipante?: string;
  numeroParticipante?: string;
  onArchivoProcesado?: (datos: DatosExtraidosCIF) => void;
  /** Solo para Storybook — fija el estado sin interacción real */
  demoStatus?: CifStatus;
  /** Solo para Storybook — datos mock para el estado exito */
  demoDatos?: DatosExtraidosCIF;
}

export function CifUploader({
  fideicomisoId,
  tipoParticipante,
  numeroParticipante,
  onArchivoProcesado,
  demoStatus,
  demoDatos,
}: CifUploaderProps) {
  const cifMutation = useCifUpload();
  const [status, setStatus] = useState<CifStatus>(demoStatus ?? 'idle');
  const [nombreArchivo, setNombreArchivo] = useState(
    demoStatus === 'subiendo' || demoStatus === 'procesando' ? 'cif_ejemplo.pdf' : '',
  );
  const [datosExtraidos, setDatosExtraidos] = useState<DatosExtraidosCIF | null>(
    demoStatus === 'exito' ? (demoDatos ?? null) : null,
  );
  const [mensajeError, setMensajeError] = useState(
    demoStatus === 'error-formato'
      ? ERROR_TAMANO
      : demoStatus === 'error-rfc'
        ? ERROR_RFC
        : '',
  );
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (demoStatus) {
      setStatus(demoStatus);
      setDatosExtraidos(demoStatus === 'exito' ? (demoDatos ?? null) : null);
      setNombreArchivo(
        demoStatus === 'subiendo' || demoStatus === 'procesando' ? 'cif_ejemplo.pdf' : '',
      );
      setMensajeError(
        demoStatus === 'error-formato'
          ? ERROR_TAMANO
          : demoStatus === 'error-rfc'
            ? ERROR_RFC
            : '',
      );
    }
  }, [demoStatus, demoDatos]);

  useEffect(() => {
    if (cifMutation.isPending) {
      setStatus('procesando');
    }
  }, [cifMutation.isPending]);

  useEffect(() => {
    if (!cifMutation.error) return;
    const error = cifMutation.error;
    if (error instanceof ApiError && error.status === 409) {
      setMensajeError(ERROR_RFC);
      setStatus('error-rfc');
      return;
    }
    if (error instanceof ApiError && (error.status === 400 || error.status === 422)) {
      setMensajeError(error.message || ERROR_PROCESAMIENTO);
      setStatus('error-formato');
      return;
    }
    setMensajeError(error instanceof ApiError ? error.message : ERROR_PROCESAMIENTO);
    setStatus('error-formato');
  }, [cifMutation.error]);

  function validarArchivo(file: File): string | null {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return ERROR_TIPO;
    }
    if (file.size > TAMANO_MAXIMO) {
      return ERROR_TAMANO;
    }
    return null;
  }

  function handleFileSelected(file: File) {
    const error = validarArchivo(file);
    if (error) {
      setMensajeError(error);
      setStatus('error-formato');
      return;
    }

    setNombreArchivo(file.name);
    setStatus('subiendo');
    setDatosExtraidos(null);
    setMensajeError('');

    if (!fideicomisoId || !tipoParticipante || !numeroParticipante) {
      setMensajeError('Falta información del participante para procesar el CIF.');
      setStatus('error-formato');
      return;
    }

    cifMutation.mutate(
      { archivo: file, fideicomisoId, tipoParticipante, numeroParticipante },
      {
        onSuccess: (datos) => {
          setDatosExtraidos(datos);
          setStatus('exito');
          onArchivoProcesado?.(datos);
        },
      },
    );
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelected(file);
    }
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelected(file);
    }
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  function reset() {
    setStatus('idle');
    setNombreArchivo('');
    setDatosExtraidos(null);
    setMensajeError('');
  }

  if (status === 'exito' && datosExtraidos) {
    return (
      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <FileCheck className="h-5 w-5 text-green-600" />
          <p className="text-sm font-medium text-green-700">
            CIF procesado correctamente
          </p>
        </div>

        <div className="mb-3 grid grid-cols-2 gap-x-6 gap-y-1 text-[11px]">
          <Campo label="Calle" valor={datosExtraidos.calle} />
          <Campo label="No. Exterior" valor={datosExtraidos.numeroExterior} />
          {datosExtraidos.numeroInterior && (
            <Campo label="No. Interior" valor={datosExtraidos.numeroInterior} />
          )}
          <Campo label="Colonia" valor={datosExtraidos.colonia} />
          <Campo label="Código Postal" valor={datosExtraidos.cp} />
          <Campo label="Municipio" valor={datosExtraidos.municipio} />
          <Campo label="Localidad" valor={datosExtraidos.localidad ?? ''} />
          <Campo label="Estado" valor={datosExtraidos.estado} />
          <Campo label="País" valor={datosExtraidos.pais} />
          {datosExtraidos.regimenFiscal && (
            <Campo label="Régimen Fiscal" valor={datosExtraidos.regimenFiscal} />
          )}
        </div>

        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={reset}>
          <X className="h-3.5 w-3.5" />
          Limpiar
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      {status === 'idle' && (
        <div
          role="button"
          tabIndex={0}
          className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/30 px-6 py-8 text-center transition-colors hover:border-primary/50"
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <Upload className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">
            Seleccionar archivo PDF
          </p>
          <p className="text-xs text-muted-foreground">
            o arrastra y suelta el archivo aquí
          </p>
          <p className="text-[10px] text-muted-foreground">
            Solo PDF · Máximo 5 MB
          </p>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handleInputChange}
          />
        </div>
      )}

      {status === 'subiendo' && (
        <div className="flex flex-col items-center gap-3 rounded-lg border bg-muted/30 px-6 py-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-foreground">
            Subiendo archivo...
          </p>
          <p className="text-xs text-muted-foreground">
            {nombreArchivo}
          </p>
        </div>
      )}

      {status === 'procesando' && (
        <div className="flex flex-col items-center gap-3 rounded-lg border bg-muted/30 px-6 py-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-foreground">
            Extrayendo datos del CIF...
          </p>
          <p className="text-xs text-muted-foreground">
            {nombreArchivo}
          </p>
        </div>
      )}

      {(status === 'error-formato' || status === 'error-rfc') && (
        <div className="space-y-3">
          <div role="alert" className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-destructive">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <p className="text-xs">
              {mensajeError ||
                (status === 'error-rfc' ? ERROR_RFC : ERROR_PROCESAMIENTO)}
            </p>
          </div>
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={reset}>
            <X className="h-3.5 w-3.5" />
            Reintentar
          </Button>
        </div>
      )}
    </div>
  );
}

function Campo({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex items-baseline gap-1">
      <span className="font-medium text-foreground">{label}:</span>
      <span className="text-muted-foreground">{valor}</span>
    </div>
  );
}