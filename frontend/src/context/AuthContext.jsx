import { createContext, useContext, useState } from "react";
import {
  apiFetch,
  borrarSesion,
  guardarSesion,
  obtenerSesion,
} from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(obtenerSesion);

  async function iniciarSesion(email, password) {
    const datos = await apiFetch("/auth/login", {
      metodo: "POST",
      cuerpo: { email, password },
      publica: true,
    });
    guardarSesion(datos);
    setSesion(datos);
  }

  async function registrar(nombre, email, password) {
    await apiFetch("/auth/register", {
      metodo: "POST",
      cuerpo: { nombre, email, password },
      publica: true,
    });
  }

  function cerrarSesion() {
    borrarSesion();
    setSesion(null);
  }

  return (
    <AuthContext.Provider value={{ sesion, iniciarSesion, registrar, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
