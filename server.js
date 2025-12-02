import express from "express";
import cors from "cors";
import { pool } from "./database";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend ATR funcionando 😎🔥");
});

// 🚀 Mini test para ver si la DB responde
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ ok: true, hora: result.rows[0] });
  } catch (error) {
    res.json({ ok: false, error: error.message });
  }
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log("🔥 Servidor corriendo en puerto:", PORT);
});
