import { useState } from "react";
import { Link } from "react-router-dom";

// Mismas reglas que validarViaje en el backend
function validar(c) {
  const errores = {};

  if (!c.vehiculoId) errores.vehiculoId = "Elegí un vehículo";
  if (!c.conductorId) errores.conductorId = "Elegí un conductor";

  if (!c.fechaSalida) errores.fechaSalida = "La fecha de salida es obligatoria";

  if (!c.fechaLlegada) errores.fechaLlegada = "La fecha de llegada es obligatoria";
  else if (c.fechaSalida && c.fechaLlegada < c.fechaSalida)
    errores.fechaLlegada = "La fecha de llegada no puede ser anterior a la salida";

  if (!c.origen.trim()) errores.origen = "El origen es obligatorio";
  else if (c.origen.trim().length > 100) errores.origen = "El origen puede tener hasta 100 caracteres";

  if (!c.destino.trim()) errores.destino = "El destino es obligatorio";
  else if (c.destino.trim().length > 100)
    errores.destino = "El destino puede tener hasta 100 caracteres";

  if (c.kilometros === "") errores.kilometros = "Los kilómetros son obligatorios";
  else if (!(Number(c.kilometros) > 0)) errores.kilometros = "Los kilómetros deben ser un número mayor a 0";

  if (c.observaciones.length > 255)
    errores.observaciones = "Las observaciones pueden tener hasta 255 caracteres";

  return errores;
}

// vehiculos y conductores: listas para armar los selects
// inicial: datos del viaje al editar (o undefined al crear)
// alGuardar: función async que recibe los datos listos para enviar al backend
export default function FormularioViaje({ vehiculos, conductores, inicial, textoBoton, alGuardar }) {
  const [campos, setCampos] = useState({
    vehiculoId: inicial?.vehiculoId !== undefined ? String(inicial.vehiculoId) : "",
    conductorId: inicial?.conductorId !== undefined ? String(inicial.conductorId) : "",
    fechaSalida: inicial?.fechaSalida ? String(inicial.fechaSalida).slice(0, 16) : "",
    fechaLlegada: inicial?.fechaLlegada ? String(inicial.fechaLlegada).slice(0, 16) : "",
    origen: inicial?.origen ?? "",
    destino: inicial?.destino ?? "",
    kilometros: inicial?.kilometros !== undefined ? String(inicial.kilometros) : "",
    observaciones: inicial?.observaciones ?? "",
  });
  const [errores, setErrores] = useState({});
  const [errorServidor, setErrorServidor] = useState("");
  const [enviando, setEnviando] = useState(false);

  function cambiar(e) {
    setCampos({ ...campos, [e.target.name]: e.target.value });
  }

  async function enviar(e) {
    e.preventDefault();
    setErrorServidor("");

    const erroresNuevos = validar(campos);
    setErrores(erroresNuevos);
    if (Object.keys(erroresNuevos).length > 0) return;

    setEnviando(true);
    try {
      await alGuardar({
        vehiculoId: Number(campos.vehiculoId),
        conductorId: Number(campos.conductorId),
        fechaSalida: campos.fechaSalida,
        fechaLlegada: campos.fechaLlegada,
        origen: campos.origen.trim(),
        destino: campos.destino.trim(),
        kilometros: Number(campos.kilometros),
        observaciones: campos.observaciones.trim(),
      });
    } catch (error) {
      setErrorServidor(error.message);
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} noValidate>
      <label htmlFor="vehiculoId">Vehículo</label>
      <select id="vehiculoId" name="vehiculoId" value={campos.vehiculoId} onChange={cambiar}>
        <option value="">Elegí un vehículo</option>
        {vehiculos.map((v) => (
          <option key={v.id} value={v.id}>
            {v.patente} - {v.marca} {v.modelo}
          </option>
        ))}
      </select>
      {errores.vehiculoId && <p className="error-campo">{errores.vehiculoId}</p>}

      <label htmlFor="conductorId">Conductor</label>
      <select id="conductorId" name="conductorId" value={campos.conductorId} onChange={cambiar}>
        <option value="">Elegí un conductor</option>
        {conductores.map((c) => (
          <option key={c.id} value={c.id}>
            {c.apellido}, {c.nombre}
          </option>
        ))}
      </select>
      {errores.conductorId && <p className="error-campo">{errores.conductorId}</p>}

      <label htmlFor="fechaSalida">Fecha y hora de salida</label>
      <input
        id="fechaSalida"
        name="fechaSalida"
        type="datetime-local"
        value={campos.fechaSalida}
        onChange={cambiar}
      />
      {errores.fechaSalida && <p className="error-campo">{errores.fechaSalida}</p>}

      <label htmlFor="fechaLlegada">Fecha y hora de llegada</label>
      <input
        id="fechaLlegada"
        name="fechaLlegada"
        type="datetime-local"
        value={campos.fechaLlegada}
        onChange={cambiar}
      />
      {errores.fechaLlegada && <p className="error-campo">{errores.fechaLlegada}</p>}

      <label htmlFor="origen">Origen</label>
      <input id="origen" name="origen" value={campos.origen} onChange={cambiar} />
      {errores.origen && <p className="error-campo">{errores.origen}</p>}

      <label htmlFor="destino">Destino</label>
      <input id="destino" name="destino" value={campos.destino} onChange={cambiar} />
      {errores.destino && <p className="error-campo">{errores.destino}</p>}

      <label htmlFor="kilometros">Kilómetros</label>
      <input
        id="kilometros"
        name="kilometros"
        type="number"
        step="any"
        value={campos.kilometros}
        onChange={cambiar}
      />
      {errores.kilometros && <p className="error-campo">{errores.kilometros}</p>}

      <label htmlFor="observaciones">Observaciones (opcional)</label>
      <textarea
        id="observaciones"
        name="observaciones"
        rows="3"
        value={campos.observaciones}
        onChange={cambiar}
      />
      {errores.observaciones && <p className="error-campo">{errores.observaciones}</p>}

      {errorServidor && <p className="error-servidor">{errorServidor}</p>}

      <button type="submit" className="boton" disabled={enviando}>
        {enviando ? "Guardando..." : textoBoton}
      </button>
      <p className="pie-formulario">
        <Link to="/viajes">Volver al listado</Link>
      </p>
    </form>
  );
}
