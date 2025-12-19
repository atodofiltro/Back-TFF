// server.js
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";

const app = express();
app.use(cors());
app.use(express.json());

// ====== DB JSON ======
const DB_PATH = path.resolve("./db.json");

function leerDB() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify([]));
  }
  return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
}

function guardarDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// ====== RUTA PRINCIPAL ======
app.get("/", (req, res) => {
  res.send("Backend ATR funcionando sin SQL 😎🔥");
});

// ====== INSERTAR CONTROL ======
app.post("/api/insertControl", (req, res) => {
  try {
    const {
      cliente,
      ruc,
      vehiculo,
      chapa,
      mecanico,
      fecha,
      factura,
      monto_total,
      monto_servicios,
      monto_items,
      diferencia,
      servicios,
      items
    } = req.body;

    if (!cliente || !vehiculo || !chapa || !fecha) {
      return res.status(400).json({
        ok: false,
        mensaje: "Faltan datos obligatorios"
      });
    }

    const db = leerDB();

    const nuevoControl = {
      id: db.length + 1,
      cliente,
      ruc,
      vehiculo,
      chapa,
      mecanico,
      fecha,
      factura,
      monto_total,
      monto_servicios,
      monto_items,
      diferencia,
      servicios: servicios || [],
      items: items || [],
      creadoEn: new Date().toISOString()
    };

    db.push(nuevoControl);
    guardarDB(db);

    console.log("✅ Control guardado ATR:", nuevoControl);

    res.json({
      ok: true,
      mensaje: "Control guardado correctamente",
      control: nuevoControl
    });
  } catch (error) {
    console.error("ERROR /api/insertControl:", error);
    res.status(500).json({ ok: false, error: "Error interno" });
  }
});

// ====== HISTORIAL ======
app.get("/api/historial", (req, res) => {
  try {
    const db = leerDB();
    res.json(db);
  } catch (error) {
    res.status(500).json({ ok: false, error: "No se pudo leer historial" });
  }
});

// ====== ELIMINAR CONTROL ======
app.delete("/api/eliminar/:id", (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const db = leerDB();
    const nuevoDB = db.filter(c => c.id !== id);
    guardarDB(nuevoDB);

    res.json({ ok: true, mensaje: "Control eliminado" });
  } catch (error) {
    res.status(500).json({ ok: false, error: "No se pudo eliminar" });
  }
});

// ====== SERVER ======
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🔥 Servidor corriendo en puerto: ${PORT}`);
});
