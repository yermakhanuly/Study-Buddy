import mongoose from "mongoose";

export const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

export const isEmail = (value) =>
  typeof value === "string" &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export const isValidObjectId = (value) => mongoose.isValidObjectId(value);

export const isPasswordStrong = (value) =>
  typeof value === "string" && value.length >= 6;
