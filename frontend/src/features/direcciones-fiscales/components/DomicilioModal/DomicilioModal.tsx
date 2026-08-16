import { useCallback, useEffect, useMemo, useState } from 'react';
import { UserPlus, Pencil, Trash2, X, Check, Ban, ArrowLeft, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DomicilioForm } from '../DomicilioForm/DomicilioForm';
import { DomiciliosHeredablesGrid, type HGridStatus } from '../DomiciliosHeredablesGrid/DomiciliosHeredablesGrid';
import { useDomiciliosHeredables } from '../../hooks/useDomiciliosHeredables';
import { usePaises, useEstados } from '../../hooks/useCatalogos';
import { CifUploader } from '../CifUploader/CifUploader';
import { useDomicilioFiscalDetalle } from '../../hooks/useDireccionesFiscales';
import { useCrearDomicilioFiscal, useActualizarDomicilioFiscal, useEliminarDomicilioFiscal } from '../../hooks/useGuardarDomicilio';
import { ApiError, type CrearDomicilioFiscalRequest, type ActualizarDomicilioFiscalRequest, type IdentidadDomicilio } from '../../api/direccionesFiscalesApi';
import type {
  ModoFormulario,
  DomicilioFiscalFormData,
  OrigenDato,
  DomicilioHeredable,
  DatosExtraidosCIF,
  DomicilioFiscalRow,
} from '../../types/domicilioFiscal';
import type { TipoPersonaCatalogo } from '../../api/catalogosApi';

type VistaActiva = 'normal' | 'heredar' | 'cif';

interface DomicilioModalProps {
  open: boolean;
  modo: ModoFormulario;
  identidad?: IdentidadDomicilio;
  initialData?: Partial<DomicilioFiscalFormData>;
  tipoPersona?: TipoPersonaCatalogo;
  origen?: OrigenDato;
  errorCp?: string;
  errorRegimen?: string;
  onAlta?: () => void;
  onModificar?: () => void;
  onBaja?: () => void;
  onCerrar?: () => void;
  onCancelar?: () => void;
  onGuardado?: (dto: DomicilioFiscalRow) => void;
  demoVistaActiva?: VistaActiva;
}

function mapearHeredableAFormData(h: DomicilioHeredable): Partial<DomicilioFiscalFormData> {
  return {
    calle: h.calle,
    numeroExterior: h.numeroExterior ?? '',
    numeroInterior: '',
    colonia: h.colonia,
    localidad: h.poblacion,
    municipio: h.municipio ?? '',
    pais: h.paisId != null ? String(h.paisId) : '',
    estado: h.estadoId != null ? String(h.estadoId) : '',
    codigoPostal: h.codigoPostal,
    nombreLegal: h.nombreLegal ?? '',
  };
}

function normalizar(nombre: string): string {
  return nombre
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function mapearCIFAFormData(d: DatosExtraidosCIF): Partial<DomicilioFiscalFormData> {
  return {
    calle: d.calle,
    numeroExterior: d.numeroExterior,
    numeroInterior: d.numeroInterior ?? '',
    colonia: d.colonia,
    codigoPostal: d.cp,
    municipio: d.municipio,
    localidad: d.localidad ?? '',
    estado: d.estadoId != null ? String(d.estadoId) : d.estado,
    pais: d.paisId != null ? String(d.paisId) : d.pais,
    nombreLegal: d.nombreLegal ?? '',
    regimenFiscal: d.regimenFiscalId != null ? String(d.regimenFiscalId) : (d.regimenFiscal ?? ''),
    telefono: d.telefono ?? '',
    correoElectronico: d.correoElectronico ?? '',
    referencia: d.referencia ?? '',
  };
}

function mapearDtoAFormData(dto: DomicilioFiscalRow): Partial<DomicilioFiscalFormData> {
  return {
    fideicomiso: dto.fideicomisoId,
    tipoParticipante: dto.tipoPersona,
    noParticipante: dto.numeroParticipante,
    calle: dto.calle,
    numeroExterior: dto.numeroExterior,
    numeroInterior: dto.numeroInterior ?? '',
    colonia: dto.colonia,
    localidad: dto.localidad ?? '',
    municipio: dto.municipio ?? '',
    pais: dto.paisId != null ? String(dto.paisId) : '',
    estado: dto.estadoId != null ? String(dto.estadoId) : '',
    codigoPostal: dto.codigoPostal,
    referencia: dto.referencia ?? '',
    telefono: dto.telefono ?? '',
    regimenFiscal: dto.regimenFiscal ?? '',
    correoElectronico: dto.correoElectronico ?? '',
    nombreFiscal: dto.nombreLegal ?? '',
    nombreLegal: dto.nombreLegal ?? '',
  };
}

function construirCrearRequest(data: Partial<DomicilioFiscalFormData>): CrearDomicilioFiscalRequest | null {
  if (!data.fideicomiso || !data.tipoParticipante || !data.noParticipante) return null;
  return {
    fideicomisoId: data.fideicomiso,
    tipoPersona: data.tipoParticipante,
    numeroParticipante: data.noParticipante,
    calle: data.calle ?? '',
    numeroExterior: data.numeroExterior ?? '',
    numeroInterior: data.numeroInterior,
    colonia: data.colonia ?? '',
    municipio: data.municipio ?? '',
    localidad: data.localidad,
    paisId: Number(data.pais),
    estadoId: Number(data.estado),
    codigoPostal: data.codigoPostal ?? '',
    referencia: data.referencia,
    telefono: data.telefono,
    regimenFiscal: data.regimenFiscal,
    correoElectronico: data.correoElectronico,
  };
}

function construirActualizarRequest(data: Partial<DomicilioFiscalFormData>): ActualizarDomicilioFiscalRequest {
  return {
    calle: data.calle ?? '',
    numeroExterior: data.numeroExterior ?? '',
    numeroInterior: data.numeroInterior,
    colonia: data.colonia ?? '',
    municipio: data.municipio ?? '',
    localidad: data.localidad,
    paisId: Number(data.pais),
    estadoId: Number(data.estado),
    codigoPostal: data.codigoPostal ?? '',
    referencia: data.referencia,
    telefono: data.telefono,
    regimenFiscal: data.regimenFiscal,
    correoElectronico: data.correoElectronico,
  };
}

export function DomicilioModal({
  open,
  modo,
  identidad,
  initialData: initialDataProp,
  tipoPersona,
  origen: origenProp,
  errorCp,
  errorRegimen,
  onAlta,
  onModificar,
  onBaja,
  onCerrar,
  onCancelar,
  onGuardado,
  demoVistaActiva,
}: DomicilioModalProps) {
  const [vistaActiva, setVistaActiva] = useState<VistaActiva>(demoVistaActiva ?? 'normal');
  const [modoActual, setModoActual] = useState<ModoFormulario>(modo);
  const [formData, setFormData] = useState<Partial<DomicilioFiscalFormData>>(initialDataProp ?? {});
  const [origen, setOrigen] = useState<OrigenDato | undefined>(origenProp);
  const [formValido, setFormValido] = useState(false);
  const [errorGuardar, setErrorGuardar] = useState<string | null>(null);
  const [detalleListo, setDetalleListo] = useState(false);

  const usaDetalle = (modoActual === 'modificar' || modoActual === 'consulta' || modoActual === 'eliminar') && identidad != null;
  const detalleQuery = useDomicilioFiscalDetalle(usaDetalle ? identidad : null, open);

  const crearMutation = useCrearDomicilioFiscal();
  const actualizarMutation = useActualizarDomicilioFiscal();
  const eliminarMutation = useEliminarDomicilioFiscal();

  const guardando = crearMutation.isPending || actualizarMutation.isPending || eliminarMutation.isPending;
  const eliminando = eliminarMutation.isPending;

  useEffect(() => {
    if (!open) return;
    setModoActual(modo);
    setVistaActiva(demoVistaActiva ?? 'normal');
    setFormData(initialDataProp ?? {});
    setOrigen(origenProp);
    setErrorGuardar(null);
    setDetalleListo(false);
  }, [open, modo]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!detalleQuery.data) return;
    setFormData(mapearDtoAFormData(detalleQuery.data));
    setDetalleListo(true);
    setErrorGuardar(null);
  }, [detalleQuery.data]);

  function handleHeredarDomicilio() {
    setVistaActiva('heredar');
  }

  function handleCargarCif() {
    setVistaActiva('cif');
  }

  function handleSeleccionarHeredable(h: DomicilioHeredable) {
    setFormData((prev) => ({ ...prev, ...mapearHeredableAFormData(h) }));
    setOrigen('HEREDADO_GRID');
    setVistaActiva('normal');
  }

  function handleCifProcesado(d: DatosExtraidosCIF) {
    const { pais, estado } = resolverPaisEstado(d);
    setFormData((prev) => ({ ...prev, ...mapearCIFAFormData(d), pais, estado }));
    setOrigen('CIF_PDF');
    setVistaActiva('normal');
  }

  function cancelarVista() {
    setVistaActiva('normal');
  }

  const handleFormDataChange = useCallback((partial: Partial<DomicilioFiscalFormData>) => {
    setFormData((prev) => ({ ...prev, ...partial }));
  }, []);

  function irAlta() {
    onAlta?.();
    setModoActual('alta');
    setFormData({});
    setOrigen(undefined);
    setErrorGuardar(null);
  }

  function irModificar() {
    onModificar?.();
    setModoActual('modificar');
    setErrorGuardar(null);
  }

  function manejarAceptar() {
    setErrorGuardar(null);
    if (modoActual === 'alta') {
      const request = construirCrearRequest(formData);
      if (!request) {
        setErrorGuardar('Complete los datos obligatorios antes de guardar.');
        return;
      }
      crearMutation.mutate(request, {
        onSuccess: (dto) => {
          onGuardado?.(dto);
          onCerrar?.();
        },
        onError: (error) => {
          setErrorGuardar(
            error instanceof ApiError && error.status === 409
              ? 'Ya existe un domicilio fiscal con la misma llave (Fideicomiso + Tipo de Participante + No. de Participante).'
              : error instanceof ApiError
                ? error.message
                : 'Ocurrió un error al guardar el domicilio.',
          );
        },
      });
      return;
    }
    if (modoActual === 'modificar' && identidad) {
      actualizarMutation.mutate(
        { identidad, request: construirActualizarRequest(formData) },
        {
          onSuccess: (dto) => {
            onGuardado?.(dto);
            onCerrar?.();
          },
          onError: (error) => {
            setErrorGuardar(
              error instanceof ApiError && error.status === 404
                ? 'El registro ya no existe. Puede haber sido eliminado entre la consulta y el guardado.'
                : error instanceof ApiError
                  ? error.message
                  : 'Ocurrió un error al guardar el domicilio.',
            );
          },
        },
      );
    }
  }

  function manejarEliminar() {
    if (modoActual !== 'eliminar' || !identidad) return;
    eliminarMutation.mutate(identidad, {
      onSuccess: () => {
        onCerrar?.();
      },
      onError: (error) => {
        setErrorGuardar(
          error instanceof ApiError && error.status === 404
            ? 'El registro ya no existe. Puede haber sido eliminado entre la consulta y el borrado.'
            : error instanceof ApiError
              ? error.message
              : 'Ocurrió un error al eliminar el domicilio.',
        );
      },
    });
  }

  const esConsulta = modoActual === 'consulta';
  const esEliminar = modoActual === 'eliminar';

  const cargandoDetalle = usaDetalle && detalleQuery.isLoading;
  const errorDetalle = detalleQuery.isError
    ? detalleQuery.error instanceof ApiError && detalleQuery.error.status === 404
      ? 'El registro solicitado no existe.'
      : 'Ocurrió un error al cargar el registro.'
    : null;

  const formKey = `${modoActual}-${detalleListo ? 'd' : 'n'}-${identidad?.numContrato ?? ''}-${identidad?.cvePers ?? ''}-${identidad?.numPersFid ?? ''}`;

  const formListo = !usaDetalle || detalleListo;

  const heredablesParams = useMemo(() => {
    if (vistaActiva !== 'heredar') return null;
    const fideicomisoValidado = Boolean(formData.nombreFideicomiso);
    const participanteValidado = Boolean(formData.rfc);
    if (!fideicomisoValidado || !participanteValidado) return null;
    if (!formData.fideicomiso || !formData.tipoParticipante || !formData.noParticipante) return null;
    const numContrato = Number(formData.fideicomiso);
    const numParticipante = Number(formData.noParticipante);
    if (Number.isNaN(numContrato) || Number.isNaN(numParticipante)) return null;
    return { numContrato, tipoParticipante: formData.tipoParticipante, numParticipante };
  }, [vistaActiva, formData]);

  const heredablesQuery = useDomiciliosHeredables(heredablesParams);

  const paisesQuery = usePaises();
  const estadosQuery = useEstados();

  function resolverPaisEstado(d: DatosExtraidosCIF) {
    let pais = d.paisId != null ? String(d.paisId) : '';
    let estado = d.estadoId != null ? String(d.estadoId) : '';

    if (!pais) {
      const match = (paisesQuery.data ?? []).find(
        (c) => c.id === d.paisId || normalizar(c.nombre) === normalizar(d.pais),
      );
      if (match) pais = String(match.id);
    }
    if (!estado) {
      const match = (estadosQuery.data ?? []).find(
        (c) => c.id === d.estadoId || normalizar(c.nombre) === normalizar(d.estado),
      );
      if (match) estado = String(match.id);
    }

    return { pais, estado };
  }

  const heredablesStatus: HGridStatus =
    heredablesParams === null
      ? 'loading'
      : heredablesQuery.isLoading
        ? 'loading'
        : heredablesQuery.isError
          ? 'error'
          : heredablesQuery.data && heredablesQuery.data.length > 0
            ? 'data'
            : 'empty';

  const heredablesError = heredablesQuery.isError
    ? heredablesQuery.error instanceof ApiError && heredablesQuery.error.status === 404
      ? 'No se encontraron domicilios heredables para este participante.'
      : 'Ocurrió un error al consultar los domicilios heredables.'
    : undefined;

  return (
    <Dialog open={open} onOpenChange={(open) => { if (!open) onCerrar?.(); }}>
      <DialogContent className="max-w-3xl p-0 gap-0">
        <div className="flex items-center justify-between rounded-t-lg bg-gradient-to-r from-primary to-red-700 px-4 py-1.5">
          <h2 className="text-sm font-bold text-primary-foreground">
            Dirección Fiscal
          </h2>
        </div>

        {vistaActiva === 'heredar' && (
          <div className="px-5 py-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">
                Seleccione un domicilio para heredar
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground"
                onClick={cancelarVista}
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Cancelar
              </Button>
            </div>
            <DomiciliosHeredablesGrid
              domicilios={heredablesQuery.data ?? []}
              status={heredablesStatus}
              errorMessage={heredablesError}
              onSeleccionar={handleSeleccionarHeredable}
            />
          </div>
        )}

        {vistaActiva === 'cif' && (
          <div className="px-5 py-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">
                Cargue el PDF del CIF
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground"
                onClick={cancelarVista}
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Cancelar
              </Button>
            </div>
            <CifUploader
              fideicomisoId={formData.fideicomiso}
              tipoParticipante={formData.tipoParticipante}
              numeroParticipante={formData.noParticipante}
              onArchivoProcesado={handleCifProcesado}
            />
          </div>
        )}

        {vistaActiva === 'normal' && esEliminar && !cargandoDetalle && !errorDetalle && formListo && (
          <div className="px-5 pt-4 pb-3">
            <Alert variant="destructive" className="py-2">
              <AlertTitle className="text-xs">Confirmación de eliminación</AlertTitle>
              <AlertDescription className="text-xs">
                ¿Está seguro de eliminar este domicilio fiscal? Esta acción no se puede deshacer.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {vistaActiva === 'normal' && (
          <div className="px-5 py-4">
            {cargandoDetalle && !errorDetalle ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : errorDetalle ? (
              <Alert variant="destructive" className="py-2">
                <AlertDescription className="text-xs">{errorDetalle}</AlertDescription>
              </Alert>
            ) : !formListo ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <DomicilioForm
                key={formKey}
                modo={esEliminar ? 'consulta' : modoActual}
                initialData={formData}
                tipoPersona={tipoPersona}
                origen={origen}
                errorCp={errorCp}
                errorRegimen={errorRegimen}
                onHeredarDomicilio={!esConsulta ? handleHeredarDomicilio : undefined}
                onCargarCif={!esConsulta ? handleCargarCif : undefined}
                onDataChange={handleFormDataChange}
                onReadyChange={setFormValido}
              />
            )}
          </div>
        )}

        {errorGuardar && (
          <div className="px-5 pb-3">
            <Alert variant="destructive" className="py-2">
              <AlertDescription className="text-xs">{errorGuardar}</AlertDescription>
            </Alert>
          </div>
        )}

        {vistaActiva === 'normal' && (
          <div className="flex items-center justify-between border-t bg-gray-50 px-5 py-3">
            {esConsulta ? (
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="h-8 text-xs" onClick={irAlta}>
                  <UserPlus className="h-3.5 w-3.5 text-primary" />
                  Alta
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-xs" onClick={irModificar}>
                  <Pencil className="h-3.5 w-3.5 text-primary" />
                  Modificar
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-xs" onClick={onBaja}>
                  <Trash2 className="h-3.5 w-3.5 text-primary" />
                  Baja
                </Button>
              </div>
            ) : (
              <div />
            )}
            <div className="flex gap-2">
              {esConsulta ? (
                <Button variant="outline" size="sm" className="h-8 text-xs" onClick={onCerrar}>
                  <X className="h-3.5 w-3.5 text-primary" />
                  Cerrar
                </Button>
              ) : esEliminar ? (
                <>
                  <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => { onCancelar?.(); onCerrar?.(); }}>
                    <Ban className="h-3.5 w-3.5 text-destructive" />
                    Cancelar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-8 text-xs"
                    disabled={eliminando || cargandoDetalle || !formListo || errorDetalle != null}
                    onClick={manejarEliminar}
                  >
                    {eliminando ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                    {eliminando ? 'Eliminando…' : 'Eliminar'}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => { onCancelar?.(); onCerrar?.(); }}>
                    <Ban className="h-3.5 w-3.5 text-destructive" />
                    Cancelar
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="h-8 text-xs"
                    disabled={!formValido || guardando || cargandoDetalle}
                    onClick={manejarAceptar}
                  >
                    {guardando ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                    {guardando ? 'Guardando…' : 'Aceptar'}
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
