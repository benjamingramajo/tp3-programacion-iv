import { apiFetch } from "./api";

// filtros: { marca, patente } (los vacíos no se envían)
export function listarVehiculos(filtros = {}) {
  const parametros = new URLSearchParams();
  Object.entries(filtros).forEach(([clave, valor]) => {
    if (valor && valor.trim()) parametros.append(clave, valor.trim());
  });
  const consulta = parametros.toString();
  return apiFetch(`/vehiculos${consulta ? `?${consulta}` : ""}`);
}

export function obtenerVehiculo(id) {
  return apiFetch(`/vehiculos/${id}`);
}

export function crearVehiculo(vehiculo) {
  return apiFetch("/vehiculos", { metodo: "POST", cuerpo: vehiculo });
}

export function actualizarVehiculo(id, vehiculo) {
  return apiFetch(`/vehiculos/${id}`, { metodo: "PUT", cuerpo: vehiculo });
}

export function eliminarVehiculo(id) {
  return apiFetch(`/vehiculos/${id}`, { metodo: "DELETE" });
}
