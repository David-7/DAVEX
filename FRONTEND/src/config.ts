/// <reference types="vite/client" />
// API Configuration
// When deploying to Vercel and Render separately, set VITE_API_URL to your Render backend URL.
// Example: VITE_API_URL=https://davex-backend.onrender.com
const raw = import.meta.env.VITE_API_URL ?? '';

// Strip trailing slash(es) so callers don't end up with double slashes
export const API_ROOT = raw.replace(/\/+$|^$/, '');
