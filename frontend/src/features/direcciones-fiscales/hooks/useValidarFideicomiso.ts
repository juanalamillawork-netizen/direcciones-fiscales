import { useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { obtenerFideicomiso } from '../api/fideicomisosApi';

export function useValidarFideicomiso() {
  const [numContrato, setNumContrato] = useState<number | null>(null);

  const query = useQuery({
    queryKey: ['fideicomiso', 'validar', numContrato],
    queryFn: () => obtenerFideicomiso(numContrato as number),
    enabled: numContrato !== null,
    retry: false,
  });

  const validar = useCallback(
    (value: string) => {
      const numero = Number(value);
      if (!value.trim() || Number.isNaN(numero)) return;
      if (numero === numContrato) {
        query.refetch();
      } else {
        setNumContrato(numero);
      }
    },
    [numContrato, query],
  );

  const reset = useCallback(() => setNumContrato(null), []);

  return { numContrato, validar, reset, ...query };
}
