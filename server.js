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

// Endpoint de prueba de DB
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ ok: true, hora: result.rows[0] });
  } catch (error) {
    res.json({ ok: false, error: error.message });
  }
});

// Mini test: inserta cliente, control, servicios e items
app.get("/api/miniTest", async (req, res) => {
  try {
    // Insertar cliente
    const clienteRes = await pool.query(
      "INSERT INTO clientes(nombre, ruc) VALUES($1, $2) RETURNING *",
      ["Fer Test", "123456"]
    );
    const cliente = clienteRes.rows[0];

    // Insertar control
    const controlRes = await pool.query(
      `INSERT INTO controles(
        cliente_id, vehiculo, chapa, mecanico, fecha, factura,
        monto_total, monto_servicios, monto_items, diferencia
      ) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [cliente.id, "Ford Fiesta", "ABC123", "Mecánico ATR", new Date(), "FAC001", 500, 300, 200, 0]
    );
    const control = controlRes.rows[0];

    // Insertar servicios realizados
    const servicios = [
      { servicio: "Cambio de aceite", monto: 100 },
      { servicio: "Alineación", monto: 200 }
    ];
    for (let s of servicios) {
      await pool.query(
        "INSERT INTO servicios_realizados(control_id, servicio, monto) VALUES($1,$2,$3)",
        [control.id, s.servicio, s.monto]
      );
    }

    // Insertar items utilizados
    const items = [
      { codigo: "IT001", cantidad: 1, descripcion: "Filtro aceite", precio: 50 },
      { codigo: "IT002", cantidad: 2, descripcion: "Bujías", precio: 75 }
    ];
    for (let i of items) {
      await pool.query(
        "INSERT INTO items_utilizados(control_id, codigo, cantidad, descripcion, precio) VALUES($1,$2,$3,$4,$5)",
        [control.id, i.codigo, i.cantidad, i.descripcion, i.precio]
      );
    }

    res.json({ ok: true, mensaje: "Mini test insert completo ATR!", cliente, control });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

// Obtener todos los clientes
app.get("/api/clientes", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM clientes ORDER BY id ASC");
    res.json({ ok: true, datos: result.rows });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

// Insertar un control completo desde frontend
app.post("/api/insertControl", async (req, res) => {
  try {
    console.log("Datos recibidos:", req.body); // <--- log temporal
    const { cliente_id, vehiculo, chapa, mecanico, fecha, factura, monto_total, monto_servicios, monto_items, diferencia, servicios, items } = req.body;

    const controlRes = await pool.query(
      `INSERT INTO controles(cliente_id, vehiculo, chapa, mecanico, fecha, factura, monto_total, monto_servicios, monto_items, diferencia)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [cliente_id, vehiculo, chapa, mecanico, fecha, factura, monto_total, monto_servicios, monto_items, diferencia]
    );
    const control = controlRes.rows[0];

    for (let s of servicios) {
      await pool.query(
        "INSERT INTO servicios_realizados(control_id, servicio, monto) VALUES($1,$2,$3)",
        [control.id, s.servicio, s.monto]
      );
    }

    for (let i of items) {
      await pool.query(
        "INSERT INTO items_utilizados(control_id, codigo, cantidad, descripcion, precio) VALUES($1,$2,$3,$4,$5)",
        [control.id, i.codigo, i.cantidad, i.descripcion, i.precio]
      );
    }

    res.json({ ok: true, mensaje: "Control completo insertado ATR!", control });
  } catch (error) {
    console.error("ERROR EN /api/insertControl:", error); // <--- log para el error
    res.status(500).json({ ok: false, error: error.message });
  }
});


// Obtener historial (igual que controles) -> Opción B
app.get("/api/historial", async (req, res) => {
  try {
    const controlesRes = await pool.query("SELECT * FROM controles ORDER BY id ASC");
    const historial = [];

    for (let c of controlesRes.rows) {
      const serviciosRes = await pool.query(
        "SELECT * FROM servicios_realizados WHERE control_id=$1",
        [c.id]
      );
      const itemsRes = await pool.query(
        "SELECT * FROM items_utilizados WHERE control_id=$1",
        [c.id]
      );
      historial.push({
        ...c,
        serviciosRealizados: serviciosRes.rows,
        items: itemsRes.rows,
      });
    }

    res.json(historial); // devuelve un array para frontend
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🔥 Servidor corriendo en puerto: ${PORT}`));

