import { useQuery } from '@tanstack/react-query';
import {
  buscarDireccionesFiscales,
  obtenerDomicilioFiscal,
  type IdentidadDomicilio,
} from '../api/direccionesFiscalesApi';
import type { BusquedaCriterios } from '../types/domicilioFiscal';

export function useDireccionesFiscales(criterios: BusquedaCriterios | null) {
  return useQuery({
    queryKey: ['direcciones-fiscales', criterios?.numeroFideicomiso, criterios?.tipoParticipante],
    queryFn: () =>
      buscarDireccionesFiscales(criterios?.numeroFideicomiso, criterios?.tipoParticipante),
    enabled: criterios !== null && (criterios.numeroFideicomiso.trim().length > 0 || criterios.tipoParticipante.length > 0),
    retry: false,
  });
}

export function useDomicilioFiscalDetalle(identidad: IdentidadDomicilio | null, enabled = true) {
  return useQuery({
    queryKey: [
      'direcciones-fiscales',
      'detalle',
      identidad?.numContrato,
      identidad?.cvePers,
      identidad?.numPersFid,
    ],
    queryFn: () => obtenerDomicilioFiscal(identidad as IdentidadDomicilio),
    enabled: identidad !== null && enabled,
    retry: false,
  });
}
