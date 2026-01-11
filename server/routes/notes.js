import { Router } from "express";
import auth from "../middleware/auth.js";
import Note from "../models/Note.js";
import Flashcard from "../models/Flashcard.js";
import { generateFlashcardsFromText } from "../utils/ai.js";
import { asyncHandler, createError } from "../utils/errors.js";
import { isNonEmptyString, isValidObjectId } from "../utils/validation.js";
import {
  createFlashcardJob,
  getFlashcardJob,
  updateFlashcardJob
} from "../utils/flashcardJobs.js";

const router = Router();

// Create note
router.post("/", auth, asyncHandler(async (req, res) => {
  const { title, content } = req.body;
  if (!isNonEmptyString(title) || !isNonEmptyString(content)) {
    throw createError(400, "Missing fields", "VALIDATION_ERROR");
  }
  const note = await Note.create({
    userId: req.user.id,
    title: title.trim(),
    content: content.trim()
  });
  res.json(note);
}));

// List notes
router.get("/", auth, asyncHandler(async (req, res) => {
  const notes = await Note.find({ userId: req.user.id }).sort({ createdAt: -1 });
  res.json(notes);
}));

// Generate flashcards for a note
router.post("/:noteId/generate-flashcards", auth, asyncHandler(async (req, res) => {
  const { noteId } = req.params;
  const isAsync = ["1", "true", "yes"].includes(String(req.query.async || ""));
  if (!isValidObjectId(noteId)) {
    throw createError(400, "Invalid note id", "VALIDATION_ERROR");
  }

  const note = await Note.findOne({ _id: noteId, userId: req.user.id });
  if (!note) throw createError(404, "Note not found", "NOT_FOUND");

  if (isAsync) {
    const job = createFlashcardJob({ userId: req.user.id, noteId });
    res.status(202).json({ jobId: job.id, status: job.status });

    setImmediate(async () => {
      updateFlashcardJob(job.id, { status: "running" });
      try {
        const generated = await generateFlashcardsFromText(note.content);
        const cards = await Flashcard.insertMany(
          generated.map(fc => ({
            userId: req.user.id,
            noteId: note._id,
            question: fc.question.trim(),
            answer: fc.answer.trim()
          }))
        );
        updateFlashcardJob(job.id, { status: "succeeded", count: cards.length });
      } catch (err) {
        updateFlashcardJob(job.id, {
          status: "failed",
          error: err.message || "Generation failed"
        });
      }
    });
    return;
  }

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
}));

router.get("/:noteId/flashcard-jobs/:jobId", auth, asyncHandler(async (req, res) => {
  const { noteId, jobId } = req.params;
  if (!isValidObjectId(noteId)) {
    throw createError(400, "Invalid note id", "VALIDATION_ERROR");
  }

  const job = getFlashcardJob(jobId);
  if (!job || job.noteId !== noteId || job.userId !== req.user.id) {
    throw createError(404, "Job not found", "NOT_FOUND");
  }

  res.json({
    status: job.status,
    count: job.count,
    error: job.error
  });
}));

export default router;
