import dotenv from "dotenv";
import OpenAI from "openai";
import { createError } from "./errors.js";

dotenv.config();

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const RETRYABLE_STATUS = new Set([408, 429, 500, 502, 503, 504]);
const MAX_RETRIES = 2;
const TIMEOUT_MS = 18000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const withTimeout = async (promise, ms) => {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      reject(createError(504, "AI request timed out", "AI_TIMEOUT"));
    }, ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer);
  }
};

const withRetry = async (fn) => {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err) {
      const status = err?.status;
      if (attempt >= MAX_RETRIES || (status && !RETRYABLE_STATUS.has(status))) {
        throw err;
      }
      const backoff = 500 * Math.pow(2, attempt);
      await sleep(backoff + Math.floor(Math.random() * 200));
      attempt += 1;
    }
  }
};

const normalizeOpenAIError = (err) => {
  if (err?.code?.startsWith("AI_")) return err;
  const status = err?.status;
  if (status === 401) return createError(502, "OpenAI authentication failed", "AI_AUTH_FAILED");
  if (status === 429) return createError(429, "OpenAI rate limit exceeded", "AI_RATE_LIMIT");
  return createError(502, "AI request failed", "AI_ERROR");
};

export async function generateFlashcardsFromText(text) {
  if (!process.env.OPENAI_API_KEY) {
    throw createError(500, "OpenAI API key missing", "AI_CONFIG_MISSING");
  }

  // Keep prompt simple and robust
  const prompt = `
Create 8 concise study flashcards from the following notes.
Return JSON array of objects with keys: "question", "answer".
Notes:
"""${text.slice(0, 5000)}"""
JSON ONLY:
`;

  let response;
  try {
    response = await withRetry(() =>
      withTimeout(
        client.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.2
        }),
        TIMEOUT_MS
      )
    );
  } catch (err) {
    throw normalizeOpenAIError(err);
  }

  // Basic safety parse
  let data;
  const content = response?.choices?.[0]?.message?.content;
  if (!content) {
    throw createError(502, "AI returned empty response", "AI_EMPTY_RESPONSE");
  }
  try {
    data = JSON.parse(content);
  } catch {
    // fallback attempt: extract between [ and ]
    const raw = content;
    const start = raw.indexOf("[");
    const end = raw.lastIndexOf("]");
    try {
      data = JSON.parse(raw.slice(start, end + 1));
    } catch {
      throw createError(502, "AI returned invalid JSON", "AI_BAD_RESPONSE");
    }
  }
  // Validate shape
  return (Array.isArray(data) ? data : [])
    .filter(x => x && x.question && x.answer)
    .slice(0, 12);
}
