import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { Points } from "../models/Points.js";
import { z } from "zod";

let JWT_SECRET = process.env.JWT_SECRET || '';
if (!JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    console.error('JWT_SECRET is not set in environment. Aborting in production.');
    process.exit(1);
  }
  console.warn('JWT_SECRET is not set — using development fallback. Set JWT_SECRET in production.');
  JWT_SECRET = 'dev-secret-change-me';
}

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  admissionNumber: z.string().regex(/^\d{3}[A-Z]\/\d{4}$/, "Use format 025J/1600"),
  package: z.enum(["BASIC", "PREMIUM"]).optional(),
});

export const register = async (req: Request, res: Response) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const userExists = await User.findOne({ email: validatedData.email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const { package: _pkg, ...userData } = validatedData as any;
    const user = await User.create({ ...userData, package: "BASIC" });
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "30d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user: any = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      if (user.access === false) {
        return res.status(403).json({ message: "Access revoked" });
      }
      const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "30d" });

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
      // Award daily login point (once per UTC day)
      try {
        const startOfDay = new Date();
        startOfDay.setUTCHours(0, 0, 0, 0);
        const existing = await Points.findOne({ user: user._id, reason: 'daily-login', createdAt: { $gte: startOfDay } });
        if (!existing) {
          await Points.create({ user: user._id, points: 1, reason: 'daily-login' });
          await User.findByIdAndUpdate(user._id, { $inc: { points: 1 } });
        }
      } catch (err: any) {
        console.error('Error awarding daily login points', err);
      }
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const logout = (req: Request, res: Response) => {
  res.cookie("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    expires: new Date(0)
  });
  res.status(200).json({ message: "Logged out successfully" });
};

export const getMe = async (req: any, res: Response) => {
  const user = await User.findById(req.user._id).select("-password");
  res.json(user);
};

export const checkResetIdentity = async (req: Request, res: Response) => {
  const { email, admissionNumber } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // If only email is provided, checking existence
    if (email && !admissionNumber) {
      return res.json({ exists: true });
    }

    if (user.admissionNumber !== admissionNumber) {
      return res.status(401).json({ message: "Admission number does not match" });
    }

    res.json({ match: true });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { email, admissionNumber, newPassword } = req.body;
  try {
    const user = await User.findOne({ email, admissionNumber });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials for reset" });
    }

    user.password = newPassword;
    await user.save();
    res.json({ message: "Password reset successfully" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
