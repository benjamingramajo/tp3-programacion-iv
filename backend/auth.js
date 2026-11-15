import express from "express";
import { db } from "./db.js";
import {
  validarAutenticacion,
  validarLogin,
  validarRegistro,
  verificarValidaciones,
} from "./validaciones.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import passport from "passport";
import { Strategy, ExtractJwt } from "passport-jwt";

const router = express.Router();

export function authConfig() {
  const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
  };

  passport.use(
    new Strategy(jwtOptions, async (payload, next) => {
      next(null, payload);
    }),
  );
}

// POST para registrar un usuario
router.post(
  "/register",
  validarRegistro,
  verificarValidaciones,
  async (req, res) => {
    const { nombre, email, password } = req.body;

    // Verificar que el email no este registrado
    const [existentes] = await db.execute(
      "SELECT id FROM usuarios WHERE email=?",
      [email],
    );

    if (existentes.length > 0) {
      return res.status(400).json({ mensaje: "El email ya está registrado" });
    }

    // Encriptar la contraseña antes de guardarla
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.execute(
      "INSERT INTO usuarios (nombre, email, password) VALUES (?,?,?)",
      [nombre, email, hashedPassword],
    );

    res.status(201).json({ id: result.insertId, nombre, email });
  },
);

// POST para iniciar sesion
router.post("/login", validarLogin, verificarValidaciones, async (req, res) => {
  const { email, password } = req.body;

  // Consultar por el usuario a la base de datos
  const [usuarios] = await db.execute("SELECT * FROM usuarios WHERE email=?", [
    email,
  ]);

  if (usuarios.length === 0) {
    return res.status(401).json({ mensaje: "Credenciales inválidas" });
  }

  const passwordComparada = await bcrypt.compare(
    password,
    usuarios[0].password,
  );

  if (!passwordComparada) {
    return res.status(401).json({ mensaje: "Credenciales inválidas" });
  }

  // Generar jwt que expira a las 4 horas
  const payload = { userId: usuarios[0].id };
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "4h",
  });

  // Devolver token y datos basicos del usuario
  res.json({
    token,
    nombre: usuarios[0].nombre,
    email: usuarios[0].email,
  });
});

// GET protegido para comprobar que el token funciona
router.get("/perfil", validarAutenticacion, (req, res) => {
  res.json({ userId: req.user.userId });
});

export default router;
