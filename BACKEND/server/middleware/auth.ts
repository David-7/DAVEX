import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User.ts";

let JWT_SECRET = process.env.JWT_SECRET || '';
if (!JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    console.error('JWT_SECRET is not set in environment. Aborting in production.');
    process.exit(1);
  }
  console.warn('JWT_SECRET is not set — using development fallback. Set JWT_SECRET in production.');
  JWT_SECRET = 'dev-secret-change-me';
}

export const protect = async (req: any, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Not authorized" });

    const decoded: any = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ message: "Not authorized" });

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Not authorized" });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: any, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
};
