import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Página principal pública
export default function Inicio() {
  const { sesion } = useAuth();

  return (
    <section className="portada">
      <h1>Cada viaje, cada conductor, cada vehículo en un solo lugar</h1>
      <p>
        Registrá tu flota, cargá los viajes realizados y consultá cuántos
        kilómetros recorrió cada conductor o vehículo.
      </p>
      <Link to={sesion ? "/panel" : "/login"} className="boton boton-grande">
        {sesion ? "Ir al panel" : "Iniciar sesión"}
      </Link>
    </section>
  );
}
