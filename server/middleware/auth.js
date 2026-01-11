import jwt from "jsonwebtoken";
import { createError } from "../utils/errors.js";

export default function auth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return next(createError(401, "No token", "UNAUTHORIZED"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id };
    next();
  } catch {
    return next(createError(401, "Invalid token", "UNAUTHORIZED"));
  }
}
