import { apiFetch } from "./api";

// filtros: { apellido } (los vacíos no se envían)
export function listarConductores(filtros = {}) {
  const parametros = new URLSearchParams();
  Object.entries(filtros).forEach(([clave, valor]) => {
    if (valor && valor.trim()) parametros.append(clave, valor.trim());
  });
  const consulta = parametros.toString();
  return apiFetch(`/conductores${consulta ? `?${consulta}` : ""}`);
}

export function obtenerConductor(id) {
  return apiFetch(`/conductores/${id}`);
}

export function crearConductor(conductor) {
  return apiFetch("/conductores", { metodo: "POST", cuerpo: conductor });
}

export function actualizarConductor(id, conductor) {
  return apiFetch(`/conductores/${id}`, { metodo: "PUT", cuerpo: conductor });
}

export function eliminarConductor(id) {
  return apiFetch(`/conductores/${id}`, { metodo: "DELETE" });
}
