import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { sesion, cerrarSesion } = useAuth();
  const navigate = useNavigate();

  function salir() {
    cerrarSesion();
    navigate("/");
  }

  return (
    <header className="navbar">
      <Link to="/" className="navbar-marca">
        Flota
      </Link>

      <nav className="navbar-links">
        {sesion ? (
          <>
            <Link to="/panel">Panel</Link>
            <span className="navbar-usuario">{sesion.nombre}</span>
            <button type="button" className="boton boton-secundario" onClick={salir}>
              Cerrar sesión
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Iniciar sesión</Link>
            <Link to="/registro" className="boton">
              Crear cuenta
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
