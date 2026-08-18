import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import path from "path";
import { createServer as createViteServer } from "vite";
import { handleAssistant, handleInsights } from "./src/server/ai";

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

app.use(cors({
  origin: process.env.NODE_ENV === "production"
    ? ["https://finanza-gestao-financeira-pessoal.vercel.app"]
    : [CLIENT_URL, "http://localhost:3000"],
  methods: ["POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json({ limit: "50kb" }));

// Rate limiting for AI endpoints
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Muitas solicitações. Aguarde um minuto." },
});

// Auth middleware — verifies Supabase JWT
function requireAuth(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Autenticação necessária." });
  }
  const token = authHeader.replace("Bearer ", "");
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64url").toString()
    );
    if (!payload.sub || payload.exp * 1000 < Date.now()) {
      return res.status(401).json({ error: "Token inválido ou expirado." });
    }
    req.userId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido." });
  }
}

// AI Financial Assistant Endpoint
app.post("/api/ai/assistant", aiLimiter, requireAuth, handleAssistant);

// Auto-Analysis Insights Endpoint
app.post("/api/ai/insights", aiLimiter, requireAuth, handleInsights);

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
