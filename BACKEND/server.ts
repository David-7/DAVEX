import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./server/routes/authRoutes.ts";
import dashboardRoutes from "./server/routes/dashboardRoutes.ts";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://davex-db:DavexDbpassWord.com%237@davex.igh0zu5.mongodb.net/?appName=DAVEX";
const PORT = 3000;

async function startServer() {
  const app = express();
  app.set('trust proxy', 1);

  // Connect to MongoDB
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB Atlas");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }

  // Security Middlewares
  app.use(helmet({
    contentSecurityPolicy: false, // Vite needs this disabled for dev
  }));
  app.use(cors());
  app.use(express.json());
  app.use(cookieParser());

  // Rate Limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests from this IP, please try again later."
  });
  app.use("/api", limiter);

  // API Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/dashboard", dashboardRoutes);

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // Placeholder for Auth and other routes
  // app.use("/api/auth", authRoutes);
  // app.use("/api/users", userRoutes);
  // app.use("/api/courses", courseRoutes);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
      root: path.join(process.cwd(), 'FRONTEND')
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
