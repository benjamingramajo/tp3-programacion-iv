import { apiFetch } from "./api";

// filtros: { vehiculoId, conductorId } (los vacíos no se envían)
function armarConsulta(filtros) {
  const parametros = new URLSearchParams();
  Object.entries(filtros).forEach(([clave, valor]) => {
    if (valor) parametros.append(clave, valor);
  });
  const consulta = parametros.toString();
  return consulta ? `?${consulta}` : "";
}

export function listarViajes(filtros = {}) {
  return apiFetch(`/viajes${armarConsulta(filtros)}`);
}

// Devuelve { totalKilometros, cantidadViajes }
export function obtenerTotalKilometros(filtros = {}) {
  return apiFetch(`/viajes/total-kilometros${armarConsulta(filtros)}`);
}

export function obtenerViaje(id) {
  return apiFetch(`/viajes/${id}`);
}

export function crearViaje(viaje) {
  return apiFetch("/viajes", { metodo: "POST", cuerpo: viaje });
}

export function actualizarViaje(id, viaje) {
  return apiFetch(`/viajes/${id}`, { metodo: "PUT", cuerpo: viaje });
}

export function eliminarViaje(id) {
  return apiFetch(`/viajes/${id}`, { metodo: "DELETE" });
}
