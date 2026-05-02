import express from "express";
import path from "path";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./server/routes/authRoutes.ts";
import dashboardRoutes from "./server/routes/dashboardRoutes.ts";
import lessonRoutes from "./server/routes/lessonRoutes.ts";
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import csurf from 'csurf';
import sanitizeBody from './server/middleware/sanitize.ts';
import { authLimiter, generalLimiter } from './server/middleware/rateLimiters.ts';

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
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
  }));
  app.use(cors({ origin: process.env.FRONTEND_ORIGIN || '*' }));
  app.use(express.json({ limit: '10kb' }));
  app.use(cookieParser());

  // Sanitization middlewares
  app.use(mongoSanitize());
  app.use(xss());
  app.use(sanitizeBody);

  // Rate Limiting
  app.use('/api', generalLimiter);

  // CSRF protection for state-changing requests (uses cookie-based tokens)
  try {
    app.use(csurf({ cookie: true }));
  } catch (err) {
    console.warn('csurf middleware not available or failed to initialize');
  }

  // API Routes
  // Apply stricter rate limiting to authentication routes
  app.use("/api/auth", authLimiter, authRoutes);
  app.use("/api/dashboard", dashboardRoutes);
  app.use("/api/lessons", lessonRoutes);
  app.use("/api/skills", (await import('./server/routes/skillRoutes.ts')).default);
  app.use("/api/flash", (await import('./server/routes/flashRoutes.ts')).default);
  app.use("/api/payments", (await import('./server/routes/paymentRoutes.ts')).default);
  app.use("/api/transactions", (await import('./server/routes/transactionRoutes.ts')).default);
  app.use('/api/users', (await import('./server/routes/userRoutes.ts')).default);

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // Placeholder for Auth and other routes
  // app.use("/api/auth", authRoutes);
  // app.use("/api/users", userRoutes);
  // app.use("/api/courses", courseRoutes);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
        root: path.join(process.cwd(), 'FRONTEND')
      });
      app.use(vite.middlewares);
    } catch (err) {
      console.warn('Vite not found or failed to load. Skipping dev middleware.');
    }
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
