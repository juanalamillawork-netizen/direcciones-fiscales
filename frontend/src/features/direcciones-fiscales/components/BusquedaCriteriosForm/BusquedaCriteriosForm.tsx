import { useState } from 'react';
import { Search, Trash2, Download, UserPlus, Upload, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { BusquedaCriterios } from '../../types/domicilioFiscal';

const TIPOS_PARTICIPANTE = [
  { value: 'FIDEICOMITENTE', label: 'Fideicomitente' },
  { value: 'FIDEICOMISARIO', label: 'Fideicomisario' },
  { value: 'TERCERO', label: 'Tercero' },
];

interface BusquedaCriteriosFormProps {
  onConsultar?: (criterios: BusquedaCriterios) => void;
  onExport?: () => void;
  onAgregar?: () => void;
  onImport?: () => void;
  hasResults?: boolean;
  isSearching?: boolean;
}

export function BusquedaCriteriosForm({
  onConsultar,
  onExport,
  onAgregar,
  onImport,
  hasResults = false,
  isSearching = false,
}: BusquedaCriteriosFormProps) {
  const [numeroFideicomiso, setNumeroFideicomiso] = useState('');
  const [tipoParticipante, setTipoParticipante] = useState('');
  const [error, setError] = useState('');

  function handleConsultar() {
    if (!numeroFideicomiso.trim() && !tipoParticipante) {
      setError('Debe seleccionar al menos un criterio de búsqueda');
      return;
    }
    setError('');
    onConsultar?.({ numeroFideicomiso: numeroFideicomiso.trim(), tipoParticipante });
  }

  function handleLimpiar() {
    setNumeroFideicomiso('');
    setTipoParticipante('');
    setError('');
  }

  return (
    <div className="space-y-4 rounded-lg border bg-card shadow-sm">
      <div className="rounded-t-lg bg-gradient-to-r from-primary to-red-700 px-4 py-1">
        <h2 className="text-[11px] font-semibold text-primary-foreground">
          Criterios de Búsqueda
        </h2>
      </div>

      <div className="space-y-4 px-6 pb-5 pt-2">
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="numeroFideicomiso" className="text-xs">No. Fideicomiso</Label>
            <Input
              id="numeroFideicomiso"
              type="text"
              inputMode="numeric"
              placeholder="Ingrese número de fideicomiso"
              maxLength={10}
              className="h-8 text-xs"
              value={numeroFideicomiso}
              onChange={(e) => setNumeroFideicomiso(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="tipoParticipante" className="text-xs">Tipo Participante</Label>
            <Select value={tipoParticipante} onValueChange={setTipoParticipante}>
              <SelectTrigger id="tipoParticipante" className="h-8 text-xs">
                <SelectValue placeholder="Seleccione tipo" />
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
        </div>

        <div className="flex items-start justify-between gap-12">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              disabled={isSearching}
              onClick={handleConsultar}
            >
              {isSearching ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
              ) : (
                <Search className="h-3.5 w-3.5 text-primary" />
              )}
              {isSearching ? 'Consultando…' : 'Consultar'}
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={handleLimpiar}>
              <Trash2 className="h-3.5 w-3.5 text-primary" />
              Limpiar
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs" disabled={!hasResults} onClick={onExport}>
              <Download className="h-3.5 w-3.5 text-primary" />
              Exportar Consulta
            </Button>
          </div>

          <div className="flex items-stretch gap-4">
            <div className="w-px bg-border" />
            <div className="space-y-1">
              <span className="block text-[10px] text-muted-foreground">Acción</span>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="h-8 text-xs" onClick={onAgregar}>
                  <UserPlus className="h-3.5 w-3.5 text-primary" />
                  Agregar
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-xs" onClick={onImport}>
                  <Upload className="h-3.5 w-3.5 text-primary" />
                  Importar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
