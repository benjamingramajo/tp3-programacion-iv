import express from "express";
import { db } from "./db.js";
import {
  validarAutenticacion,
  validarFiltrosViajes,
  validarId,
  validarViaje,
  verificarValidaciones,
} from "./validaciones.js";

const router = express.Router();

// Las fechas se devuelven como AAAA-MM-DDTHH:MM, el formato que usa input datetime-local
const SELECT_VIAJE =
  "SELECT v.id, v.vehiculo_id AS vehiculoId, v.conductor_id AS conductorId, " +
  "ve.patente, CONCAT(ve.marca, ' ', ve.modelo) AS vehiculo, " +
  "CONCAT(c.nombre, ' ', c.apellido) AS conductor, " +
  "DATE_FORMAT(v.fecha_salida, '%Y-%m-%dT%H:%i') AS fechaSalida, " +
  "DATE_FORMAT(v.fecha_llegada, '%Y-%m-%dT%H:%i') AS fechaLlegada, " +
  "v.origen, v.destino, v.kilometros, v.observaciones " +
  "FROM viajes v " +
  "JOIN vehiculos ve ON v.vehiculo_id = ve.id " +
  "JOIN conductores c ON v.conductor_id = c.id";

// Arma el WHERE segun los filtros opcionales de vehiculo y conductor
function armarFiltros(query) {
  const filtros = [];
  const parametros = [];

  if (query.vehiculoId !== undefined) {
    filtros.push("v.vehiculo_id = ?");
    parametros.push(Number(query.vehiculoId));
  }

  if (query.conductorId !== undefined) {
    filtros.push("v.conductor_id = ?");
    parametros.push(Number(query.conductorId));
  }

  const where = filtros.length > 0 ? " WHERE " + filtros.join(" AND ") : "";

  return { where, parametros };
}

// Verifica que el vehiculo y el conductor existan. Devuelve un mensaje de error o null
async function verificarReferencias(vehiculoId, conductorId) {
  const [vehiculos] = await db.execute("SELECT id FROM vehiculos WHERE id = ?", [
    vehiculoId,
  ]);
  if (vehiculos.length === 0) {
    return "El vehículo indicado no existe";
  }

  const [conductores] = await db.execute(
    "SELECT id FROM conductores WHERE id = ?",
    [conductorId],
  );
  if (conductores.length === 0) {
    return "El conductor indicado no existe";
  }

  return null;
}

// GET para entregar el historial de viajes
// Filtros opcionales: ?vehiculoId=1 y/o ?conductorId=1
router.get(
  "/",
  validarAutenticacion,
  validarFiltrosViajes,
  verificarValidaciones,
  async (req, res) => {
    const { where, parametros } = armarFiltros(req.query);

    const [viajes] = await db.execute(
      SELECT_VIAJE + where + " ORDER BY v.fecha_salida DESC",
      parametros,
    );

    res.json(viajes);
  },
);

// GET para calcular el total de kilometros recorridos
// Filtros opcionales: ?vehiculoId=1 y/o ?conductorId=1
// Esta ruta tiene que ir antes de "/:id", si no express la tomaria como un id
router.get(
  "/total-kilometros",
  validarAutenticacion,
  validarFiltrosViajes,
  verificarValidaciones,
  async (req, res) => {
    const { where, parametros } = armarFiltros(req.query);

    const [resultado] = await db.execute(
      "SELECT COALESCE(SUM(v.kilometros), 0) AS totalKilometros, " +
        "COUNT(*) AS cantidadViajes FROM viajes v" +
        where,
      parametros,
    );

    res.json({
      totalKilometros: Number(resultado[0].totalKilometros),
      cantidadViajes: Number(resultado[0].cantidadViajes),
    });
  },
);

// GET para entregar detalle de un viaje
router.get(
  "/:id",
  validarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);

    const [viajes] = await db.execute(SELECT_VIAJE + " WHERE v.id = ?", [id]);

    if (viajes.length === 0) {
      return res.status(404).json({ mensaje: "Viaje no encontrado" });
    }

    res.json(viajes[0]);
  },
);

// POST para registrar un viaje, asociando un vehiculo y un conductor
router.post(
  "/",
  validarAutenticacion,
  validarViaje,
  verificarValidaciones,
  async (req, res) => {
    const {
      vehiculoId,
      conductorId,
      fechaSalida,
      fechaLlegada,
      origen,
      destino,
      kilometros,
      observaciones,
    } = req.body;

    const errorReferencia = await verificarReferencias(vehiculoId, conductorId);

    if (errorReferencia) {
      return res.status(400).json({ mensaje: errorReferencia });
    }

    const [result] = await db.execute(
      "INSERT INTO viajes (vehiculo_id, conductor_id, fecha_salida, fecha_llegada, origen, destino, kilometros, observaciones) VALUES (?,?,?,?,?,?,?,?)",
      [
        vehiculoId,
        conductorId,
        fechaSalida.replace("T", " "),
        fechaLlegada.replace("T", " "),
        origen,
        destino,
        kilometros,
        observaciones || null,
      ],
    );

    res.status(201).json({
      id: result.insertId,
      vehiculoId,
      conductorId,
      fechaSalida,
      fechaLlegada,
      origen,
      destino,
      kilometros,
      observaciones: observaciones || null,
    });
  },
);

// PUT para modificar un viaje
router.put(
  "/:id",
  validarAutenticacion,
  validarId,
  validarViaje,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);
    const {
      vehiculoId,
      conductorId,
      fechaSalida,
      fechaLlegada,
      origen,
      destino,
      kilometros,
      observaciones,
    } = req.body;

    const [viajes] = await db.execute("SELECT id FROM viajes WHERE id = ?", [
      id,
    ]);

    if (viajes.length === 0) {
      return res.status(404).json({ mensaje: "Viaje no encontrado" });
    }

    const errorReferencia = await verificarReferencias(vehiculoId, conductorId);

    if (errorReferencia) {
      return res.status(400).json({ mensaje: errorReferencia });
    }

    await db.execute(
      "UPDATE viajes SET vehiculo_id=?, conductor_id=?, fecha_salida=?, fecha_llegada=?, origen=?, destino=?, kilometros=?, observaciones=? WHERE id=?",
      [
        vehiculoId,
        conductorId,
        fechaSalida.replace("T", " "),
        fechaLlegada.replace("T", " "),
        origen,
        destino,
        kilometros,
        observaciones || null,
        id,
      ],
    );

    res.json({
      id,
      vehiculoId,
      conductorId,
      fechaSalida,
      fechaLlegada,
      origen,
      destino,
      kilometros,
      observaciones: observaciones || null,
    });
  },
);

// DELETE para eliminar un viaje
router.delete(
  "/:id",
  validarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);

    const [viajes] = await db.execute("SELECT id FROM viajes WHERE id = ?", [
      id,
    ]);

    if (viajes.length === 0) {
      return res.status(404).json({ mensaje: "Viaje no encontrado" });
    }

    await db.execute("DELETE FROM viajes WHERE id = ?", [id]);

    res.json({ mensaje: "Viaje eliminado" });
  },
);

export default router;
