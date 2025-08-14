import { Router } from "express";
import auth from "../middleware/auth.js";
import Flashcard from "../models/Flashcard.js";

const router = Router();

// Get flashcards by note
router.get("/", auth, async (req, res) => {
  const { noteId } = req.query;
  const filter = { userId: req.user.id };
  if (noteId) filter.noteId = noteId;
  const cards = await Flashcard.find(filter).sort({ createdAt: -1 });
  res.json(cards);
});

export default router;
