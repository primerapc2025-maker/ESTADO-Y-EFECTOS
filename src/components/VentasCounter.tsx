import { useState } from 'react';

function VentasCounter() {
  const [ventas, setVentas] = useState<number>(0);
  const [cajaAbierta, setCajaAbierta] = useState<boolean>(true);

  const registrarVenta = () => {
    setVentas((v) => v + 1);
  };

  const registrarCombo = () => {
    setVentas((v) => v + 1);
    setVentas((v) => v + 1);
    setVentas((v) => v + 1);
  };

  const anularUltima = () => {
    setVentas((v) => (v > 0 ? v - 1 : 0));
  };

  const cerrarCaja = () => {
    setVentas(0);
    setCajaAbierta(false);
  };

  const reabrirCaja = () => {
    setVentas(0);
    setCajaAbierta(true);
  };

  return (
    <div className="p-3">
      <h5 className="card-title">Ventas del día: {ventas}</h5>
      <span className={`badge ${cajaAbierta ? 'bg-success' : 'bg-secondary'}`}>
        {cajaAbierta ? 'Caja abierta' : 'Caja cerrada'}
      </span>

      <div className="d-flex flex-wrap gap-2 mt-3">
        <button
          className="btn btn-primary"
          disabled={!cajaAbierta}
          onClick={registrarVenta}
        >
          +1 venta
        </button>

        <button
          className="btn btn-success"
          disabled={!cajaAbierta}
          onClick={registrarCombo}
        >
          Combo (+3)
        </button>

        <button
          className="btn btn-warning"
          disabled={!cajaAbierta}
          onClick={anularUltima}
        >
          Anular última
        </button>

        <button
          className="btn btn-danger"
          disabled={!cajaAbierta}
          onClick={cerrarCaja}
        >
          Cerrar caja
        </button>

        <button
          className="btn btn-outline-secondary"
          disabled={cajaAbierta}
          onClick={reabrirCaja}
        >
          Reabrir caja
        </button>
      </div>
    </div>
  );
}

export default VentasCounter;