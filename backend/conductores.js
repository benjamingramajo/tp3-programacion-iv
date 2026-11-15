import express from "express";
import { db } from "./db.js";
import {
  validarAutenticacion,
  validarConductor,
  validarFiltrosConductores,
  validarId,
  verificarValidaciones,
} from "./validaciones.js";

const router = express.Router();

// Las fechas se devuelven como texto AAAA-MM-DD para que el frontend las use directo
const SELECT_CONDUCTOR =
  "SELECT id, nombre, apellido, " +
  "numero_documento AS numeroDocumento, " +
  "numero_licencia AS numeroLicencia, " +
  "DATE_FORMAT(fecha_alta_licencia, '%Y-%m-%d') AS fechaAltaLicencia, " +
  "DATE_FORMAT(fecha_vencimiento_licencia, '%Y-%m-%d') AS fechaVencimientoLicencia " +
  "FROM conductores";

// GET para entregar listado de conductores (con filtro opcional por apellido)
router.get(
  "/",
  validarAutenticacion,
  validarFiltrosConductores,
  verificarValidaciones,
  async (req, res) => {
    let sql = SELECT_CONDUCTOR;
    const parametros = [];

    const { apellido } = req.query;

    if (apellido) {
      sql += " WHERE apellido LIKE ?";
      parametros.push(`%${apellido}%`);
    }

    sql += " ORDER BY apellido, nombre";

    const [conductores] = await db.execute(sql, parametros);
    res.json(conductores);
  },
);

// GET para entregar detalle de un conductor
router.get(
  "/:id",
  validarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);

    const [conductores] = await db.execute(SELECT_CONDUCTOR + " WHERE id = ?", [
      id,
    ]);

    if (conductores.length === 0) {
      return res.status(404).json({ mensaje: "Conductor no encontrado" });
    }

    res.json(conductores[0]);
  },
);

// POST para crear un conductor
router.post(
  "/",
  validarAutenticacion,
  validarConductor,
  verificarValidaciones,
  async (req, res) => {
    const {
      nombre,
      apellido,
      numeroDocumento,
      numeroLicencia,
      fechaAltaLicencia,
      fechaVencimientoLicencia,
    } = req.body;

    // El documento y la licencia no se pueden repetir
    const [existentes] = await db.execute(
      "SELECT id FROM conductores WHERE numero_documento = ? OR numero_licencia = ?",
      [numeroDocumento, numeroLicencia],
    );

    if (existentes.length > 0) {
      return res.status(400).json({
        mensaje: "Ya existe un conductor con ese documento o esa licencia",
      });
    }

    const [result] = await db.execute(
      "INSERT INTO conductores (nombre, apellido, numero_documento, numero_licencia, fecha_alta_licencia, fecha_vencimiento_licencia) VALUES (?,?,?,?,?,?)",
      [
        nombre,
        apellido,
        numeroDocumento,
        numeroLicencia,
        fechaAltaLicencia,
        fechaVencimientoLicencia,
      ],
    );

    res.status(201).json({
      id: result.insertId,
      nombre,
      apellido,
      numeroDocumento,
      numeroLicencia,
      fechaAltaLicencia,
      fechaVencimientoLicencia,
    });
  },
);

// PUT para modificar un conductor
router.put(
  "/:id",
  validarAutenticacion,
  validarId,
  validarConductor,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);
    const {
      nombre,
      apellido,
      numeroDocumento,
      numeroLicencia,
      fechaAltaLicencia,
      fechaVencimientoLicencia,
    } = req.body;

    const [conductores] = await db.execute(
      "SELECT id FROM conductores WHERE id = ?",
      [id],
    );

    if (conductores.length === 0) {
      return res.status(404).json({ mensaje: "Conductor no encontrado" });
    }

    // El documento y la licencia no pueden pertenecer a otro conductor
    const [duplicados] = await db.execute(
      "SELECT id FROM conductores WHERE (numero_documento = ? OR numero_licencia = ?) AND id <> ?",
      [numeroDocumento, numeroLicencia, id],
    );

    if (duplicados.length > 0) {
      return res.status(400).json({
        mensaje: "Ya existe otro conductor con ese documento o esa licencia",
      });
    }

    await db.execute(
      "UPDATE conductores SET nombre=?, apellido=?, numero_documento=?, numero_licencia=?, fecha_alta_licencia=?, fecha_vencimiento_licencia=? WHERE id=?",
      [
        nombre,
        apellido,
        numeroDocumento,
        numeroLicencia,
        fechaAltaLicencia,
        fechaVencimientoLicencia,
        id,
      ],
    );

    res.json({
      id,
      nombre,
      apellido,
      numeroDocumento,
      numeroLicencia,
      fechaAltaLicencia,
      fechaVencimientoLicencia,
    });
  },
);

// DELETE para eliminar un conductor
router.delete(
  "/:id",
  validarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);

    const [conductores] = await db.execute(
      "SELECT id FROM conductores WHERE id = ?",
      [id],
    );

    if (conductores.length === 0) {
      return res.status(404).json({ mensaje: "Conductor no encontrado" });
    }

    // No se permite eliminar un conductor que tiene viajes registrados
    const [viajes] = await db.execute(
      "SELECT id FROM viajes WHERE conductor_id = ? LIMIT 1",
      [id],
    );

    if (viajes.length > 0) {
      return res.status(403).json({
        mensaje: "No se puede eliminar un conductor con viajes registrados",
      });
    }

    await db.execute("DELETE FROM conductores WHERE id = ?", [id]);

    res.json({ mensaje: "Conductor eliminado" });
  },
);

export default router;
