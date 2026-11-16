import { useState } from "react";
import { Link } from "react-router-dom";
import { fechaParaInput } from "../services/formato";

const REGEX_LETRAS = /^[\p{L} ]+$/u;
const REGEX_DOCUMENTO = /^\d{7,8}$/;
const REGEX_LICENCIA = /^[A-Za-z0-9]{1,20}$/;

// Mismas reglas que validarConductor en el backend
function validar(c) {
  const errores = {};

  if (!c.nombre.trim()) errores.nombre = "El nombre es obligatorio";
  else if (!REGEX_LETRAS.test(c.nombre.trim())) errores.nombre = "El nombre solo puede tener letras";
  else if (c.nombre.trim().length > 50) errores.nombre = "El nombre puede tener hasta 50 caracteres";

  if (!c.apellido.trim()) errores.apellido = "El apellido es obligatorio";
  else if (!REGEX_LETRAS.test(c.apellido.trim()))
    errores.apellido = "El apellido solo puede tener letras";
  else if (c.apellido.trim().length > 50)
    errores.apellido = "El apellido puede tener hasta 50 caracteres";

  if (!c.numeroDocumento.trim()) errores.numeroDocumento = "El número de documento es obligatorio";
  else if (!REGEX_DOCUMENTO.test(c.numeroDocumento.trim()))
    errores.numeroDocumento = "El documento debe tener entre 7 y 8 dígitos";

  if (!c.numeroLicencia.trim()) errores.numeroLicencia = "El número de licencia es obligatorio";
  else if (!REGEX_LICENCIA.test(c.numeroLicencia.trim()))
    errores.numeroLicencia = "La licencia solo puede tener letras y números (hasta 20)";

  if (!c.fechaAltaLicencia) errores.fechaAltaLicencia = "La fecha de alta es obligatoria";

  if (!c.fechaVencimientoLicencia)
    errores.fechaVencimientoLicencia = "La fecha de vencimiento es obligatoria";
  else if (c.fechaAltaLicencia && c.fechaVencimientoLicencia <= c.fechaAltaLicencia)
    errores.fechaVencimientoLicencia =
      "La fecha de vencimiento debe ser posterior a la fecha de alta";

  return errores;
}

// inicial: datos del conductor al editar (o undefined al crear)
// alGuardar: función async que recibe los datos listos para enviar al backend
export default function FormularioConductor({ inicial, textoBoton, alGuardar }) {
  const [campos, setCampos] = useState({
    nombre: inicial?.nombre ?? "",
    apellido: inicial?.apellido ?? "",
    numeroDocumento: inicial?.numeroDocumento !== undefined ? String(inicial.numeroDocumento) : "",
    numeroLicencia: inicial?.numeroLicencia ?? "",
    fechaAltaLicencia: fechaParaInput(inicial?.fechaAltaLicencia),
    fechaVencimientoLicencia: fechaParaInput(inicial?.fechaVencimientoLicencia),
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
        nombre: campos.nombre.trim(),
        apellido: campos.apellido.trim(),
        numeroDocumento: campos.numeroDocumento.trim(),
        numeroLicencia: campos.numeroLicencia.trim(),
        fechaAltaLicencia: campos.fechaAltaLicencia,
        fechaVencimientoLicencia: campos.fechaVencimientoLicencia,
      });
    } catch (error) {
      setErrorServidor(error.message);
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} noValidate>
      <label htmlFor="nombre">Nombre</label>
      <input id="nombre" name="nombre" value={campos.nombre} onChange={cambiar} />
      {errores.nombre && <p className="error-campo">{errores.nombre}</p>}

      <label htmlFor="apellido">Apellido</label>
      <input id="apellido" name="apellido" value={campos.apellido} onChange={cambiar} />
      {errores.apellido && <p className="error-campo">{errores.apellido}</p>}

      <label htmlFor="numeroDocumento">Número de documento</label>
      <input
        id="numeroDocumento"
        name="numeroDocumento"
        inputMode="numeric"
        value={campos.numeroDocumento}
        onChange={cambiar}
      />
      {errores.numeroDocumento && <p className="error-campo">{errores.numeroDocumento}</p>}

      <label htmlFor="numeroLicencia">Número de licencia</label>
      <input
        id="numeroLicencia"
        name="numeroLicencia"
        value={campos.numeroLicencia}
        onChange={cambiar}
      />
      {errores.numeroLicencia && <p className="error-campo">{errores.numeroLicencia}</p>}

      <label htmlFor="fechaAltaLicencia">Fecha de alta de la licencia</label>
      <input
        id="fechaAltaLicencia"
        name="fechaAltaLicencia"
        type="date"
        value={campos.fechaAltaLicencia}
        onChange={cambiar}
      />
      {errores.fechaAltaLicencia && <p className="error-campo">{errores.fechaAltaLicencia}</p>}

      <label htmlFor="fechaVencimientoLicencia">Fecha de vencimiento de la licencia</label>
      <input
        id="fechaVencimientoLicencia"
        name="fechaVencimientoLicencia"
        type="date"
        value={campos.fechaVencimientoLicencia}
        onChange={cambiar}
      />
      {errores.fechaVencimientoLicencia && (
        <p className="error-campo">{errores.fechaVencimientoLicencia}</p>
      )}

      {errorServidor && <p className="error-servidor">{errorServidor}</p>}

      <button type="submit" className="boton" disabled={enviando}>
        {enviando ? "Guardando..." : textoBoton}
      </button>
      <p className="pie-formulario">
        <Link to="/conductores">Volver al listado</Link>
      </p>
    </form>
  );
}
