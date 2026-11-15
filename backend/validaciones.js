import { body, param, query, validationResult } from "express-validator";
import passport from "passport";

// Validacion de autenticacion: verifica el token JWT con passport
// Si el token falta, es inválido o expiró, passport responde 401
export const validarAutenticacion = passport.authenticate("jwt", {
  session: false,
});

// Validacion de registro de usuario
export const validarRegistro = [
  body("nombre")
    .isAlpha("es-ES", { ignore: " " })
    .withMessage("El nombre solo puede tener letras")
    .isLength({ min: 1, max: 50 })
    .withMessage("El nombre debe tener entre 1 y 50 caracteres"),
  body("email")
    .isEmail()
    .withMessage("El email no tiene un formato válido")
    .isLength({ max: 100 })
    .withMessage("El email puede tener hasta 100 caracteres"),
  body("password")
    .isLength({ min: 6, max: 50 })
    .withMessage("La contraseña debe tener entre 6 y 50 caracteres"),
];

// Validacion de inicio de sesion
export const validarLogin = [
  body("email").isEmail().withMessage("El email no tiene un formato válido"),
  body("password")
    .isLength({ min: 1, max: 50 })
    .withMessage("La contraseña es obligatoria"),
];

export const validarId = param("id")
  .isInt({ min: 1 })
  .withMessage("El id debe ser un número entero mayor a 0");

// Validacion de filtros de vehiculos
export const validarFiltrosVehiculos = [
  query("marca")
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage("La marca debe tener entre 1 y 50 caracteres"),
  query("patente")
    .optional()
    .isAlphanumeric()
    .withMessage("La patente solo puede tener letras y números")
    .isLength({ max: 10 })
    .withMessage("La patente puede tener hasta 10 caracteres"),
];

// Validacion de vehiculo
export const validarVehiculo = [
  body("marca")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("La marca debe tener entre 1 y 50 caracteres"),
  body("modelo")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("El modelo debe tener entre 1 y 50 caracteres"),
  body("patente")
    .trim()
    .toUpperCase()
    .matches(/^[A-Z0-9]{6,7}$/)
    .withMessage("La patente debe tener 6 o 7 letras y números"),
  body("anio")
    .isInt({ min: 1950, max: new Date().getFullYear() + 1 })
    .withMessage("El año no es válido"),
  body("capacidadCarga")
    .isFloat({ gt: 0, lt: 100000000 })
    .withMessage("La capacidad de carga debe ser un número mayor a 0"),
];

// Validacion de filtros de conductores
export const validarFiltrosConductores = [
  query("apellido")
    .optional()
    .isAlpha("es-ES", { ignore: " " })
    .withMessage("El apellido solo puede tener letras")
    .isLength({ max: 50 })
    .withMessage("El apellido puede tener hasta 50 caracteres"),
];

// Validacion de conductor
export const validarConductor = [
  body("nombre")
    .isAlpha("es-ES", { ignore: " " })
    .withMessage("El nombre solo puede tener letras")
    .isLength({ min: 1, max: 50 })
    .withMessage("El nombre debe tener entre 1 y 50 caracteres"),
  body("apellido")
    .isAlpha("es-ES", { ignore: " " })
    .withMessage("El apellido solo puede tener letras")
    .isLength({ min: 1, max: 50 })
    .withMessage("El apellido debe tener entre 1 y 50 caracteres"),
  body("numeroDocumento")
    .isNumeric({ no_symbols: true })
    .withMessage("El número de documento solo puede tener números")
    .isLength({ min: 7, max: 8 })
    .withMessage("El número de documento debe tener entre 7 y 8 dígitos"),
  body("numeroLicencia")
    .isAlphanumeric()
    .withMessage("El número de licencia solo puede tener letras y números")
    .isLength({ min: 1, max: 20 })
    .withMessage("El número de licencia puede tener hasta 20 caracteres"),
  body("fechaAltaLicencia")
    .isDate({ format: "YYYY-MM-DD", strictMode: true })
    .withMessage("La fecha de alta debe tener formato AAAA-MM-DD"),
  body("fechaVencimientoLicencia")
    .isDate({ format: "YYYY-MM-DD", strictMode: true })
    .withMessage("La fecha de vencimiento debe tener formato AAAA-MM-DD")
    .bail()
    .custom((valor, { req }) => {
      if (new Date(valor) <= new Date(req.body.fechaAltaLicencia)) {
        throw new Error(
          "La fecha de vencimiento debe ser posterior a la fecha de alta",
        );
      }
      return true;
    }),
];

// Formato aceptado para fecha y hora: AAAA-MM-DDTHH:MM (o con espacio)
const FORMATO_FECHA_HORA = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2})?$/;

// Validacion de filtros de viajes
export const validarFiltrosViajes = [
  query("vehiculoId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("vehiculoId debe ser un número entero mayor a 0"),
  query("conductorId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("conductorId debe ser un número entero mayor a 0"),
];

// Validacion de viaje
export const validarViaje = [
  body("vehiculoId")
    .isInt({ min: 1 })
    .withMessage("vehiculoId debe ser un número entero mayor a 0"),
  body("conductorId")
    .isInt({ min: 1 })
    .withMessage("conductorId debe ser un número entero mayor a 0"),
  body("fechaSalida")
    .matches(FORMATO_FECHA_HORA)
    .withMessage("La fecha de salida debe tener formato AAAA-MM-DDTHH:MM")
    .bail()
    .isISO8601({ strict: true })
    .withMessage("La fecha de salida no es válida"),
  body("fechaLlegada")
    .matches(FORMATO_FECHA_HORA)
    .withMessage("La fecha de llegada debe tener formato AAAA-MM-DDTHH:MM")
    .bail()
    .isISO8601({ strict: true })
    .withMessage("La fecha de llegada no es válida")
    .bail()
    .custom((valor, { req }) => {
      const llegada = new Date(valor.replace(" ", "T"));
      const salida = new Date(String(req.body.fechaSalida).replace(" ", "T"));
      if (llegada < salida) {
        throw new Error("La fecha de llegada no puede ser anterior a la salida");
      }
      return true;
    }),
  body("origen")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("El origen debe tener entre 1 y 100 caracteres"),
  body("destino")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("El destino debe tener entre 1 y 100 caracteres"),
  body("kilometros")
    .isFloat({ gt: 0, lt: 100000000 })
    .withMessage("Los kilómetros deben ser un número mayor a 0"),
  body("observaciones")
    .optional({ values: "falsy" })
    .isLength({ max: 255 })
    .withMessage("Las observaciones pueden tener hasta 255 caracteres"),
];

// Middleware para verificar validaciones
export const verificarValidaciones = (req, res, next) => {
  const resultadoValidacion = validationResult(req);
  if (!resultadoValidacion.isEmpty()) {
    return res.status(400).json({
      mensaje: "Parámetros no válidos",
      errores: resultadoValidacion.array(),
    });
  }
  next();
};
