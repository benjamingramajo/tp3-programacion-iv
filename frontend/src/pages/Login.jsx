import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validar({ email, password }) {
  const errores = {};
  if (!email.trim()) errores.email = "El email es obligatorio";
  else if (!REGEX_EMAIL.test(email)) errores.email = "El email no tiene un formato válido";
  if (!password) errores.password = "La contraseña es obligatoria";
  return errores;
}

export default function Login() {
  const { sesion, iniciarSesion } = useAuth();
  const navigate = useNavigate();
  const [campos, setCampos] = useState({ email: "", password: "" });
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
      await iniciarSesion(campos.email.trim(), campos.password);
      navigate("/panel");
    } catch (error) {
      setErrorServidor(error.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="tarjeta-formulario">
      <h1>Iniciar sesión</h1>

      <form onSubmit={enviar} noValidate>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={campos.email}
          onChange={cambiar}
          autoComplete="email"
        />
        {errores.email && <p className="error-campo">{errores.email}</p>}

        <label htmlFor="password">Contraseña</label>
        <input
          id="password"
          name="password"
          type="password"
          value={campos.password}
          onChange={cambiar}
          autoComplete="current-password"
        />
        {errores.password && <p className="error-campo">{errores.password}</p>}

        {errorServidor && <p className="error-servidor">{errorServidor}</p>}

        <button type="submit" className="boton" disabled={enviando}>
          {enviando ? "Ingresando..." : "Iniciar sesión"}
        </button>
      </form>

      <p className="pie-formulario">
        ¿No tenés cuenta? <Link to="/registro">Creá una</Link>
      </p>
    </section>
  );
}
