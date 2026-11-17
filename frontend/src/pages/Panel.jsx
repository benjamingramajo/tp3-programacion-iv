import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Panel() {
  const { sesion } = useAuth();

  return (
    <section>
      <h1>Hola, {sesion.nombre}</h1>
      <p>¿Qué querés gestionar hoy?</p>

      <div className="accesos">
        <Link to="/vehiculos" className="acceso">
          <strong>Vehículos</strong>
          <span>Alta, modificación y baja de la flota</span>
        </Link>
        <Link to="/conductores" className="acceso">
          <strong>Conductores</strong>
          <span>Datos y licencias de los conductores</span>
        </Link>
        <Link to="/viajes" className="acceso">
          <strong>Viajes</strong>
          <span>Registro, historial y kilómetros recorridos</span>
        </Link>
      </div>
    </section>
  );
}
