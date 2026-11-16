import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FormularioConductor from "../components/FormularioConductor";
import {
  actualizarConductor,
  crearConductor,
  obtenerConductor,
} from "../services/conductores";

// Sirve para el alta (/conductores/nuevo) y la modificación (/conductores/:id/editar)
export default function ConductorFormulario() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editando = Boolean(id);

  const [conductor, setConductor] = useState(null);
  const [cargando, setCargando] = useState(editando);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!editando) return;

    let activo = true;
    obtenerConductor(id)
      .then((datos) => activo && setConductor(datos))
      .catch((e) => activo && setError(e.message))
      .finally(() => activo && setCargando(false));

    return () => {
      activo = false;
    };
  }, [id, editando]);

  async function guardar(datos) {
    if (editando) {
      await actualizarConductor(id, datos);
    } else {
      await crearConductor(datos);
    }
    navigate("/conductores");
  }

  return (
    <section className="tarjeta-formulario">
      <h1>{editando ? "Modificar conductor" : "Nuevo conductor"}</h1>

      {cargando && <p>Cargando...</p>}
      {error && <p className="error-servidor">{error}</p>}

      {!cargando && !error && (
        <FormularioConductor
          inicial={conductor ?? undefined}
          textoBoton={editando ? "Guardar cambios" : "Crear conductor"}
          alGuardar={guardar}
        />
      )}
    </section>
  );
}
