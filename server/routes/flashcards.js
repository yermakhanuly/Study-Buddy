import { Router } from "express";
import auth from "../middleware/auth.js";
import Flashcard from "../models/Flashcard.js";
import { asyncHandler, createError } from "../utils/errors.js";
import { isValidObjectId } from "../utils/validation.js";

const router = Router();

// Get flashcards by note
router.get("/", auth, asyncHandler(async (req, res) => {
  const { noteId } = req.query;
  const filter = { userId: req.user.id };
  if (noteId) {
    if (!isValidObjectId(noteId)) {
      throw createError(400, "Invalid note id", "VALIDATION_ERROR");
    }
    filter.noteId = noteId;
  }
  const cards = await Flashcard.find(filter).sort({ createdAt: -1 });
  res.json(cards);
}));

router.delete("/note/:noteId", auth, asyncHandler(async (req, res) => {
  const { noteId } = req.params;
  if (!isValidObjectId(noteId)) {
    throw createError(400, "Invalid note id", "VALIDATION_ERROR");
  }

  const result = await Flashcard.deleteMany({
    userId: req.user.id,
    noteId
  });
  res.json({ ok: true, deletedCount: result.deletedCount || 0 });
}));

router.delete("/:flashcardId", auth, asyncHandler(async (req, res) => {
  const { flashcardId } = req.params;
  if (!isValidObjectId(flashcardId)) {
    throw createError(400, "Invalid flashcard id", "VALIDATION_ERROR");
  }

  const deleted = await Flashcard.findOneAndDelete({
    _id: flashcardId,
    userId: req.user.id
  });
  if (!deleted) throw createError(404, "Flashcard not found", "NOT_FOUND");

  res.json({ ok: true });
}));

export default router;
