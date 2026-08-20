import { useState, useEffect } from 'react';

export function useDebounce<T>(valor: T, retardo = 400): T {
  const [valorDiferido, setValorDiferido] = useState<T>(valor);

  useEffect(() => {
    const temporizador = setTimeout(() => {
      setValorDiferido(valor);
    }, retardo);

    return () => {
      clearTimeout(temporizador);
    };
  }, [valor, retardo]);

  return valorDiferido;
}