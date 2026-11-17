// El backend puede devolver las fechas como "AAAA-MM-DD" o como ISO completo;
// en los dos casos los primeros 10 caracteres son la fecha.

// "2026-03-15" -> "15/03/2026"
export function formatearFecha(valor) {
  if (!valor) return "";
  const [anio, mes, dia] = String(valor).slice(0, 10).split("-");
  return `${dia}/${mes}/${anio}`;
}

// Valor listo para un <input type="date">
export function fechaParaInput(valor) {
  return valor ? String(valor).slice(0, 10) : "";
}

// "2026-03-15T08:30" -> "15/03/2026 08:30"
export function formatearFechaHora(valor) {
  if (!valor) return "";
  const texto = String(valor);
  return `${formatearFecha(texto)} ${texto.slice(11, 16)}`;
}
