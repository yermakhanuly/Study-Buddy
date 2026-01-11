import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import notesRoutes from "./routes/notes.js";
import flashcardRoutes from "./routes/flashcards.js";
import { createError } from "./utils/errors.js";

dotenv.config();

const app = express();

// CORS config
const corsOptions = {
  origin: true, // Reflect request origin automatically
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));

// Handle preflight requests explicitly (for some browsers)


// Middleware
app.use(express.json({ limit: "1mb" }));
app.use((req, res, next) => {
  console.log(req.method, req.url, req.body);
  next();
});

const requiredEnv = ["MONGO_URI", "JWT_SECRET"];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
  console.warn(`⚠️ Missing env vars: ${missingEnv.join(", ")}`);
}
if (!process.env.OPENAI_API_KEY) {
  console.warn("⚠️ OPENAI_API_KEY is not set; flashcard generation will fail.");
}

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ Mongo error:", err.message));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/flashcards", flashcardRoutes);

app.get("/", (_req, res) => res.send("StudyBuddy AI server is running"));

app.use((_req, _res, next) => {
  next(createError(404, "Route not found", "NOT_FOUND"));
});

app.use((err, _req, res, _next) => {
  const isBadJson = err?.type === "entity.parse.failed";
  const status = isBadJson ? 400 : err.status || 500;
  const code = isBadJson ? "BAD_JSON" : err.code || (status >= 500 ? "SERVER_ERROR" : "ERROR");
  const message = isBadJson ? "Invalid JSON body" : err.message || "Server error";

  if (status >= 500) {
    console.error(err);
  }
  res.status(status).json({ error: message, code });
});

const port = process.env.PORT || 5050;
app.listen(port, () => console.log(`🚀 Server listening on port ${port}`));
