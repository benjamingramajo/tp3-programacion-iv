import express from "express";
import cors from "cors";
import { conectarDB } from "./db.js";
import authRouter, { authConfig } from "./auth.js";
import vehiculosRouter from "./vehiculos.js";
import conductoresRouter from "./conductores.js";
import viajesRouter from "./viajes.js";

conectarDB();

const app = express();
const port = 3000;

// Para interpretar body como JSON
app.use(express.json());

// Habilito CORS
app.use(cors());

// Configurar passport
authConfig();

app.get("/", (req, res) => {
  res.send("API de gestión de vehículos, conductores y viajes");
});

app.use("/auth", authRouter);

app.use("/vehiculos", vehiculosRouter);
app.use("/conductores", conductoresRouter);
app.use("/viajes", viajesRouter);

// Ruta no encontrada (404)
app.use((req, res) => {
  res.status(404).json({ mensaje: "Ruta no encontrada" });
});

// Manejo de errores inesperados (400 si el JSON es inválido, 500 en el resto)
app.use((err, req, res, next) => {
  console.error(err);
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ mensaje: "El body no es un JSON válido" });
  }
  res.status(500).json({ mensaje: "Error interno del servidor" });
});

app.listen(port, () => {
  console.log(`La aplicación está funcionando en el puerto ${port}`);
});
