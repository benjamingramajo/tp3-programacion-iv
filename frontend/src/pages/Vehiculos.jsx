import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { eliminarVehiculo, listarVehiculos } from "../services/vehiculos";

export default function Vehiculos() {
  const [vehiculos, setVehiculos] = useState([]);
  const [filtros, setFiltros] = useState({ marca: "", patente: "" });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // Carga inicial
  useEffect(() => {
    let activo = true;
    listarVehiculos()
      .then((datos) => activo && setVehiculos(datos))
      .catch((e) => activo && setError(e.message))
      .finally(() => activo && setCargando(false));

    return () => {
      activo = false;
    };
  }, []);

  // Recarga la lista aplicando los filtros indicados
  async function buscar(filtrosAplicados) {
    setCargando(true);
    setError("");
    try {
      setVehiculos(await listarVehiculos(filtrosAplicados));
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }

  function cambiarFiltro(e) {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  }

  function enviarFiltros(e) {
    e.preventDefault();
    buscar(filtros);
  }

  function limpiarFiltros() {
    const vacios = { marca: "", patente: "" };
    setFiltros(vacios);
    buscar(vacios);
  }

  async function eliminar(vehiculo) {
    if (!window.confirm(`¿Eliminar el vehículo ${vehiculo.patente}?`)) return;

    try {
      await eliminarVehiculo(vehiculo.id);
      await buscar(filtros);
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <section>
      <div className="encabezado-seccion">
        <h1>Vehículos</h1>
        <Link to="/vehiculos/nuevo" className="boton">
          Nuevo vehículo
        </Link>
      </div>

      <form className="filtros" onSubmit={enviarFiltros} noValidate>
        <div>
          <label htmlFor="filtro-marca">Marca</label>
          <input id="filtro-marca" name="marca" value={filtros.marca} onChange={cambiarFiltro} />
        </div>
        <div>
          <label htmlFor="filtro-patente">Patente</label>
          <input
            id="filtro-patente"
            name="patente"
            value={filtros.patente}
            onChange={cambiarFiltro}
          />
        </div>
        <button type="submit" className="boton">
          Buscar
        </button>
        <button type="button" className="boton boton-claro" onClick={limpiarFiltros}>
          Limpiar
        </button>
      </form>

      {error && <p className="error-servidor">{error}</p>}
      {cargando && <p>Cargando...</p>}

      {!cargando && vehiculos.length === 0 && !error && (
        <p className="vacio">No hay vehículos para mostrar.</p>
      )}

      {!cargando && vehiculos.length > 0 && (
        <div className="tabla-contenedor">
          <table>
            <thead>
              <tr>
                <th>Marca</th>
                <th>Modelo</th>
                <th>Patente</th>
                <th>Año</th>
                <th>Capacidad de carga</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {vehiculos.map((v) => (
                <tr key={v.id}>
                  <td>{v.marca}</td>
                  <td>{v.modelo}</td>
                  <td>{v.patente}</td>
                  <td>{v.anio}</td>
                  <td>{v.capacidadCarga}</td>
                  <td className="acciones">
                    <Link to={`/vehiculos/${v.id}/editar`} className="boton boton-chico boton-claro">
                      Editar
                    </Link>
                    <button
                      type="button"
                      className="boton boton-chico boton-peligro"
                      onClick={() => eliminar(v)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
