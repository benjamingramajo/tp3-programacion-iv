import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REGEX_LETRAS = /^[\p{L} ]+$/u;

// Mismas reglas que validarRegistro en el backend
function validar({ nombre, email, password, repetir }) {
  const errores = {};
  if (!nombre.trim()) errores.nombre = "El nombre es obligatorio";
  else if (!REGEX_LETRAS.test(nombre.trim())) errores.nombre = "El nombre solo puede tener letras";
  else if (nombre.trim().length > 50) errores.nombre = "El nombre puede tener hasta 50 caracteres";
  if (!email.trim()) errores.email = "El email es obligatorio";
  else if (!REGEX_EMAIL.test(email)) errores.email = "El email no tiene un formato válido";
  else if (email.trim().length > 100) errores.email = "El email puede tener hasta 100 caracteres";
  if (!password) errores.password = "La contraseña es obligatoria";
  else if (password.length < 6 || password.length > 50)
    errores.password = "La contraseña debe tener entre 6 y 50 caracteres";
  if (repetir !== password) errores.repetir = "Las contraseñas no coinciden";
  return errores;
}

export default function Registro() {
  const { sesion, registrar } = useAuth();
  const navigate = useNavigate();
  const [campos, setCampos] = useState({ nombre: "", email: "", password: "", repetir: "" });
  const [errores, setErrores] = useState({});
  const [errorServidor, setErrorServidor] = useState("");
  const [enviando, setEnviando] = useState(false);

  if (sesion) return <Navigate to="/panel" replace />;

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
      await registrar(campos.nombre.trim(), campos.email.trim(), campos.password);
      navigate("/login");
    } catch (error) {
      setErrorServidor(error.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="tarjeta-formulario">
      <h1>Crear cuenta</h1>

      <form onSubmit={enviar} noValidate>
        <label htmlFor="nombre">Nombre</label>
        <input id="nombre" name="nombre" value={campos.nombre} onChange={cambiar} />
        {errores.nombre && <p className="error-campo">{errores.nombre}</p>}

        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" value={campos.email} onChange={cambiar} />
        {errores.email && <p className="error-campo">{errores.email}</p>}

        <label htmlFor="password">Contraseña</label>
        <input
          id="password"
          name="password"
          type="password"
          value={campos.password}
          onChange={cambiar}
          autoComplete="new-password"
        />
        {errores.password && <p className="error-campo">{errores.password}</p>}

        <label htmlFor="repetir">Repetir contraseña</label>
        <input
          id="repetir"
          name="repetir"
          type="password"
          value={campos.repetir}
          onChange={cambiar}
          autoComplete="new-password"
        />
        {errores.repetir && <p className="error-campo">{errores.repetir}</p>}

        {errorServidor && <p className="error-servidor">{errorServidor}</p>}

        <button type="submit" className="boton" disabled={enviando}>
          {enviando ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>

      <p className="pie-formulario">
        ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
      </p>
    </section>
  );
}
