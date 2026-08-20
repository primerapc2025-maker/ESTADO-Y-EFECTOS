import type { Producto } from '../types/tienda';
import ProductForm from './ProductForm';

interface Props {
  producto: Producto;
  onGuardar: (producto: Producto) => void;
  onAgregarAlCarrito: (producto: Producto) => void;
}

function ProductDetail({ producto, onGuardar, onAgregarAlCarrito }: Props) {
  return (
    <div>
      <h5>Detalle del producto</h5>
      <p className="text-muted mb-2">
        Stock disponible: {producto.stock} — Categoría: {producto.categoria}
      </p>

      <button
        className="btn btn-success mb-3"
        onClick={() => onAgregarAlCarrito(producto)}
      >
        Agregar a la venta
      </button>

      <ProductForm productoInicial={producto} onGuardar={onGuardar} />
    </div>
  );
}

export default ProductDetail;