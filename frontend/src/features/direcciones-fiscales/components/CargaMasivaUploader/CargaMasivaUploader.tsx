import { useState, useRef, type ChangeEvent } from 'react';
import { Upload, Loader2, FileUp, FileCheck, AlertTriangle, X, ChevronDownIcon } from 'lucide-react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { useCargaMasiva } from '../../hooks/useCargaMasiva';
import type { ResultadoCargaMasiva } from '../../types/domicilioFiscal';

export type CargaMasivaStatus = 'idle' | 'subiendo' | 'procesando' | 'completado' | 'error';

const TAMANO_MAXIMO = 10 * 1024 * 1024;
const ERROR_TAMANO = `El archivo excede el tamaño máximo de 10 MB.`;
const ERROR_TIPO = 'Solo se aceptan archivos de texto (.txt).';
const ERROR_TECNICO = 'Ocurrió un error técnico al subir el archivo. Intente nuevamente.';

interface CargaMasivaUploaderProps {
  /** Se llama con el resumen/líneas reales cuando el backend termina de procesar. */
  onArchivoProcesado?: (resultado: ResultadoCargaMasiva) => void;
  /** Solo para previsualización estática en historias; no se usa en el flujo real. */
  demoStatus?: CargaMasivaStatus;
  demoResultado?: ResultadoCargaMasiva;
}

type FaseLocal = 'idle' | 'subiendo' | 'procesando';

export function CargaMasivaUploader({ onArchivoProcesado, demoStatus, demoResultado }: CargaMasivaUploaderProps) {
  const mutation = useCargaMasiva();
  const [fase, setFase] = useState<FaseLocal>(
    demoStatus === 'subiendo' || demoStatus === 'procesando' ? demoStatus : 'idle',
  );
  const [nombreArchivo, setNombreArchivo] = useState(
    demoStatus === 'subiendo' || demoStatus === 'procesando' ? 'carga_masiva.txt' : ''
  );
  const [mensajeError, setMensajeError] = useState(demoStatus === 'error' ? ERROR_TECNICO : '');
  const [resultadoDemo, setResultadoDemo] = useState<ResultadoCargaMasiva | null>(
    demoStatus === 'completado' ? (demoResultado ?? null) : null
  );
  const inputRef = useRef<HTMLInputElement>(null);

  const status: CargaMasivaStatus =
    demoStatus ??
    (mutation.isError ? 'error' : mutation.isSuccess ? 'completado' : fase);
  const resultado = demoStatus === 'completado' ? resultadoDemo : mutation.data;
  const errorMostrado = mensajeError || ERROR_TECNICO;

  function validarArchivo(file: File): string | null {
    if (!file.name.toLowerCase().endsWith('.txt')) {
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
      setFase('idle');
      return;
    }

    setNombreArchivo(file.name);
    setMensajeError('');
    setFase('subiendo');

    mutation.mutate(file, {
      onSuccess: (r) => {
        onArchivoProcesado?.(r);
      },
    });

    window.setTimeout(() => {
      setFase((prev) => (prev === 'subiendo' ? 'procesando' : prev));
    }, 900);
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
    mutation.reset();
    setFase('idle');
    setNombreArchivo('');
    setMensajeError('');
    setResultadoDemo(null);
  }

  if (status === 'completado' && resultado) {
    const todosExitosos = resultado.registrosConError === 0;
    const todosError = resultado.registrosExitosos === 0;

    return (
      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <Accordion type="single" className="w-full">
          {resultado.lineas.map((linea) => (
            <AccordionItem key={linea.secuencial}>
              <AccordionTrigger>
                <div className="flex items-center justify-between">
                  <span>
                    {linea.estatus === 'EXITOSO' ? (
                      <span className="text-green-600">
                        {linea.estatus === 'EXITOSO' ? 'Exitoso' : ''}
                      </span>
                    ) : (
                      <span className="text-red-600">
                        {linea.estatus === 'ERROR' ? 'Error' : ''}
                      </span>
                    )}
                  </span>
                  <ChevronDownIcon className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <p className={`text-sm font-medium ${linea.estatus === 'EXITOSO' ? 'text-green-700' : 'text-red-700'}`}>
                  {linea.estatus}: {linea.mensaje || ''}
                </p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <Button variant="outline" size="sm" className="h-7 text-xs mt-4 w-full" onClick={reset}>
          <X className="h-3.5 w-3.5" />
          {todosError ? 'Reintentar' : 'Nueva carga'}
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
            Seleccionar archivo .txt
          </p>
          <p className="text-xs text-muted-foreground">
            o arrastra y suelta el archivo aquí
          </p>
          <p className="text-[10px] text-muted-foreground">
            Solo .txt · Máximo 10 MB
          </p>
          <input
            ref={inputRef}
            type="file"
            accept=".txt"
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
            Procesando líneas del archivo...
          </p>
          <p className="text-xs text-muted-foreground">
            {nombreArchivo}
          </p>
        </div>
      )}

      {status === 'error' && (
        <div className="space-y-3">
          <div role="alert" className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-destructive">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <p className="text-xs">
              {errorMostrado}
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