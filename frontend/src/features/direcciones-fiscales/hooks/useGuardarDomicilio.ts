import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  actualizarDomicilioFiscal,
  crearDomicilioFiscal,
  eliminarDomicilioFiscal,
  type ActualizarDomicilioFiscalRequest,
  type IdentidadDomicilio,
} from '../api/direccionesFiscalesApi';

const DIRECCIONES_QUERY_KEY = ['direcciones-fiscales'] as const;

export function useCrearDomicilioFiscal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: crearDomicilioFiscal,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: DIRECCIONES_QUERY_KEY });
    },
  });
}

export function useActualizarDomicilioFiscal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      identidad,
      request,
    }: {
      identidad: IdentidadDomicilio;
      request: ActualizarDomicilioFiscalRequest;
    }) => actualizarDomicilioFiscal(identidad, request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: DIRECCIONES_QUERY_KEY });
    },
  });
}

export function useEliminarDomicilioFiscal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: eliminarDomicilioFiscal,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: DIRECCIONES_QUERY_KEY });
    },
  });
}
