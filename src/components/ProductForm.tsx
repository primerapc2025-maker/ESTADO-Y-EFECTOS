// src/components/ProductForm.tsx
import { useState } from 'react';
import type { Categoria, Producto } from '../types/tienda';

interface Props {
  productoInicial: Producto;
  onGuardar: (producto: Producto) => void;
}

const CATEGORIAS: Categoria[] = ['abarrotes', 'aseo', 'bebidas'];

function ProductForm({ productoInicial, onGuardar }: Props) {
  const [producto, setProducto] = useState<Producto>(productoInicial);

  // R8: valor DERIVADO, no un estado nuevo
  const hayCambios =
    JSON.stringify(producto) !== JSON.stringify(productoInicial);

  const manejarCambio = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const esNumero = name === 'precio' || name === 'stock';
    setProducto((prev) => ({
      ...prev,
      [name]: esNumero ? Number(value) : value,
    }));
  };

  const manejarCambioContacto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProducto((prev) => ({
      ...prev,
      proveedor: {
        ...prev.proveedor,
        contacto: {
          ...prev.proveedor.contacto,
          [name]: value,
        },
      },
    }));
  };

  const manejarCambioProveedorNombre = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { value } = e.target;
    setProducto((prev) => ({
      ...prev,
      proveedor: {
        ...prev.proveedor,
        nombre: value,
      },
    }));
  };

  const descartar = () => {
    setProducto(productoInicial);
  };

  return (
    <div className="p-3 border rounded">
      <div className="mb-2">
        <label className="form-label">Nombre</label>
        <input
          className="form-control"
          name="nombre"
          value={producto.nombre}
          onChange={manejarCambio}
        />
      </div>

      <div className="mb-2">
        <label className="form-label">Precio</label>
        <input
          className="form-control"
          type="number"
          name="precio"
          value={producto.precio}
          onChange={manejarCambio}
        />
      </div>

      <div className="mb-2">
        <label className="form-label">Stock</label>
        <input
          className="form-control"
          type="number"
          name="stock"
          value={producto.stock}
          onChange={manejarCambio}
        />
      </div>

      <div className="mb-2">
        <label className="form-label">Categoría</label>
        <select
          className="form-select"
          name="categoria"
          value={producto.categoria}
          onChange={manejarCambio}
        >
          {CATEGORIAS.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <hr />
      <h6>Proveedor</h6>

      <div className="mb-2">
        <label className="form-label">Nombre del proveedor</label>
        <input
          className="form-control"
          name="nombreProveedor"
          value={producto.proveedor.nombre}
          onChange={manejarCambioProveedorNombre}
        />
      </div>

      <div className="mb-2">
        <label className="form-label">Teléfono</label>
        <input
          className="form-control"
          name="telefono"
          value={producto.proveedor.contacto.telefono}
          onChange={manejarCambioContacto}
        />
      </div>

      <div className="mb-2">
        <label className="form-label">Ciudad</label>
        <input
          className="form-control"
          name="ciudad"
          value={producto.proveedor.contacto.ciudad}
          onChange={manejarCambioContacto}
        />
      </div>

      <div className="d-flex gap-2 mt-3">
        <button
          className="btn btn-primary"
          disabled={!hayCambios}
          onClick={() => onGuardar(producto)}
        >
          Guardar
        </button>
        <button
          className="btn btn-outline-secondary"
          disabled={!hayCambios}
          onClick={descartar}
        >
          Descartar cambios
        </button>
      </div>

      <pre className="bg-light p-2 mt-3 small" style={{ maxHeight: 240, overflow: 'auto' }}>
        {JSON.stringify(producto, null, 2)}
      </pre>
    </div>
  );
}

export default ProductForm;