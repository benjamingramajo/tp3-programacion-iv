import express from "express";
import cors from "cors";
import { conectarDB } from "./db.js";
import authRouter, { authConfig } from "./auth.js";

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

// Acá se van a ir agregando los routers: vehiculos, conductores y viajes

app.listen(port, () => {
  console.log(`La aplicación está funcionando en el puerto ${port}`);
});
