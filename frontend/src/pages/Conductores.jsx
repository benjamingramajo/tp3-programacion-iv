import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { eliminarConductor, listarConductores } from "../services/conductores";
import { formatearFecha } from "../services/formato";

export default function Conductores() {
  const [conductores, setConductores] = useState([]);
  const [filtros, setFiltros] = useState({ apellido: "" });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // Carga inicial
  useEffect(() => {
    let activo = true;
    listarConductores()
      .then((datos) => activo && setConductores(datos))
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
      setConductores(await listarConductores(filtrosAplicados));
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
    const vacios = { apellido: "" };
    setFiltros(vacios);
    buscar(vacios);
  }

  async function eliminar(conductor) {
    const nombre = `${conductor.nombre} ${conductor.apellido}`;
    if (!window.confirm(`¿Eliminar al conductor ${nombre}?`)) return;

    try {
      await eliminarConductor(conductor.id);
      await buscar(filtros);
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <section>
      <div className="encabezado-seccion">
        <h1>Conductores</h1>
        <Link to="/conductores/nuevo" className="boton">
          Nuevo conductor
        </Link>
      </div>

      <form className="filtros" onSubmit={enviarFiltros} noValidate>
        <div>
          <label htmlFor="filtro-apellido">Apellido</label>
          <input
            id="filtro-apellido"
            name="apellido"
            value={filtros.apellido}
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

      {!cargando && conductores.length === 0 && !error && (
        <p className="vacio">No hay conductores para mostrar.</p>
      )}

      {!cargando && conductores.length > 0 && (
        <div className="tabla-contenedor">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Documento</th>
                <th>Licencia</th>
                <th>Alta licencia</th>
                <th>Vencimiento</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {conductores.map((c) => (
                <tr key={c.id}>
                  <td>{c.nombre}</td>
                  <td>{c.apellido}</td>
                  <td>{c.numeroDocumento}</td>
                  <td>{c.numeroLicencia}</td>
                  <td>{formatearFecha(c.fechaAltaLicencia)}</td>
                  <td>{formatearFecha(c.fechaVencimientoLicencia)}</td>
                  <td className="acciones">
                    <Link
                      to={`/conductores/${c.id}/editar`}
                      className="boton boton-chico boton-claro"
                    >
                      Editar
                    </Link>
                    <button
                      type="button"
                      className="boton boton-chico boton-peligro"
                      onClick={() => eliminar(c)}
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
