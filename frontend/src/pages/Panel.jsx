import { useAuth } from "../context/AuthContext";

// Página protegida provisoria: después se reemplaza por los listados
export default function Panel() {
  const { sesion } = useAuth();

  return (
    <section>
      <h1>Hola, {sesion.nombre}</h1>
      <p>Acá van a ir los vehículos, los conductores y los viajes.</p>
    </section>
  );
}
