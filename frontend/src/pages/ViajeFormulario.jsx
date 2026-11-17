import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import FormularioViaje from "../components/FormularioViaje";
import { listarConductores } from "../services/conductores";
import { listarVehiculos } from "../services/vehiculos";
import { actualizarViaje, crearViaje, obtenerViaje } from "../services/viajes";

// Sirve para el alta (/viajes/nuevo) y la modificación (/viajes/:id/editar)
export default function ViajeFormulario() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editando = Boolean(id);

  const [vehiculos, setVehiculos] = useState([]);
  const [conductores, setConductores] = useState([]);
  const [viaje, setViaje] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;

    Promise.all([
      listarVehiculos(),
      listarConductores(),
      editando ? obtenerViaje(id) : Promise.resolve(null),
    ])
      .then(([listaVehiculos, listaConductores, datosViaje]) => {
        if (!activo) return;
        setVehiculos(listaVehiculos);
        setConductores(listaConductores);
        setViaje(datosViaje);
      })
      .catch((e) => activo && setError(e.message))
      .finally(() => activo && setCargando(false));

    return () => {
      activo = false;
    };
  }, [id, editando]);

  async function guardar(datos) {
    if (editando) {
      await actualizarViaje(id, datos);
    } else {
      await crearViaje(datos);
    }
    navigate("/viajes");
  }

  const faltanDatos = !cargando && !error && (vehiculos.length === 0 || conductores.length === 0);

  return (
    <section className="tarjeta-formulario">
      <h1>{editando ? "Modificar viaje" : "Nuevo viaje"}</h1>

      {cargando && <p>Cargando...</p>}
      {error && <p className="error-servidor">{error}</p>}

      {faltanDatos && (
        <p className="vacio">
          Para registrar un viaje necesitás al menos un <Link to="/vehiculos/nuevo">vehículo</Link>{" "}
          y un <Link to="/conductores/nuevo">conductor</Link>.
        </p>
      )}

      {!cargando && !error && !faltanDatos && (
        <FormularioViaje
          vehiculos={vehiculos}
          conductores={conductores}
          inicial={viaje ?? undefined}
          textoBoton={editando ? "Guardar cambios" : "Registrar viaje"}
          alGuardar={guardar}
        />
      )}
    </section>
  );
}
