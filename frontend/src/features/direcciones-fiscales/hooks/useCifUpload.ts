import { useMutation } from '@tanstack/react-query';
import { procesarCif } from '../api/cifApi';

export function useCifUpload() {
  return useMutation({
    mutationFn: procesarCif,
    retry: false,
  });
}