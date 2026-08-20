import { useState, useEffect } from 'react';
import { getProductos } from '../api/tiendaApi';
import { useDebounce } from './useDebounce';
import type { Producto } from '../types/tienda';

interface UseProductsResultado {
  productos: Producto[];
  cargando: boolean;
  error: string | null;
  recargar: () => void;
}

export function useProducts(termino: string): UseProductsResultado {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [intento, setIntento] = useState<number>(0);

  const terminoDiferido = useDebounce(termino, 400);

  useEffect(() => {
    let ignorar = false;

    setCargando(true);
    setError(null);

    getProductos(terminoDiferido)
      .then((datos) => {
        if (!ignorar) {
          setProductos(datos);
        }
      })
      .catch((e: Error) => {
        if (!ignorar) {
          setError(e.message);
          setProductos([]);
        }
      })
      .finally(() => {
        if (!ignorar) {
          setCargando(false);
        }
      });

    return () => {
      ignorar = true;
    };
  }, [terminoDiferido, intento]);

  const recargar = () => {
    setIntento((i) => i + 1);
  };

  return { productos, cargando, error, recargar };
}