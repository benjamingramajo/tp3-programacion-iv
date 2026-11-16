import { useState } from "react";
import { Link } from "react-router-dom";

const REGEX_PATENTE = /^[A-Za-z0-9]{6,7}$/;

// Mismas reglas que validarVehiculo en el backend
function validar({ marca, modelo, patente, anio, capacidadCarga }) {
  const errores = {};
  const anioMaximo = new Date().getFullYear() + 1;

  if (!marca.trim()) errores.marca = "La marca es obligatoria";
  else if (marca.trim().length > 50) errores.marca = "La marca puede tener hasta 50 caracteres";

  if (!modelo.trim()) errores.modelo = "El modelo es obligatorio";
  else if (modelo.trim().length > 50) errores.modelo = "El modelo puede tener hasta 50 caracteres";

  if (!patente.trim()) errores.patente = "La patente es obligatoria";
  else if (!REGEX_PATENTE.test(patente.trim()))
    errores.patente = "La patente debe tener 6 o 7 letras y números";

  if (anio === "") errores.anio = "El año es obligatorio";
  else if (!Number.isInteger(Number(anio)) || Number(anio) < 1950 || Number(anio) > anioMaximo)
    errores.anio = `El año debe estar entre 1950 y ${anioMaximo}`;

  if (capacidadCarga === "") errores.capacidadCarga = "La capacidad de carga es obligatoria";
  else if (!(Number(capacidadCarga) > 0))
    errores.capacidadCarga = "La capacidad de carga debe ser un número mayor a 0";

  return errores;
}

// inicial: datos del vehículo al editar (o undefined al crear)
// alGuardar: función async que recibe los datos listos para enviar al backend
export default function FormularioVehiculo({ inicial, textoBoton, alGuardar }) {
  const [campos, setCampos] = useState({
    marca: inicial?.marca ?? "",
    modelo: inicial?.modelo ?? "",
    patente: inicial?.patente ?? "",
    anio: inicial?.anio !== undefined ? String(inicial.anio) : "",
    capacidadCarga: inicial?.capacidadCarga !== undefined ? String(inicial.capacidadCarga) : "",
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
        marca: campos.marca.trim(),
        modelo: campos.modelo.trim(),
        patente: campos.patente.trim().toUpperCase(),
        anio: Number(campos.anio),
        capacidadCarga: Number(campos.capacidadCarga),
      });
    } catch (error) {
      setErrorServidor(error.message);
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} noValidate>
      <label htmlFor="marca">Marca</label>
      <input id="marca" name="marca" value={campos.marca} onChange={cambiar} />
      {errores.marca && <p className="error-campo">{errores.marca}</p>}

      <label htmlFor="modelo">Modelo</label>
      <input id="modelo" name="modelo" value={campos.modelo} onChange={cambiar} />
      {errores.modelo && <p className="error-campo">{errores.modelo}</p>}

      <label htmlFor="patente">Patente</label>
      <input id="patente" name="patente" value={campos.patente} onChange={cambiar} />
      {errores.patente && <p className="error-campo">{errores.patente}</p>}

      <label htmlFor="anio">Año</label>
      <input id="anio" name="anio" type="number" value={campos.anio} onChange={cambiar} />
      {errores.anio && <p className="error-campo">{errores.anio}</p>}

      <label htmlFor="capacidadCarga">Capacidad de carga</label>
      <input
        id="capacidadCarga"
        name="capacidadCarga"
        type="number"
        step="any"
        value={campos.capacidadCarga}
        onChange={cambiar}
      />
      {errores.capacidadCarga && <p className="error-campo">{errores.capacidadCarga}</p>}

      {errorServidor && <p className="error-servidor">{errorServidor}</p>}

      <button type="submit" className="boton" disabled={enviando}>
        {enviando ? "Guardando..." : textoBoton}
      </button>
      <p className="pie-formulario">
        <Link to="/vehiculos">Volver al listado</Link>
      </p>
    </form>
  );
}
