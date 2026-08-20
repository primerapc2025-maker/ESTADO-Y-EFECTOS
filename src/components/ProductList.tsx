import type { Producto } from '../types/tienda';

interface Props {
  productos: Producto[];
  seleccionadoId: number | null;
  onSeleccionar: (id: number) => void;
}

function ProductList({ productos, seleccionadoId, onSeleccionar }: Props) {
  if (productos.length === 0) {
    return <p className="text-muted">No hay productos para mostrar.</p>;
  }

  return (
    <ul className="list-group">
      {productos.map((prod) => (
        <li
          key={prod.id}
          onClick={() => onSeleccionar(prod.id)}
          role="button"
          className={`list-group-item d-flex justify-content-between align-items-center ${
            prod.id === seleccionadoId ? 'active' : ''
          }`}
        >
          <span>{prod.nombre}</span>
          <span className="badge bg-light text-dark">
            ${prod.precio.toLocaleString('es-CO')}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default ProductList;