"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const products_1 = __importDefault(require("./routes/products"));
const users_1 = __importDefault(require("./routes/users"));
const orders_1 = __importDefault(require("./routes/orders"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/api/products", products_1.default);
app.use("/api/users", users_1.default);
app.use("/api/orders", orders_1.default);
app.get("/api/health", (req, res) => res.json({ ok: true }));
const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
    console.log(`Panenku server listening on http://localhost:${port}`);
});
