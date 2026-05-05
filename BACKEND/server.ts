import express from "express";
import path from "path";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import helmet from "helmet";
// rateLimit is configured in middleware; avoid unused import here
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from 'http';
import { Server as IOServer } from 'socket.io';
import authRoutes from "./server/routes/authRoutes.js";
import dashboardRoutes from "./server/routes/dashboardRoutes.js";
import lessonRoutes from "./server/routes/lessonRoutes.js";
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import csurf from 'csurf';
import sanitizeBody from './server/middleware/sanitize.js';
import { authLimiter, generalLimiter } from './server/middleware/rateLimiters.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || '';
if (!MONGODB_URI) {
  console.error('MONGODB_URI is not set in environment. Set MONGODB_URI in .env or environment variables.');
  process.exit(1);
}
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

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
  // Allow multiple frontend origins (comma-separated in env) for dev and prod.
  const FRONTEND_ORIGINS_RAW = process.env.FRONTEND_ORIGINS || process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
  const allowedOrigins = FRONTEND_ORIGINS_RAW.split(',').map(s => s.trim()).filter(Boolean);
  console.log('Allowed frontend origins:', allowedOrigins.join(', '));
  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no Origin (curl, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // Do not throw an error here; pass `false` so CORS middleware simply doesn't set CORS headers.
      console.warn(`Blocked CORS request from origin: ${origin}. Allowed: ${allowedOrigins.join(',')}`);
      return callback(null, false);
    },
    credentials: true,
    optionsSuccessStatus: 204
  }));
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
    app.use(csurf({
      cookie: {
        httpOnly: true,
        sameSite: 'none',
        secure: process.env.NODE_ENV === 'production'
      }
    }));
  } catch (err) {
    console.warn('csurf middleware not available or failed to initialize');
  }

  // API Routes
  // Apply stricter rate limiting to authentication routes
  app.use("/api/auth", authLimiter, authRoutes);
  app.use("/api/dashboard", dashboardRoutes);
  app.use("/api/lessons", lessonRoutes);
  app.use('/api/chat', (await import('./server/routes/chatRoutes.js')).default);
  app.use("/api/skills", (await import('./server/routes/skillRoutes.js')).default);
  app.use("/api/flash", (await import('./server/routes/flashRoutes.js')).default);
  app.use("/api/payments", (await import('./server/routes/paymentRoutes.js')).default);
  app.use("/api/transactions", (await import('./server/routes/transactionRoutes.js')).default);
  app.use('/api/users', (await import('./server/routes/userRoutes.js')).default);

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

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  // Attach Socket.IO
  try {
    const io = new IOServer(server, {
      cors: { origin: allowedOrigins, credentials: true }
    });
    app.set('io', io);
    io.on('connection', (socket) => {
      console.log('Socket connected', socket.id);
      // allow client to identify (safer than trusting client-sent userId)
      socket.on('identify', (u) => {
        try { socket.data.user = { id: u?.userId || u?.id || null, name: u?.name || u?.user || null }; }
        catch (e) { socket.data.user = null; }
      });

      // join channel/room
      socket.on('join:channel', (channel) => {
        try { if (typeof channel === 'string') socket.join(channel); }
        catch (e) { }
      });

      socket.on('chat:message', async (msg) => {
        // enforce simple per-user token-bucket rate limit
        try {
          const { allowSend, timeUntilRefill } = await import('./server/utils/chatRateLimiter.js');
          const senderKey = (socket.data?.user?.id) ? String(socket.data.user.id) : socket.id;
          const allowed = allowSend(senderKey);
          if (!allowed) {
            const wait = timeUntilRefill(senderKey);
            socket.emit('chat:rate_limited', { retryAfterMs: wait });
            return;
          }
        } catch (e) { /* silently continue if limiter fails */ }

        // basic auth-check: if client provided userId but didn't identify, reject
        const identified = socket.data?.user;
        if (msg.userId && identified && String(msg.userId) !== String(identified.id)) {
          socket.emit('chat:unauthorized', { message: 'user mismatch' });
          return;
        }

        const channel = msg.channel || 'general';
        const text = msg.text || msg.message || msg.msg || '';

        // content filter
        try {
          const { checkMessageContent } = await import('./server/utils/chatFilter.js');
          const ok = checkMessageContent(text || '');
          if (!ok.allowed) {
            socket.emit('chat:blocked', { reason: ok.reason || 'blocked_content' });
            return;
          }
        } catch (e) { /* continue if filter fails */ }

        const payload = {
          userId: msg.userId || socket.data?.user?.id || null,
          user: msg.user || socket.data?.user?.name || 'Anonymous',
          channel,
          text,
          time: msg.time ? new Date(msg.time) : new Date()
        };

        // persist and broadcast to channel
        (async () => {
          try {
            const { ChatMessage } = await import('./server/models/ChatMessage.js');
            await ChatMessage.create(payload as any);
          } catch (e) { console.warn('Failed to persist chat message', e); }
        })();

        try { io.to(channel).emit('chat:message', payload); }
        catch (e) { io.emit('chat:message', payload); }
      });

      socket.on('disconnect', () => {
        // handle disconnect
      });
    });
  } catch (err) {
    console.warn('Socket.IO failed to initialize', err);
  }

  server.on('error', (err: any) => {
    if (err?.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Stop the process using that port or set a different PORT environment variable.`);
      process.exit(1);
    }
    console.error('Server error:', err);
    process.exit(1);
  });
}

startServer();
