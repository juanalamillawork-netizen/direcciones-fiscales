import { useMutation } from '@tanstack/react-query';
import { procesarCargaMasiva } from '../api/cargaMasivaApi';
import type { ResultadoCargaMasiva } from '../types/domicilioFiscal';

export function useCargaMasiva() {
  return useMutation<ResultadoCargaMasiva, Error, File>({
    mutationFn: (archivo: File) => procesarCargaMasiva(archivo),
    retry: false,
  });
}