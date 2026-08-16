import { useEffect, useRef, useState } from 'react';
import { Info, FileCheck, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type {
  ModoFormulario,
  DomicilioFiscalFormData,
  OrigenDato,
} from '../../types/domicilioFiscal';
import { TIPOS_PARTICIPANTE } from '../../types/domicilioFiscal';
import { usePaises, useEstados, useRegimenesFiscales } from '../../hooks/useCatalogos';
import { useValidarFideicomiso } from '../../hooks/useValidarFideicomiso';
import { useValidarParticipante } from '../../hooks/useValidarParticipante';
import { ApiError } from '../../api/direccionesFiscalesApi';
import type { TipoPersonaCatalogo } from '../../api/catalogosApi';

interface DomicilioFormProps {
  modo: ModoFormulario;
  initialData?: Partial<DomicilioFiscalFormData>;
  tipoPersona?: TipoPersonaCatalogo;
  origen?: OrigenDato;
  errorCp?: string;
  errorRegimen?: string;
  onHeredarDomicilio?: () => void;
  onCargarCif?: () => void;
  onDataChange?: (data: Partial<DomicilioFiscalFormData>) => void;
  onReadyChange?: (valido: boolean) => void;
}

const DEFAULT_DATA: DomicilioFiscalFormData = {
  fideicomiso: '',
  tipoParticipante: '',
  noParticipante: '',
  nombreFideicomiso: '',
  rfc: '',
  nombreFiscal: '',
  nombreLegal: '',
  calle: '',
  numeroExterior: '',
  numeroInterior: '',
  colonia: '',
  municipio: '',
  localidad: '',
  pais: '',
  estado: '',
  codigoPostal: '',
  referencia: '',
  telefono: '',
  regimenFiscal: '',
  correoElectronico: '',
};

export function DomicilioForm({
  modo,
  initialData,
  tipoPersona,
  origen,
  errorCp,
  errorRegimen,
  onHeredarDomicilio,
  onCargarCif,
  onDataChange,
  onReadyChange,
}: DomicilioFormProps) {
  const [data, setData] = useState<DomicilioFiscalFormData>({
    ...DEFAULT_DATA,
    ...initialData,
  });

  const enriquecidoRef = useRef(false);

  const esAlta = modo === 'alta';
  const esModificar = modo === 'modificar';
  const esConsulta = modo === 'consulta';

  const fideicomisoQuery = useValidarFideicomiso();
  const participanteQuery = useValidarParticipante();

  const fideicomisoValidado = esAlta && fideicomisoQuery.isSuccess;
  const participanteValidado = esAlta && participanteQuery.isSuccess;

  const usaEnriquecimiento = esModificar || esConsulta;

  useEffect(() => {
    if (!usaEnriquecimiento || enriquecidoRef.current) return;
    const fid = initialData?.fideicomiso;
    const tipo = initialData?.tipoParticipante;
    const num = initialData?.noParticipante;
    if (!fid || !tipo || !num) return;
    const numContrato = Number(fid);
    if (Number.isNaN(numContrato)) return;
    enriquecidoRef.current = true;
    fideicomisoQuery.validar(fid);
    participanteQuery.validar(numContrato, tipo, num);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usaEnriquecimiento, initialData]);

  const camposBloqueados = esConsulta || esModificar || (!esAlta);
  const camposFideicomisoBloqueados = esConsulta || esModificar;
  const camposParticipanteBloqueados = esConsulta || esModificar || (esAlta && !fideicomisoValidado);
  const heredado = origen === 'HEREDADO_GRID';
  const origenAsistido = heredado || origen === 'CIF_PDF';
  // Con origen asistido (heredar / CIF) los queries de validación se reinician al
  // remontar el formulario, por lo que la identidad se toma de los datos ya presentes
  // y los campos contactables quedan editables aunque el participante ya no esté "validado".
  const camposBaseEditables = esModificar || (esAlta && fideicomisoValidado && participanteValidado) || origenAsistido;
  const camposDireccionEditables = camposBaseEditables && !heredado;
  const camposContactoEditables = camposBaseEditables || heredado;

  useEffect(() => {
    if (!fideicomisoQuery.data) return;
    setData((prev) => ({ ...prev, nombreFideicomiso: fideicomisoQuery.data.nombre }));
    onDataChange?.({ nombreFideicomiso: fideicomisoQuery.data.nombre });
  }, [fideicomisoQuery.data, onDataChange]);

  useEffect(() => {
    if (!participanteQuery.data) return;
    const [rfc, nombre] = participanteQuery.data;
    setData((prev) => ({
      ...prev,
      rfc: rfc.rfc,
      nombreFiscal: nombre.nombre,
      tipoPersonaCatalogo: participanteQuery.tipoPersona ?? prev.tipoPersonaCatalogo,
    }));
    onDataChange?.({
      rfc: rfc.rfc,
      nombreFiscal: nombre.nombre,
      ...(participanteQuery.tipoPersona != null && {
        tipoPersonaCatalogo: participanteQuery.tipoPersona,
      }),
    });
  }, [participanteQuery.data, participanteQuery.tipoPersona, onDataChange]);

  const fideicomisoError = fideicomisoQuery.isError
    ? fideicomisoQuery.error instanceof ApiError && fideicomisoQuery.error.status === 404
      ? 'El Fideicomiso no existe'
      : 'Ocurrió un error al validar el Fideicomiso'
    : null;

  const participanteError = participanteQuery.isError
    ? participanteQuery.error instanceof ApiError && participanteQuery.error.status === 404
      ? 'El Participante no existe'
      : 'Ocurrió un error al validar el Participante'
    : null;

  const fideicomisoValidando = fideicomisoQuery.isFetching;
  const participanteValidando = participanteQuery.isFetching;

  const { data: paises, isLoading: paisesLoading, isError: paisesError } = usePaises();
  const paisId = data.pais ? Number(data.pais) : undefined;
  const { data: estados, isLoading: estadosLoading, isError: estadosError } = useEstados(
    paisId,
    Boolean(paisId),
  );
  const tipoPersonaResuelto: TipoPersonaCatalogo | undefined =
    participanteQuery.tipoPersona ??
    initialData?.tipoPersonaCatalogo ??
    data.tipoPersonaCatalogo ??
    tipoPersona;
  const { data: regimenes, isLoading: regimenesLoading, isError: regimenesError } =
    useRegimenesFiscales(tipoPersonaResuelto);
  const { data: todosRegimenes } = useRegimenesFiscales();

  // Validación de negocio: el régimen seleccionado debe corresponder al tipo de
  // persona (física/moral) del participante. Corre tanto al pulsar "Valida Régimen
  // Fiscal" como al habilitar "Aceptar" (filtrado por `formValido`). La compatibilidad
  // solo se exige cuando el catálogo reporta los flags; si llegan ausentes (undefined)
  // no marcamos incompatibilidad para evitar falsos positivos.
  const regimenSeleccionado = (todosRegimenes ?? []).find(
    (r) => String(r.clave) === data.regimenFiscal,
  );
  const regimenAplicaFisica =
    regimenSeleccionado?.aplicaFisica ?? regimenSeleccionado?.aplica_fisica;
  const regimenAplicaMoral =
    regimenSeleccionado?.aplicaMoral ?? regimenSeleccionado?.aplica_moral;
  const regimenIncompatible = Boolean(
    data.regimenFiscal &&
      tipoPersonaResuelto &&
      regimenSeleccionado &&
      typeof regimenAplicaFisica === 'boolean' &&
      typeof regimenAplicaMoral === 'boolean' &&
      (tipoPersonaResuelto === 'FISICA'
        ? !regimenAplicaFisica
        : !regimenAplicaMoral),
  );
  const regimenSoloFisica =
    typeof regimenAplicaFisica === 'boolean' &&
    typeof regimenAplicaMoral === 'boolean' &&
    regimenAplicaFisica &&
    !regimenAplicaMoral;
  const regimenErrorMsg = regimenIncompatible
    ? `El régimen fiscal seleccionado (${regimenSeleccionado!.clave} - ${regimenSeleccionado!.descripcion}) corresponde a una persona ${
        regimenSoloFisica ? 'FÍSICA' : 'MORAL'
      } y el participante es una persona ${
        tipoPersonaResuelto === 'FISICA' ? 'FÍSICA' : 'MORAL'
      }. Verifique el régimen seleccionado.`
    : null;

  const esRequerido = (v?: string) => v != null && v.trim().length > 0;
  const cpValido = /^[0-9]{5}$/.test(data.codigoPostal);
  const direccionValida = heredado
    ? esRequerido(data.calle) &&
      esRequerido(data.colonia) &&
      esRequerido(data.pais) &&
      esRequerido(data.estado) &&
      cpValido
    : esRequerido(data.calle) &&
      esRequerido(data.numeroExterior) &&
      esRequerido(data.colonia) &&
      esRequerido(data.municipio) &&
      esRequerido(data.pais) &&
      esRequerido(data.estado) &&
      cpValido;
  const identidadResuelta =
    Boolean(data.fideicomiso) &&
    Boolean(data.tipoParticipante) &&
    Boolean(data.noParticipante) &&
    Boolean(data.nombreFideicomiso) &&
    Boolean(data.rfc) &&
    Boolean(data.nombreFiscal);
  const identidadAltaValida = origenAsistido ? identidadResuelta : fideicomisoValidado && participanteValidado;
  const regimenValido = esAlta ? Boolean(data.regimenFiscal) && !regimenIncompatible : !regimenIncompatible;
  const formValido = esAlta
    ? identidadAltaValida && direccionValida && regimenValido
    : esModificar
      ? direccionValida && regimenValido
      : false;

  useEffect(() => {
    onReadyChange?.(formValido);
  }, [formValido, onReadyChange, data]);

  const estadoDeshabilitado = !camposDireccionEditables || !paisId || estadosLoading;
  const estadoPlaceholder = !paisId
    ? 'Seleccione país primero'
    : estadosLoading
      ? 'Cargando…'
      : estadosError
        ? 'Error al cargar estados'
        : 'Seleccione estado';

  function handleChange<K extends keyof DomicilioFiscalFormData>(
    field: K,
    value: DomicilioFiscalFormData[K],
  ) {
    let next = { ...data, [field]: value };
    if (field === 'pais' && value !== data.pais) {
      next = { ...next, estado: '' };
    }
    if (field === 'fideicomiso') {
      fideicomisoQuery.reset();
      participanteQuery.reset();
      next = { ...next, nombreFideicomiso: '', rfc: '', nombreFiscal: '' };
    }
    if (field === 'tipoParticipante' || field === 'noParticipante') {
      participanteQuery.reset();
      next = { ...next, rfc: '', nombreFiscal: '' };
    }
    setData(next);
    onDataChange?.({ [field]: value });
  }

  function validarParticipante(tipo: string, num: string) {
    if (!fideicomisoValidado || fideicomisoQuery.numContrato == null) return;
    participanteQuery.validar(fideicomisoQuery.numContrato, tipo, num);
  }

  function fieldClass(readonly: boolean) {
    return readonly ? 'bg-gray-100 text-muted-foreground cursor-not-allowed' : '';
  }

  function infoFieldClass() {
    return 'bg-blue-50 border-blue-200 text-blue-700 cursor-default';
  }

  function renderField(
    label: string,
    field: keyof DomicilioFiscalFormData,
    options?: { type?: string; placeholder?: string; maxLength?: number; disabled?: boolean; className?: string },
  ) {
    const disabled = options?.disabled ?? camposBloqueados;
    return (
      <div className="space-y-1">
        <Label className="text-[11px] font-medium text-foreground">{label}</Label>
        <Input
          value={data[field]}
          onChange={(e) => handleChange(field, e.target.value)}
          type={options?.type ?? 'text'}
          placeholder={options?.placeholder}
          maxLength={options?.maxLength}
          disabled={disabled}
          className={`h-7 text-xs ${fieldClass(disabled)} ${options?.className ?? ''}`}
        />
      </div>
    );
  }

  function renderInfoField(label: string, value: string) {
    return (
      <div className="space-y-1">
        <Label className="flex items-center gap-1 text-[11px] font-medium text-blue-600">
          <Info className="h-3 w-3" />
          {label}
        </Label>
        <Input
          value={value}
          readOnly
          className={`h-7 text-xs ${infoFieldClass()}`}
        />
      </div>
    );
  }

  const bannerMessages: Record<OrigenDato, { text: string; variant: 'default' | 'destructive' }> = {
    CIF_PDF: { text: 'Datos extraídos del CIF — verifique la información', variant: 'default' },
    HEREDADO_GRID: { text: 'Datos Heredados del Domicilio registrado', variant: 'default' },
    MANUAL: { text: '', variant: 'default' },
  };

  return (
    <div className="space-y-4 p-1">
      {origen && origen !== 'MANUAL' && (
        <div role="alert" className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-foreground">
          <FileCheck className="h-4 w-4 shrink-0" />
          <p className="text-xs">{bannerMessages[origen].text}</p>
        </div>
      )}

      {errorCp && (
        <Alert variant="destructive" className="py-2">
          <AlertDescription className="text-xs">{errorCp}</AlertDescription>
        </Alert>
      )}

      {(errorRegimen || regimenErrorMsg) && (
        <Alert variant="destructive" className="py-2">
          <AlertDescription className="text-xs">
            {errorRegimen ?? regimenErrorMsg}
          </AlertDescription>
        </Alert>
      )}

      <div>
        <div className="mb-2 text-xs font-semibold text-foreground">Identificación</div>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label className="text-[11px] font-medium text-foreground">Fideicomiso</Label>
            <div className="relative">
              <Input
                aria-label="No. de Fideicomiso"
                value={data.fideicomiso}
                onChange={(e) => handleChange('fideicomiso', e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                onBlur={() => fideicomisoQuery.validar(data.fideicomiso)}
                placeholder="No. de Fideicomiso"
                maxLength={10}
                disabled={camposFideicomisoBloqueados}
                className={`h-7 pr-8 text-xs ${fieldClass(camposFideicomisoBloqueados)}`}
              />
              {fideicomisoValidando && (
                <Loader2 className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-muted-foreground" />
              )}
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] font-medium text-foreground">Tipo de Participante</Label>
            <Select
              value={data.tipoParticipante}
              onValueChange={(v) => {
                handleChange('tipoParticipante', v);
                validarParticipante(v, data.noParticipante);
              }}
              disabled={camposParticipanteBloqueados}
            >
              <SelectTrigger
                aria-label="Tipo de Participante"
                className={`h-7 text-xs ${fieldClass(camposParticipanteBloqueados)}`}
              >
                <SelectValue placeholder="Seleccione" />
              </SelectTrigger>
              <SelectContent>
                {TIPOS_PARTICIPANTE.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] font-medium text-foreground">No. Participante</Label>
            <div className="relative">
              <Input
                aria-label="No. de Participante"
                value={data.noParticipante}
                onChange={(e) => handleChange('noParticipante', e.target.value.replace(/[^0-9]/g, '').slice(0, 2))}
                onBlur={() => validarParticipante(data.tipoParticipante, data.noParticipante)}
                placeholder="No. de Participante"
                inputMode="numeric"
                maxLength={2}
                disabled={camposParticipanteBloqueados}
                className={`h-7 pr-8 text-xs ${fieldClass(camposParticipanteBloqueados)}`}
              />
              {participanteValidando && (
                <Loader2 className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-muted-foreground" />
              )}
            </div>
          </div>
        </div>

        {fideicomisoError && (
          <Alert variant="destructive" className="mt-3 py-2">
            <AlertDescription className="text-xs">{fideicomisoError}</AlertDescription>
          </Alert>
        )}

        {participanteError && (
          <Alert variant="destructive" className="mt-3 py-2">
            <AlertDescription className="text-xs">{participanteError}</AlertDescription>
          </Alert>
        )}

        {participanteValidado && (
          <Alert className="mt-3 py-2">
            <AlertDescription className="text-xs">Participante validado correctamente</AlertDescription>
          </Alert>
        )}

        <div className="mt-3">
          {renderField('Nombre del Fideicomiso', 'nombreFideicomiso', { disabled: true })}
        </div>

        <div className="mt-3">
          {renderField('Nombre Fiscal', 'nombreFiscal', { disabled: true })}
        </div>

        <div className="mt-3">
          {renderField('RFC', 'rfc', { disabled: true })}
        </div>
      </div>

      <hr className="border-t" />

      <div>
        <div className="mb-2 text-xs font-semibold text-foreground">Dirección Fiscal / Addenda</div>
        <div className="mb-3">
          {renderInfoField('Nombre Legal', data.nombreLegal)}
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label className="text-[11px] font-medium text-foreground">Calle</Label>
            <Input
              value={data.calle}
              onChange={(e) => handleChange('calle', e.target.value)}
              placeholder="Calle"
              disabled={!camposDireccionEditables}
              className={`h-7 text-xs ${fieldClass(!camposDireccionEditables)}`}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] font-medium text-foreground">No. Ext.</Label>
            <Input
              value={data.numeroExterior}
              onChange={(e) => handleChange('numeroExterior', e.target.value)}
              placeholder="No. Exterior"
              disabled={!camposDireccionEditables}
              className={`h-7 text-xs ${fieldClass(!camposDireccionEditables)}`}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] font-medium text-foreground">No. Int.</Label>
            <Input
              value={data.numeroInterior}
              onChange={(e) => handleChange('numeroInterior', e.target.value)}
              placeholder="No. Interior"
              disabled={!camposDireccionEditables}
              className={`h-7 text-xs ${fieldClass(!camposDireccionEditables)}`}
            />
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label className="text-[11px] font-medium text-foreground">Colonia</Label>
            <Input
              value={data.colonia}
              onChange={(e) => handleChange('colonia', e.target.value)}
              placeholder="Colonia"
              disabled={!camposDireccionEditables}
              className={`h-7 text-xs ${fieldClass(!camposDireccionEditables)}`}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] font-medium text-foreground">Municipio/Alcaldía</Label>
            <Input
              value={data.municipio}
              onChange={(e) => handleChange('municipio', e.target.value)}
              placeholder="Municipio/Alcaldía"
              disabled={!camposDireccionEditables}
              className={`h-7 text-xs ${fieldClass(!camposDireccionEditables)}`}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] font-medium text-foreground">Localidad</Label>
            <Input
              value={data.localidad}
              onChange={(e) => handleChange('localidad', e.target.value)}
              placeholder="Localidad"
              disabled={!camposDireccionEditables}
              className={`h-7 text-xs ${fieldClass(!camposDireccionEditables)}`}
            />
          </div>
        </div>

        <div className="mt-3 grid grid-cols-4 gap-3">
          <div className="space-y-1">
            <Label className="text-[11px] font-medium text-foreground">País</Label>
            <Select
              value={data.pais}
              onValueChange={(v) => handleChange('pais', v)}
              disabled={!camposDireccionEditables || paisesLoading}
            >
              <SelectTrigger
                aria-label="País"
                className={`h-7 text-xs ${fieldClass(!camposDireccionEditables || paisesLoading)}`}
              >
                <SelectValue
                  placeholder={paisesLoading ? 'Cargando…' : paisesError ? 'Error al cargar países' : 'Seleccione país'}
                />
              </SelectTrigger>
              <SelectContent>
                {(paises ?? []).map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] font-medium text-foreground">Estado</Label>
            <Select
              value={data.estado}
              onValueChange={(v) => handleChange('estado', v)}
              disabled={estadoDeshabilitado}
            >
              <SelectTrigger aria-label="Estado" className={`h-7 text-xs ${fieldClass(estadoDeshabilitado)}`}>
                <SelectValue placeholder={estadoPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {(estados ?? []).map((e) => (
                  <SelectItem key={e.id} value={String(e.id)}>
                    {e.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] font-medium text-foreground">Código Postal</Label>
            <Input
              value={data.codigoPostal}
              onChange={(e) => handleChange('codigoPostal', e.target.value.replace(/[^0-9]/g, '').slice(0, 5))}
              placeholder="5 dígitos"
              maxLength={5}
              disabled={!camposDireccionEditables}
              className={`h-7 text-xs ${fieldClass(!camposDireccionEditables)}`}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] font-medium text-foreground">Teléfono</Label>
            <Input
              value={data.telefono}
              onChange={(e) => handleChange('telefono', e.target.value)}
              placeholder="Teléfono"
              disabled={!camposContactoEditables}
              className={`h-7 text-xs ${fieldClass(!camposContactoEditables)}`}
            />
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-[11px] font-medium text-foreground">Referencia</Label>
            <Input
              value={data.referencia}
              onChange={(e) => handleChange('referencia', e.target.value)}
              placeholder="Referencia (entre calles, notas)"
              disabled={!camposContactoEditables}
              className={`h-7 text-xs ${fieldClass(!camposContactoEditables)}`}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] font-medium text-foreground">Correo Electrónico</Label>
            <Input
              value={data.correoElectronico}
              onChange={(e) => handleChange('correoElectronico', e.target.value)}
              placeholder="Correo electrónico"
              disabled={!camposContactoEditables}
              className={`h-7 text-xs ${fieldClass(!camposContactoEditables)}`}
            />
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3">
          <div className="space-y-1">
            <Label className="text-[11px] font-medium text-foreground">Régimen Fiscal</Label>
              <Select
                value={data.regimenFiscal}
                onValueChange={(v) => handleChange('regimenFiscal', v)}
                disabled={!camposContactoEditables || regimenesLoading}
              >
                <SelectTrigger
                  aria-label="Régimen Fiscal"
                  className={`h-7 text-xs ${fieldClass(!camposContactoEditables || regimenesLoading)}`}
                >
                  <SelectValue
                    className="truncate"
                    placeholder={regimenesLoading ? 'Cargando…' : regimenesError ? 'Error al cargar regímenes' : 'Seleccione régimen fiscal'}
                  />
                </SelectTrigger>
                <SelectContent>
                  {(regimenes ?? []).map((r) => (
                    <SelectItem key={r.clave} value={String(r.clave)}>
                      {r.clave} — {r.descripcion}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
          </div>
        </div>

      </div>

      {esAlta && modo === 'alta' && (
        <div className="flex gap-2 border-t pt-3">
          {onCargarCif && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-[11px]"
              disabled={!fideicomisoValidado || !participanteValidado}
              onClick={onCargarCif}
            >
              <FileCheck className="h-3.5 w-3.5 text-primary" />
              Cargar CIF
            </Button>
          )}
          {onHeredarDomicilio && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-[11px]"
              disabled={!fideicomisoValidado || !participanteValidado}
              onClick={onHeredarDomicilio}
            >
              <FileCheck className="h-3.5 w-3.5 text-primary" />
              Heredar Domicilio
            </Button>
          )}
        </div>
      )}

      {modo === 'modificar' && onHeredarDomicilio && (
        <div className="flex gap-2 border-t pt-3">
          {onCargarCif && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-[11px]"
              onClick={onCargarCif}
            >
              <FileCheck className="h-3.5 w-3.5 text-primary" />
              Cargar CIF
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-[11px]"
            onClick={onHeredarDomicilio}
          >
            <FileCheck className="h-3.5 w-3.5 text-primary" />
            Heredar Domicilio
          </Button>
        </div>
      )}
    </div>
  );
}
