import { useState } from 'react';
import type { Producto, ItemCarrito } from '../types/tienda';

type EstadoEnvio = 'listo' | 'enviando' | 'enviado';

interface Props {
  productos: Producto[];
  items: ItemCarrito[];
  onItemsChange: (
    actualizar: (anteriores: ItemCarrito[]) => ItemCarrito[]
  ) => void;
}

function Cart({ productos, items, onItemsChange }: Props) {
  const [estado, setEstado] = useState<EstadoEnvio>('listo');

  // Valores DERIVADOS, nunca estados
  const total = items.reduce(
    (acum, it) => acum + it.precio * it.cantidad,
    0
  );
  const unidades = items.reduce((acum, it) => acum + it.cantidad, 0);
  const articulosDistintos = items.length;

  const bloqueado = estado === 'enviando';

  const agregar = (producto: Producto) => {
    onItemsChange((anteriores) => {
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

  const cambiarCantidad = (productoId: number, delta: number) => {
    onItemsChange((anteriores) =>
      anteriores
        .map((it) =>
          it.productoId === productoId
            ? { ...it, cantidad: it.cantidad + delta }
            : it
        )
        .filter((it) => it.cantidad > 0)
    );
  };

  const quitar = (productoId: number) => {
    onItemsChange((anteriores) =>
      anteriores.filter((it) => it.productoId !== productoId)
    );
  };

  const vaciarCarrito = () => {
    onItemsChange(() => []);
  };

  const enviar = () => {
    setEstado('enviando');
    setTimeout(() => {
      setEstado('enviado');
    }, 1500);
  };

  const reiniciar = () => {
    setEstado('listo');
    vaciarCarrito();
  };

  return (
    <div className="p-3 border rounded">
      <h5>Venta actual</h5>

      <ul className="list-group mb-3">
        {items.map((item) => (
          <li
            key={item.productoId}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <span>
              {item.nombre} — ${item.precio.toLocaleString('es-CO')}
            </span>
            <span className="d-flex align-items-center gap-2">
              <button
                className="btn btn-sm btn-outline-secondary"
                disabled={bloqueado}
                onClick={() => cambiarCantidad(item.productoId, -1)}
              >
                −
              </button>
              {item.cantidad}
              <button
                className="btn btn-sm btn-outline-secondary"
                disabled={bloqueado}
                onClick={() => cambiarCantidad(item.productoId, 1)}
              >
                +
              </button>
              <button
                className="btn btn-sm btn-outline-danger"
                disabled={bloqueado}
                onClick={() => quitar(item.productoId)}
              >
                Quitar
              </button>
            </span>
          </li>
        ))}
        {items.length === 0 && (
          <li className="list-group-item text-muted">Carrito vacío</li>
        )}
      </ul>

      <p className="mb-1">Artículos distintos: {articulosDistintos}</p>
      <p className="mb-1">Unidades totales: {unidades}</p>
      <p className="fw-bold">Total: ${total.toLocaleString('es-CO')}</p>

      <div className="d-flex gap-2 mb-3">
        <button
          className="btn btn-outline-secondary"
          disabled={bloqueado || items.length === 0}
          onClick={vaciarCarrito}
        >
          Vaciar carrito
        </button>
        <button
          className="btn btn-primary"
          disabled={bloqueado || items.length === 0 || estado === 'enviado'}
          onClick={enviar}
        >
          {estado === 'enviando' ? 'Enviando...' : 'Enviar venta'}
        </button>
        {estado === 'enviado' && (
          <button className="btn btn-success" onClick={reiniciar}>
            Nueva venta
          </button>
        )}
      </div>

      {estado === 'enviado' && (
        <div className="alert alert-success py-2">Venta enviada con éxito.</div>
      )}

      <hr />
      <h6>Productos disponibles</h6>
      <div className="d-flex flex-column gap-2">
        {productos.map((prod) => (
          <div
            key={prod.id}
            className="d-flex justify-content-between align-items-center border rounded p-2"
          >
            <span>
              {prod.nombre} — ${prod.precio.toLocaleString('es-CO')}
            </span>
            <button
              className="btn btn-sm btn-primary"
              disabled={bloqueado}
              onClick={() => agregar(prod)}
            >
              Agregar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Cart;