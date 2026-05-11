// Declarations for packages without TypeScript types to avoid editor errors
declare module 'xss-clean';
declare module 'csurf';
declare module 'express-mongo-sanitize';
declare module 'vite';
declare module 'express-rate-limit';
declare module 'cookie-parser';
declare module 'node-fetch';

// Allow importing .js files in ESM resolution when using TypeScript
declare module '*.js';
