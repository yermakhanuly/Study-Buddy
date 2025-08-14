import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import notesRoutes from "./routes/notes.js";
import flashcardRoutes from "./routes/flashcards.js";

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

const port = process.env.PORT || 5050;
app.listen(port, () => console.log(`🚀 Server listening on port ${port}`));
