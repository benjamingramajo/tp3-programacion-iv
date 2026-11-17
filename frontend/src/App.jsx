import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import RutaProtegida from "./components/RutaProtegida";
import Inicio from "./pages/Inicio";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import Panel from "./pages/Panel";
import Vehiculos from "./pages/Vehiculos";
import VehiculoFormulario from "./pages/VehiculoFormulario";
import Conductores from "./pages/Conductores";
import ConductorFormulario from "./pages/ConductorFormulario";
import Viajes from "./pages/Viajes";
import ViajeFormulario from "./pages/ViajeFormulario";

export default function App() {
  return (
    <>
      <Navbar />
      <main className="contenido">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route
            path="/panel"
            element={
              <RutaProtegida>
                <Panel />
              </RutaProtegida>
            }
          />
          <Route
            path="/vehiculos"
            element={
              <RutaProtegida>
                <Vehiculos />
              </RutaProtegida>
            }
          />
          <Route
            path="/vehiculos/nuevo"
            element={
              <RutaProtegida>
                <VehiculoFormulario />
              </RutaProtegida>
            }
          />
          <Route
            path="/vehiculos/:id/editar"
            element={
              <RutaProtegida>
                <VehiculoFormulario />
              </RutaProtegida>
            }
          />
          <Route
            path="/conductores"
            element={
              <RutaProtegida>
                <Conductores />
              </RutaProtegida>
            }
          />
          <Route
            path="/conductores/nuevo"
            element={
              <RutaProtegida>
                <ConductorFormulario />
              </RutaProtegida>
            }
          />
          <Route
            path="/conductores/:id/editar"
            element={
              <RutaProtegida>
                <ConductorFormulario />
              </RutaProtegida>
            }
          />
          <Route
            path="/viajes"
            element={
              <RutaProtegida>
                <Viajes />
              </RutaProtegida>
            }
          />
          <Route
            path="/viajes/nuevo"
            element={
              <RutaProtegida>
                <ViajeFormulario />
              </RutaProtegida>
            }
          />
          <Route
            path="/viajes/:id/editar"
            element={
              <RutaProtegida>
                <ViajeFormulario />
              </RutaProtegida>
            }
          />
          <Route path="*" element={<p>Página no encontrada</p>} />
        </Routes>
      </main>
    </>
  );
}
