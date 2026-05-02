declare module 'cookie-parser';
declare module 'cors';
declare module 'xss-clean';
declare module 'csurf';
declare module 'vite';
declare module 'node-fetch';

// Allow express Request to be augmented in code without type errors
declare namespace Express {
  interface Request {
    user?: any;
    csrfToken?: () => string;
  }
}
