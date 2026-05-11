import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "./models/User.js";
import { LessonUnit } from "./models/LessonUnit.js";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || '';
if (!MONGODB_URI) {
  console.error('MONGODB_URI is not set in environment. Seed requires MONGODB_URI.');
  process.exit(1);
}

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB for seeding...");

    // Clear existing data
    await User.deleteMany({});
    await LessonUnit.deleteMany({});

    const adminPassword = process.env.SEED_ADMIN_PASSWORD || process.env.SEED_USER_PASSWORD;
    const studentPassword = process.env.SEED_STUDENT_PASSWORD;
    if (!adminPassword || !studentPassword) {
      console.error('Seed requires SEED_ADMIN_PASSWORD and SEED_STUDENT_PASSWORD env vars to avoid hardcoded credentials.');
      process.exit(1);
    }

    // Create Admin
    await User.create({
      name: "Dave Admin",
      email: process.env.SEED_ADMIN_EMAIL || "wanbrossmedia@gmail.com",
      password: adminPassword,
      role: "ADMIN",
      admissionNumber: "000A/1000",
      package: "PREMIUM"
    });

    // Create Student
    await User.create({
      name: "Alex Johnson",
      email: process.env.SEED_STUDENT_EMAIL || "alex@davex.lms",
      password: studentPassword,
      role: "STUDENT",
      admissionNumber: "025J/1600",
      package: "BASIC"
    });

    // Create Initial Lesson Units
    const lessons = [
      { 
        title: "Introduction to DavEx LMS", 
        content: "Learn how to navigate your workspace and access materials.",
        order: 1,
        status: "completed"
      },
      { 
        title: "Linux Fundamentals", 
        content: "Basic command line operations (ls, cd, mkdir, rm).",
        order: 2,
        status: "pending"
      },
      { 
        title: "Networking 101", 
        content: "Understanding IP addresses, subnets, and DNS.",
        order: 3,
        status: "pending"
      }
    ];

    await LessonUnit.insertMany(lessons);

    console.log("Seeding completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seed();
