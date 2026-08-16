import { useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { obtenerRfcParticipante, obtenerNombreParticipante } from '../api/fideicomisosApi';
import type { TipoPersonaCatalogo } from '../api/catalogosApi';

interface ParamsParticipante {
  numContrato: number;
  tipoParticipante: string;
  numParticipante: number;
}

export function useValidarParticipante() {
  const [params, setParams] = useState<ParamsParticipante | null>(null);

  const query = useQuery({
    queryKey: [
      'fideicomiso',
      'validar-participante',
      params?.numContrato,
      params?.tipoParticipante,
      params?.numParticipante,
    ],
    queryFn: () =>
      Promise.all([
        obtenerRfcParticipante(params!.numContrato, params!.tipoParticipante, params!.numParticipante),
        obtenerNombreParticipante(params!.numContrato, params!.tipoParticipante, params!.numParticipante),
      ]),
    enabled: params !== null,
    retry: false,
  });

  const validar = useCallback(
    (numContrato: number, tipoParticipante: string, numParticipante: string) => {
      const numero = Number(numParticipante);
      if (!tipoParticipante || !numParticipante.trim() || Number.isNaN(numero)) return;
      const next = { numContrato, tipoParticipante, numParticipante: numero };
      const same =
        params !== null &&
        params.numContrato === next.numContrato &&
        params.tipoParticipante === next.tipoParticipante &&
        params.numParticipante === next.numParticipante;
      if (same) {
        query.refetch();
      } else {
        setParams(next);
      }
    },
    [params, query],
  );

  const reset = useCallback(() => setParams(null), []);

  return {
    ...query,
    params,
    validar,
    reset,
    rfc: query.data ? query.data[0].rfc : null,
    nombre: query.data ? query.data[1].nombre : null,
    tipoPersona: query.data ? (query.data[1].tipoPersona as TipoPersonaCatalogo | null) : null,
  };
}
