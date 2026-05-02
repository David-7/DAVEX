# DAVEX LMS — Deployment Guide

This document explains how to push the repository to GitHub and deploy the FRONTEND and BACKEND using Vercel (frontend) and Render (backend). It also lists the main project files grouped by `FRONTEND/` and `BACKEND/`.

Prerequisites
- A GitHub account and repo for this project
- Vercel account (for frontend)
- Render (or similar) account (for backend)
- MongoDB Atlas cluster and connection string

Environment variables (minimum)
- `MONGODB_URI` — MongoDB connection string
- `JWT_SECRET` — strong secret for JWT
- `NODE_ENV` — `production`
- Any payment / third-party keys (PayPal, M-Pesa) as needed

Push to GitHub
1. Initialize repo (if not already) and commit all files.
   ```bash
   git init
   git add .
   git commit -m "Initial DAVEX LMS"
   git remote add origin git@github.com:your-username/your-repo.git
   git push -u origin main
   ```

FRONTEND (Vercel)
1. The frontend is located in the `FRONTEND/` folder and is a Vite + React app.
2. On Vercel, create a new project and import from your GitHub repo.
3. Set the root directory to `FRONTEND` when configuring the project.
4. Build & Output settings (Vite):
   - Framework: `Vite` (or select `Other` and use commands below)
   - Build command: `npm run build`
   - Output directory: `dist`
5. Add required environment variables in Vercel dashboard (if frontend needs any).
6. Deploy — Vercel will build and serve the static app.

BACKEND (Render)
1. The backend is in `BACKEND/` and is an Express + Node app.
2. On Render, create a new Web Service and connect your GitHub repo.
3. Set the root directory to `BACKEND`.
4. Build & Start commands:
   - Build command: `npm install`
   - Start command: `npm run start` (or `npm run dev` for development)
5. Environment variables: set `MONGODB_URI`, `JWT_SECRET`, and any payment keys.
6. Ensure the service uses the `PORT` environment variable provided by Render.

Notes & Security
- Use environment secrets for all sensitive data.
- Ensure `NODE_ENV=production` in production.
- Use HTTPS and enable CORS only for trusted origins.
- Rotate secrets periodically.

Local testing
- Install dependencies in both folders:
  ```bash
  cd BACKEND && npm install
  cd ../FRONTEND && npm install
  ```
- Start backend (development):
  ```bash
  cd BACKEND
  npm run dev
  ```
- Start frontend (development):
  ```bash
  cd FRONTEND
  npm run dev
  ```

Project file categorization
- BACKEND/
  - server.ts — main server entry
  - server/seed.ts — seed data script
  - server/controllers/ — controllers (auth, etc.)
  - server/models/ — Mongoose models (User, LessonUnit)
  - server/routes/ — Express routes (authRoutes, lessonRoutes, dashboardRoutes)
  - server/middleware/ — middleware (auth, rate limiting)

- FRONTEND/
  - src/ — React source files (App.tsx, pages, components)
  - public/ — static assets
  - index.html, vite.config.ts, tsconfig.json

If you want, I can also generate a short `README-deploy.txt` with the exact steps to paste into GitHub Actions or to run manually. Tell me whether you prefer Render or another host for the backend and I will tailor commands accordingly.
# DAVEX LMS - Deployment Guide

This project has been split into `FRONTEND` and `BACKEND` to facilitate deployment on platforms like Vercel (Frontend) and Render (Backend).

## 1. Prerequisites
- A **MongoDB Atlas** database connection string.
- A GitHub repository for your code.

## 2. Backend Deployment (Render)
- Go to [Render.com](https://render.com) and create a new **Web Service**.
- Connect your GitHub repository.
- Set **Root Directory** to `BACKEND`.
- **Runtime**: `Node`.
- **Build Command**: `npm install`
- **Start Command**: `node BACKEND/server.js` (Note: ensure your build script compiles `server.ts` to `server.js` or use `npm start` which we've configured with `tsx server.ts` for ease, though `node` with transpiled JS is better for production).
  - *Recommendation*: Use `npm start` in `BACKEND/package.json` with `tsx server.ts`.

### Environment Variables on Render:
- `MONGODB_URI`: Your Atlas connection string.
- `JWT_SECRET`: A random secure string.
- `NODE_ENV`: `production`

---

## 3. Frontend Deployment (Vercel)
- Go to [Vercel.com](https://vercel.com) and create a new project.
- Connect your GitHub repository.
- Set the **Root Directory** to `FRONTEND`.
- **Framework Preset**: `Vite`.
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### Environment Variables on Vercel:
- `VITE_API_URL`: The URL of your Render backend (e.g., `https://davex-backend.onrender.com`). **Must not end with a slash.**

---

## 4. Assets & Logo
- Download the attached logo from the chat.
- Save it as `FRONTEND/public/logo.png`.
- The application will automatically pick it up in the Navbar.

## 5. Development
To run everything locally from the root:
```bash
npm run dev
```
This will start the backend (with Vite middleware hosting the frontend) on `http://localhost:3000`.
