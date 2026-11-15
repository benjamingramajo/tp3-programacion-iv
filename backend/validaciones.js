import { body, validationResult } from "express-validator";
import passport from "passport";

// Validacion de autenticacion: verifica el token JWT con passport
// Si el token falta, es inválido o expiró
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

// Verificar validaciones
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
