import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listarConductores } from "../services/conductores";
import { formatearFechaHora } from "../services/formato";
import { listarVehiculos } from "../services/vehiculos";
import { eliminarViaje, listarViajes, obtenerTotalKilometros } from "../services/viajes";

export default function Viajes() {
  const [viajes, setViajes] = useState([]);
  const [total, setTotal] = useState({ totalKilometros: 0, cantidadViajes: 0 });
  const [vehiculos, setVehiculos] = useState([]);
  const [conductores, setConductores] = useState([]);
  const [filtros, setFiltros] = useState({ vehiculoId: "", conductorId: "" });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // Carga inicial: historial completo, total y listas para los filtros
  useEffect(() => {
    let activo = true;

    Promise.all([listarViajes(), obtenerTotalKilometros(), listarVehiculos(), listarConductores()])
      .then(([listaViajes, totales, listaVehiculos, listaConductores]) => {
        if (!activo) return;
        setViajes(listaViajes);
        setTotal(totales);
        setVehiculos(listaVehiculos);
        setConductores(listaConductores);
      })
      .catch((e) => activo && setError(e.message))
      .finally(() => activo && setCargando(false));

    return () => {
      activo = false;
    };
  }, []);

  // Recarga el historial y el total aplicando los filtros indicados
  async function buscar(filtrosAplicados) {
    setCargando(true);
    setError("");
    try {
      const [listaViajes, totales] = await Promise.all([
        listarViajes(filtrosAplicados),
        obtenerTotalKilometros(filtrosAplicados),
      ]);
      setViajes(listaViajes);
      setTotal(totales);
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }

  function cambiarFiltro(e) {
    const nuevos = { ...filtros, [e.target.name]: e.target.value };
    setFiltros(nuevos);
    buscar(nuevos);
  }

  function limpiarFiltros() {
    const vacios = { vehiculoId: "", conductorId: "" };
    setFiltros(vacios);
    buscar(vacios);
  }

  async function eliminar(viaje) {
    if (!window.confirm(`¿Eliminar el viaje de ${viaje.origen} a ${viaje.destino}?`)) return;

    try {
      await eliminarViaje(viaje.id);
      await buscar(filtros);
    } catch (e) {
      setError(e.message);
    }
  }

  const hayFiltros = filtros.vehiculoId !== "" || filtros.conductorId !== "";

  return (
    <section>
      <div className="encabezado-seccion">
        <h1>Viajes</h1>
        <Link to="/viajes/nuevo" className="boton">
          Nuevo viaje
        </Link>
      </div>

      <div className="filtros">
        <div>
          <label htmlFor="filtro-vehiculo">Vehículo</label>
          <select
            id="filtro-vehiculo"
            name="vehiculoId"
            value={filtros.vehiculoId}
            onChange={cambiarFiltro}
          >
            <option value="">Todos</option>
            {vehiculos.map((v) => (
              <option key={v.id} value={v.id}>
                {v.patente} - {v.marca} {v.modelo}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="filtro-conductor">Conductor</label>
          <select
            id="filtro-conductor"
            name="conductorId"
            value={filtros.conductorId}
            onChange={cambiarFiltro}
          >
            <option value="">Todos</option>
            {conductores.map((c) => (
              <option key={c.id} value={c.id}>
                {c.apellido}, {c.nombre}
              </option>
            ))}
          </select>
        </div>
        {hayFiltros && (
          <button type="button" className="boton boton-claro" onClick={limpiarFiltros}>
            Limpiar filtros
          </button>
        )}
      </div>

      <p className="resumen">
        <strong>{Number(total.totalKilometros).toLocaleString("es-AR")} km</strong> recorridos en{" "}
        {total.cantidadViajes} {total.cantidadViajes === 1 ? "viaje" : "viajes"}
        {hayFiltros && " (según los filtros elegidos)"}
      </p>

      {error && <p className="error-servidor">{error}</p>}
      {cargando && <p>Cargando...</p>}

      {!cargando && viajes.length === 0 && !error && (
        <p className="vacio">No hay viajes para mostrar.</p>
      )}

      {!cargando && viajes.length > 0 && (
        <div className="tabla-contenedor">
          <table>
            <thead>
              <tr>
                <th>Salida</th>
                <th>Llegada</th>
                <th>Vehículo</th>
                <th>Conductor</th>
                <th>Origen</th>
                <th>Destino</th>
                <th>Km</th>
                <th>Observaciones</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {viajes.map((v) => (
                <tr key={v.id}>
                  <td>{formatearFechaHora(v.fechaSalida)}</td>
                  <td>{formatearFechaHora(v.fechaLlegada)}</td>
                  <td>
                    {v.patente} - {v.vehiculo}
                  </td>
                  <td>{v.conductor}</td>
                  <td>{v.origen}</td>
                  <td>{v.destino}</td>
                  <td>{Number(v.kilometros).toLocaleString("es-AR")}</td>
                  <td className="celda-larga" title={v.observaciones ?? ""}>
                    {v.observaciones}
                  </td>
                  <td className="acciones">
                    <Link to={`/viajes/${v.id}/editar`} className="boton boton-chico boton-claro">
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
