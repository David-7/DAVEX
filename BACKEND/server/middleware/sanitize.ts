import { Request, Response, NextFunction } from "express";

// Basic sanitization to prevent NoSQL injection and simple XSS vectors
export function sanitizeBody(req: Request, res: Response, next: NextFunction) {
  function sanitize(obj: any) {
    if (obj && typeof obj === 'object') {
      for (const key of Object.keys(obj)) {
        // remove keys that start with $ or contain . to prevent mongo operator injection
        if (key.startsWith('$') || key.includes('.')) {
          delete obj[key];
          continue;
        }
        const val = obj[key];
        if (typeof val === 'string') {
          // basic escape: replace < and > to mitigate simple XSS payloads
          obj[key] = val.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        } else if (typeof val === 'object') {
          sanitize(val);
        }
      }
    }
  }

  sanitize(req.body);
  sanitize(req.query);
  sanitize(req.params);
  next();
}

export default sanitizeBody;
