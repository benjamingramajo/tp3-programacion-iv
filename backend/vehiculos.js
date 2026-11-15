import express from "express";
import { db } from "./db.js";
import {
  validarAutenticacion,
  validarFiltrosVehiculos,
  validarId,
  validarVehiculo,
  verificarValidaciones,
} from "./validaciones.js";

const router = express.Router();

const SELECT_VEHICULO =
  "SELECT id, marca, modelo, patente, anio, capacidad_carga AS capacidadCarga " +
  "FROM vehiculos";

// GET para entregar listado de vehiculos (con filtros opcionales)
router.get(
  "/",
  validarAutenticacion,
  validarFiltrosVehiculos,
  verificarValidaciones,
  async (req, res) => {
    const filtros = [];
    const parametros = [];

    const { marca, patente } = req.query;

    if (marca) {
      filtros.push("marca LIKE ?");
      parametros.push(`%${marca}%`);
    }

    if (patente) {
      filtros.push("patente LIKE ?");
      parametros.push(`%${patente.toUpperCase()}%`);
    }

    let sql = SELECT_VEHICULO;

    if (filtros.length > 0) {
      sql += " WHERE " + filtros.join(" AND ");
    }

    sql += " ORDER BY id";

    const [vehiculos] = await db.execute(sql, parametros);
    res.json(vehiculos);
  },
);

// GET para entregar detalle de un vehiculo
router.get(
  "/:id",
  validarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);

    const [vehiculos] = await db.execute(SELECT_VEHICULO + " WHERE id = ?", [
      id,
    ]);

    if (vehiculos.length === 0) {
      return res.status(404).json({ mensaje: "Vehículo no encontrado" });
    }

    res.json(vehiculos[0]);
  },
);

// POST para crear un vehiculo
router.post(
  "/",
  validarAutenticacion,
  validarVehiculo,
  verificarValidaciones,
  async (req, res) => {
    const { marca, modelo, patente, anio, capacidadCarga } = req.body;

    // La patente no se puede repetir
    const [existentes] = await db.execute(
      "SELECT id FROM vehiculos WHERE patente = ?",
      [patente],
    );

    if (existentes.length > 0) {
      return res
        .status(400)
        .json({ mensaje: "Ya existe un vehículo con esa patente" });
    }

    const [result] = await db.execute(
      "INSERT INTO vehiculos (marca, modelo, patente, anio, capacidad_carga) VALUES (?,?,?,?,?)",
      [marca, modelo, patente, anio, capacidadCarga],
    );

    res
      .status(201)
      .json({ id: result.insertId, marca, modelo, patente, anio, capacidadCarga });
  },
);

// PUT para modificar un vehiculo
router.put(
  "/:id",
  validarAutenticacion,
  validarId,
  validarVehiculo,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);
    const { marca, modelo, patente, anio, capacidadCarga } = req.body;

    const [vehiculos] = await db.execute(
      "SELECT id FROM vehiculos WHERE id = ?",
      [id],
    );

    if (vehiculos.length === 0) {
      return res.status(404).json({ mensaje: "Vehículo no encontrado" });
    }

    // La patente no puede pertenecer a otro vehiculo
    const [duplicados] = await db.execute(
      "SELECT id FROM vehiculos WHERE patente = ? AND id <> ?",
      [patente, id],
    );

    if (duplicados.length > 0) {
      return res
        .status(400)
        .json({ mensaje: "Ya existe otro vehículo con esa patente" });
    }

    await db.execute(
      "UPDATE vehiculos SET marca=?, modelo=?, patente=?, anio=?, capacidad_carga=? WHERE id=?",
      [marca, modelo, patente, anio, capacidadCarga, id],
    );

    res.json({ id, marca, modelo, patente, anio, capacidadCarga });
  },
);

// DELETE para eliminar un vehiculo
router.delete(
  "/:id",
  validarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);

    const [vehiculos] = await db.execute(
      "SELECT id FROM vehiculos WHERE id = ?",
      [id],
    );

    if (vehiculos.length === 0) {
      return res.status(404).json({ mensaje: "Vehículo no encontrado" });
    }

    // No se permite eliminar un vehiculo que tiene viajes registrados
    const [viajes] = await db.execute(
      "SELECT id FROM viajes WHERE vehiculo_id = ? LIMIT 1",
      [id],
    );

    if (viajes.length > 0) {
      return res.status(403).json({
        mensaje: "No se puede eliminar un vehículo con viajes registrados",
      });
    }

    await db.execute("DELETE FROM vehiculos WHERE id = ?", [id]);

    res.json({ mensaje: "Vehículo eliminado" });
  },
);

export default router;
