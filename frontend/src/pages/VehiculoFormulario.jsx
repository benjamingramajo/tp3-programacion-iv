import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FormularioVehiculo from "../components/FormularioVehiculo";
import {
  actualizarVehiculo,
  crearVehiculo,
  obtenerVehiculo,
} from "../services/vehiculos";

// Sirve para el alta (/vehiculos/nuevo) y la modificación (/vehiculos/:id/editar)
export default function VehiculoFormulario() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editando = Boolean(id);

  const [vehiculo, setVehiculo] = useState(null);
  const [cargando, setCargando] = useState(editando);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!editando) return;

    let activo = true;
    obtenerVehiculo(id)
      .then((datos) => activo && setVehiculo(datos))
      .catch((e) => activo && setError(e.message))
      .finally(() => activo && setCargando(false));

    return () => {
      activo = false;
    };
  }, [id, editando]);

  async function guardar(datos) {
    if (editando) {
      await actualizarVehiculo(id, datos);
    } else {
      await crearVehiculo(datos);
    }
    navigate("/vehiculos");
  }

  return (
    <section className="tarjeta-formulario">
      <h1>{editando ? "Modificar vehículo" : "Nuevo vehículo"}</h1>

      {cargando && <p>Cargando...</p>}
      {error && <p className="error-servidor">{error}</p>}

      {!cargando && !error && (
        <FormularioVehiculo
          inicial={vehiculo ?? undefined}
          textoBoton={editando ? "Guardar cambios" : "Crear vehículo"}
          alGuardar={guardar}
        />
      )}
    </section>
  );
}
