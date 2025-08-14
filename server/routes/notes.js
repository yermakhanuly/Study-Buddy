import { Router } from "express";
import auth from "../middleware/auth.js";
import Note from "../models/Note.js";
import Flashcard from "../models/Flashcard.js";
import { generateFlashcardsFromText } from "../utils/ai.js";

const router = Router();

// Create note
router.post("/", auth, async (req, res) => {
  const { title, content } = req.body;
  if (!title?.trim() || !content?.trim()) return res.status(400).json({ error: "Missing fields" });
  const note = await Note.create({ userId: req.user.id, title, content });
  res.json(note);
});

// List notes
router.get("/", auth, async (req, res) => {
  const notes = await Note.find({ userId: req.user.id }).sort({ createdAt: -1 });
  res.json(notes);
});

// Generate flashcards for a note
router.post("/:noteId/generate-flashcards", auth, async (req, res) => {
  const note = await Note.findOne({ _id: req.params.noteId, userId: req.user.id });
  if (!note) return res.status(404).json({ error: "Note not found" });

  const generated = await generateFlashcardsFromText(note.content);
  const cards = await Flashcard.insertMany(
    generated.map(fc => ({
      userId: req.user.id,
      noteId: note._id,
      question: fc.question.trim(),
      answer: fc.answer.trim()
    }))
  );

  res.json({ count: cards.length, flashcards: cards });
});

export default router;
