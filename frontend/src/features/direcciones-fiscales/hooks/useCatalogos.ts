import { useQuery } from '@tanstack/react-query';
import { getPaises, getEstados, getRegimenesFiscales, type TipoPersonaCatalogo } from '../api/catalogosApi';

const CATALOGOS_STALE_TIME = 24 * 60 * 60 * 1000;

export function usePaises(enabled = true) {
  return useQuery({
    queryKey: ['catalogos', 'paises'],
    queryFn: getPaises,
    staleTime: CATALOGOS_STALE_TIME,
    enabled,
  });
}

export function useEstados(paisId?: number, enabled = true) {
  return useQuery({
    queryKey: ['catalogos', 'estados', paisId],
    queryFn: () => getEstados(paisId),
    staleTime: CATALOGOS_STALE_TIME,
    enabled,
  });
}

export function useRegimenesFiscales(tipoPersona?: TipoPersonaCatalogo, enabled = true) {
  return useQuery({
    queryKey: ['catalogos', 'regimenes-fiscales', tipoPersona],
    queryFn: () => getRegimenesFiscales(tipoPersona),
    staleTime: CATALOGOS_STALE_TIME,
    enabled,
  });
}
