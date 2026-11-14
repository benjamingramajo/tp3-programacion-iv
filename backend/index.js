import express from "express";
import cors from "cors";
import { conectarDB } from "./db.js";

conectarDB();

const app = express();
const port = 3000;

// Para interpretar body como JSON
app.use(express.json());

// Habilito CORS
app.use(cors());

app.get("/", (req, res) => {
  res.send("API de gestión de vehículos, conductores y viajes");
});

// Acá se van a ir agregando los routers: auth, vehiculos, conductores y viajes

app.listen(port, () => {
  console.log(`La aplicación está funcionando en el puerto ${port}`);
});
