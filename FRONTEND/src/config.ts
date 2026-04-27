// API Configuration
// When deploying to Vercel and Render separately, set VITE_API_URL to your Render backend URL.
// Example: VITE_API_URL=https://davex-backend.onrender.com
const apiUrl = import.meta.env.VITE_API_URL || '';

export const API_ROOT = apiUrl;
