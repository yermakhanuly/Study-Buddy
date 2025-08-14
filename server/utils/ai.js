import dotenv from "dotenv";
dotenv.config(); // <--- add this line


import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateFlashcardsFromText(text) {
  // Keep prompt simple and robust
  const prompt = `
Create 8 concise study flashcards from the following notes.
Return JSON array of objects with keys: "question", "answer".
Notes:
"""${text.slice(0, 5000)}"""
JSON ONLY:
`;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2
  });

  // Basic safety parse
  let data;
  try {
    data = JSON.parse(response.choices[0].message.content);
  } catch {
    // fallback attempt: extract between [ and ]
    const raw = response.choices[0].message.content;
    const start = raw.indexOf("[");
    const end = raw.lastIndexOf("]");
    data = JSON.parse(raw.slice(start, end + 1));
  }
  // Validate shape
  return (Array.isArray(data) ? data : [])
    .filter(x => x && x.question && x.answer)
    .slice(0, 12);
}
