const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

// ---- Sesión (token + datos básicos) guardada en localStorage ----

// Lee el payload del JWT para saber si ya venció (el backend lo emite con 4h)
function tokenVigente(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export function obtenerSesion() {
  try {
    const sesion = JSON.parse(localStorage.getItem("sesion"));
    if (sesion && tokenVigente(sesion.token)) return sesion;
  } catch {
    // sesión corrupta: se descarta abajo
  }
  localStorage.removeItem("sesion");
  return null;
}

export function guardarSesion(sesion) {
  localStorage.setItem("sesion", JSON.stringify(sesion));
}

export function borrarSesion() {
  localStorage.removeItem("sesion");
}

// ---- Mensajes de error del backend ----

// El backend responde { mensaje } o { errores: [{ msg }] } o { errors: [{ msg }] }
function extraerMensaje(datos) {
  if (Array.isArray(datos?.errores)) {
    return datos.errores.map((e) => e.msg ?? e.mensaje ?? e).join(". ");
  }
  if (Array.isArray(datos?.errors)) {
    return datos.errors.map((e) => e.msg ?? e.mensaje ?? e).join(". ");
  }
  return datos?.mensaje ?? "Ocurrió un error inesperado";
}

// ---- fetch con token ----
// publica: true para rutas sin autenticación (login y registro)
export async function apiFetch(
  ruta,
  { metodo = "GET", cuerpo, publica = false } = {},
) {
  const headers = { "Content-Type": "application/json" };
  const sesion = obtenerSesion();

  if (!publica && sesion) {
    headers.Authorization = `Bearer ${sesion.token}`;
  }

  let respuesta;
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      method: metodo,
      headers,
      body: cuerpo ? JSON.stringify(cuerpo) : undefined,
    });
  } catch {
    throw new Error("No se pudo conectar con el servidor");
  }

  let datos = null;
  try {
    datos = await respuesta.json();
  } catch {
    // respuesta sin body
  }

  if (!respuesta.ok) {
    // Token vencido o inválido en una ruta protegida: volver al login
    if (respuesta.status === 401 && !publica) {
      borrarSesion();
      window.location.href = "/login";
    }
    throw new Error(extraerMensaje(datos));
  }

  return datos;
}
