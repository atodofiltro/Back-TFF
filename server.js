// server.js
import express from "express";
import cors from "cors";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

// Configuración de la conexión a PostgreSQL en Railway
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // importante para Railway
});

pool.connect()
  .then(() => console.log("✅ Conexión exitosa a la base de datos ATR!"))
  .catch(err => console.error("❌ Error de conexión a la base de datos:", err));

const app = express();

app.use(cors());
app.use(express.json());

// Ruta principal
app.get("/", (req, res) => {
  res.send("Backend ATR funcionando 😎🔥");
});

// 🚀 Endpoint de prueba de DB
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ ok: true, hora: result.rows[0] });
  } catch (error) {
    res.json({ ok: false, error: error.message });
  }
});

// 🚀 Endpoint miniTest que inserta un cliente, control, servicios e items
app.get("/api/miniTest", async (req, res) => {
  try {
    const result = await pool.query("INSERT INTO clientes(nombre, ruc) VALUES($1, $2) RETURNING *", ["Fer Test", "123456"]);
    res.json({ ok: true, mensaje: "Mini test insert realizado con éxito ATR!", datos: result.rows });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log("🔥 Servidor corriendo en puerto:", PORT);
});
