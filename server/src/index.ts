import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import products from "./routes/products";
import users from "./routes/users";
import orders from "./routes/orders";
import shipments from "./routes/shipments";

dotenv.config();

const app = express();

// CORS: izinkan akses dari mana saja (untuk publik)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));

app.use("/api/products", products);
app.use("/api/users", users);
app.use("/api/orders", orders);
app.use("/api/shipments", shipments);

app.get("/api/health", (req, res) => res.json({ ok: true, database: "neon_cloud", time: new Date().toISOString() }));

const port = Number(process.env.PORT || 4000);

// Bind ke 0.0.0.0 agar bisa diakses dari luar (ngrok, publik)
app.listen(port, '0.0.0.0', () => {
  console.log(`Panenku server listening on http://0.0.0.0:${port}`);
  console.log(`Local: http://localhost:${port}`);
});
