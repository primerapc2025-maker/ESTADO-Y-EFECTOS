import { useState, useEffect } from 'react';
import { useProducts } from './hooks/useProducts';
import { useToggle } from './hooks/useToggle';
import ProductList from './components/ProductList.tsx';
import ProductDetail from './components/ProductDetail.tsx';
import Cart from './components/Cart.tsx';
import type { Producto, ItemCarrito } from './types/tienda';

function App() {
  const [busqueda, setBusqueda] = useState<string>('');
  const [seleccionadoId, setSeleccionadoId] = useState<number | null>(null);
  const [items, setItems] = useState<ItemCarrito[]>([]);
  const [edicionesLocales, setEdicionesLocales] = useState<Record<number, Producto>>({});
  const [mostrarCarrito, alternarCarrito] = useToggle(true);

  const { productos: productosApi, cargando, error, recargar } =
    useProducts(busqueda);

  // R8: se combinan los productos del servidor con las ediciones locales,
  // en lugar de duplicar el arreglo completo en otro estado (Principio 4).
  const productos: Producto[] = productosApi.map(
    (prod) => edicionesLocales[prod.id] ?? prod
  );

  const seleccionado = productos.find((prod) => prod.id === seleccionadoId) ?? null;

  const unidades = items.reduce((acum, it) => acum + it.cantidad, 0);

  useEffect(() => {
    document.title =
      unidades > 0 ? `(${unidades}) TiendaExpress` : 'TiendaExpress';
  }, [unidades]);

  const guardarProducto = (editado: Producto) => {
    setEdicionesLocales((prev) => ({
      ...prev,
      [editado.id]: editado,
    }));
  };

  const agregarAlCarritoDesdeDetalle = (producto: Producto) => {
    setItems((anteriores) => {
      const existente = anteriores.find(
        (it) => it.productoId === producto.id
      );
      if (existente) {
        return anteriores.map((it) =>
          it.productoId === producto.id
            ? { ...it, cantidad: it.cantidad + 1 }
            : it
        );
      }
      return [
        ...anteriores,
        {
          productoId: producto.id,
          nombre: producto.nombre,
          precio: producto.precio,
          cantidad: 1,
        },
      ];
    });
  };

  return (
    <div className="container py-4">
      <h3 className="mb-3">Tablero TiendaExpress</h3>

      <div className="d-flex gap-2 mb-3">
        <input
          className="form-control"
          placeholder="Buscar producto... (escriba 'error' para simular un fallo)"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <button className="btn btn-outline-primary" onClick={alternarCarrito}>
          {mostrarCarrito ? 'Ocultar carrito' : 'Mostrar carrito'}
        </button>
      </div>

      <div className="row g-3">
        <div className="col-md-6">
          {cargando && (
            <div className="alert alert-info py-2">Cargando productos…</div>
          )}

          {error && !cargando && (
            <div className="alert alert-danger py-2 d-flex justify-content-between align-items-center">
              <span>{error}</span>
              <button className="btn btn-sm btn-outline-danger" onClick={recargar}>
                Reintentar
              </button>
            </div>
          )}

          {!cargando && !error && (
            <ProductList
              productos={productos}
              seleccionadoId={seleccionadoId}
              onSeleccionar={setSeleccionadoId}
            />
          )}
        </div>

        <div className="col-md-6">
          {seleccionado ? (
            <ProductDetail
              producto={seleccionado}
              onGuardar={guardarProducto}
              onAgregarAlCarrito={agregarAlCarritoDesdeDetalle}
            />
          ) : (
            <p className="text-muted">Seleccione un producto de la lista.</p>
          )}
        </div>
      </div>

      {mostrarCarrito && (
        <div className="row mt-4">
          <div className="col-12">
            <Cart
              productos={productos}
              items={items}
              onItemsChange={setItems}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;