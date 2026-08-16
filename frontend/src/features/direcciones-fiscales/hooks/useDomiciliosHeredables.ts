import { useQuery } from '@tanstack/react-query';
import { obtenerDomiciliosHeredables } from '../api/fideicomisosApi';

interface ParamsHeredables {
  numContrato: number;
  tipoParticipante: string;
  numParticipante: number;
}

export function useDomiciliosHeredables(params: ParamsHeredables | null) {
  return useQuery({
    queryKey: [
      'fideicomiso',
      'domicilios-heredables',
      params?.numContrato,
      params?.tipoParticipante,
      params?.numParticipante,
    ],
    queryFn: () =>
      obtenerDomiciliosHeredables(params!.numContrato, params!.tipoParticipante, params!.numParticipante),
    enabled: params !== null,
    retry: false,
  });
}
