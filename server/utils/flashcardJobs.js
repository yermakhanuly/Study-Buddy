import { randomUUID } from "crypto";

const jobs = new Map();
const JOB_TTL_MS = 15 * 60 * 1000;

function cleanupJobs() {
  const now = Date.now();
  for (const [jobId, job] of jobs.entries()) {
    if (now - job.createdAt > JOB_TTL_MS) {
      jobs.delete(jobId);
    }
  }
}

export function createFlashcardJob({ userId, noteId }) {
  cleanupJobs();
  const job = {
    id: randomUUID(),
    userId,
    noteId,
    status: "queued",
    count: 0,
    error: null,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  jobs.set(job.id, job);
  return job;
}

export function getFlashcardJob(jobId) {
  return jobs.get(jobId);
}

export function updateFlashcardJob(jobId, updates) {
  const job = jobs.get(jobId);
  if (!job) return null;
  const updated = {
    ...job,
    ...updates,
    updatedAt: Date.now()
  };
  jobs.set(jobId, updated);
  return updated;
}
