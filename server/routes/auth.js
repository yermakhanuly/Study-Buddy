import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { asyncHandler, createError } from "../utils/errors.js";
import { isEmail, isNonEmptyString, isPasswordStrong } from "../utils/validation.js";

const router = Router();

router.post("/register", asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!isNonEmptyString(name) || !isEmail(email) || !isPasswordStrong(password)) {
    throw createError(400, "Invalid name, email, or password", "VALIDATION_ERROR");
  }

  const normalizedEmail = email.trim().toLowerCase();
  const exists = await User.findOne({ email: normalizedEmail });
  if (exists) throw createError(400, "Email already used", "CONFLICT");

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name: name.trim(), email: normalizedEmail, passwordHash });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email, xp: user.xp, level: user.level }
  });
}));

router.post("/login", asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!isEmail(email) || !isNonEmptyString(password)) {
    throw createError(400, "Invalid credentials", "VALIDATION_ERROR");
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) throw createError(400, "Invalid credentials", "AUTH_FAILED");

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw createError(400, "Invalid credentials", "AUTH_FAILED");

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email, xp: user.xp, level: user.level }
  });
}));

export default router;
