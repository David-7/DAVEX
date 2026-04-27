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
