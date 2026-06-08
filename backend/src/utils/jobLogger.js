// Lightweight, non-invasive job logger for MVP analysis.
//
// Goal: capture what each backup job actually did/returned (per-step responses)
// so that when a final result looks "vague" we can pull the underlying detail
// without re-running the job or adding heavyweight infra (no DB writes, no
// external services — just an in-memory ring buffer keyed by job id).
//
// This module is purely additive: it never throws into the caller's flow and
// never mutates data passed to it (only stores shallow-cloned snapshots).

const MAX_JOBS = 100; // ring buffer size — keeps memory bounded for MVP

// jobId -> { jobId, type, startedAt, finishedAt, status, steps: [...] }
const jobs = new Map();
const jobOrder = []; // insertion order, oldest first

function safeClone(value) {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch (_err) {
    return String(value);
  }
}

function evictIfNeeded() {
  while (jobOrder.length > MAX_JOBS) {
    const oldest = jobOrder.shift();
    jobs.delete(oldest);
  }
}

/**
 * Starts tracking a new job. Returns the jobId for convenience (it's just
 * echoed back — callers should pass their own id, e.g. a backupId or a
 * temporary correlation id generated before the backup record exists).
 */
function startJob(jobId, type, context) {
  if (!jobId) return null;

  jobs.set(jobId, {
    jobId,
    type: type || 'unknown',
    context: safeClone(context || {}),
    startedAt: new Date().toISOString(),
    finishedAt: null,
    status: 'running',
    steps: [],
  });
  jobOrder.push(jobId);
  evictIfNeeded();

  return jobId;
}

/**
 * Records a single step's actual response/output for later inspection.
 * Safe to call even if startJob was never called for this id (it will
 * create a minimal entry on the fly).
 */
function logStep(jobId, step, data) {
  if (!jobId) return;

  let job = jobs.get(jobId);
  if (!job) {
    job = {
      jobId,
      type: 'unknown',
      context: {},
      startedAt: new Date().toISOString(),
      finishedAt: null,
      status: 'running',
      steps: [],
    };
    jobs.set(jobId, job);
    jobOrder.push(jobId);
    evictIfNeeded();
  }

  job.steps.push({
    step,
    at: new Date().toISOString(),
    data: safeClone(data),
  });
}

/**
 * Marks a job as finished and stores its final outcome/response.
 */
function finishJob(jobId, status, result) {
  const job = jobs.get(jobId);
  if (!job) return;

  job.status = status || 'completed';
  job.finishedAt = new Date().toISOString();
  job.result = safeClone(result);
}

/**
 * Returns the full log for a single job, or null if unknown.
 */
function getJobLog(jobId) {
  const job = jobs.get(jobId);
  return job ? safeClone(job) : null;
}

/**
 * Returns a summary list of recent jobs (most recent first), without the
 * full step detail — useful for browsing before drilling into one job.
 */
function listJobs() {
  return [...jobOrder]
    .reverse()
    .map((id) => {
      const job = jobs.get(id);
      if (!job) return null;
      return {
        jobId: job.jobId,
        type: job.type,
        status: job.status,
        startedAt: job.startedAt,
        finishedAt: job.finishedAt,
        stepCount: job.steps.length,
      };
    })
    .filter(Boolean);
}

module.exports = {
  startJob,
  logStep,
  finishJob,
  getJobLog,
  listJobs,
};
