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
    // Inserta cliente
    const clienteResult = await pool.query(
      "INSERT INTO clientes(nombre, ruc) VALUES($1, $2) RETURNING id",
      ["Fer Test", "12345678"]
    );
    const clienteId = clienteResult.rows[0].id;

    // Inserta control
    const controlResult = await pool.query(
      `INSERT INTO controles(cliente_id, vehiculo, chapa, mecanico, fecha, factura, monto_total, monto_servicios, monto_items, diferencia)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
      [clienteId, "Toyota Corolla", "ABC123", "Juan Mecánico", new Date(), "FAC-001", 1000, 600, 400, 0]
    );
    const controlId = controlResult.rows[0].id;

    // Inserta servicios realizados
    await pool.query(
      "INSERT INTO servicios_realizados(control_id, servicio, monto) VALUES($1,$2,$3)",
      [controlId, "Cambio de aceite", 300]
    );
    await pool.query(
      "INSERT INTO servicios_realizados(control_id, servicio, monto) VALUES($1,$2,$3)",
      [controlId, "Alineación", 300]
    );

    // Inserta items utilizados
    await pool.query(
      "INSERT INTO items_utilizados(control_id, codigo, cantidad, descripcion, precio) VALUES($1,$2,$3,$4,$5)",
      [controlId, "ITM-001", 1, "Aceite 5W30", 200]
    );
    await pool.query(
      "INSERT INTO items_utilizados(control_id, codigo, cantidad, descripcion, precio) VALUES($1,$2,$3,$4,$5)",
      [controlId, "ITM-002", 2, "Filtros", 100]
    );

    res.json({ ok: true, mensaje: "Mini test insert realizado con éxito ATR!" });
  } catch (error) {
    console.error(error);
    res.json({ ok: false, error: error.message });
  }
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log("🔥 Servidor corriendo en puerto:", PORT);
});
