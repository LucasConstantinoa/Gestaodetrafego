import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

import leadsApi from "./api/leads.js";
import clientsApi from "./api/clients.js";
import loginApi from "./api/login.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Registrar rotas da API manualmente para o ambiente de desenvolvimento
  app.all("/api/login", (req, res) => loginApi(req as any, res as any));
  
  app.all("/api/leads", (req, res) => leadsApi(req as any, res as any));
  app.all("/api/leads/:id", (req, res) => {
    req.query.id = req.params.id;
    leadsApi(req as any, res as any);
  });
  
  app.all("/api/clients", (req, res) => clientsApi(req as any, res as any));
  app.all("/api/clients/:id", (req, res) => {
    req.query.id = req.params.id;
    clientsApi(req as any, res as any);
  });

  // Middleware do Vite para desenvolvimento
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor Express rodando em http://localhost:${PORT}`);
  });
}

startServer();
