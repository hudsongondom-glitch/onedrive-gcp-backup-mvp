const express = require('express');
const jobLogger = require('../utils/jobLogger');

const router = express.Router();

// GET /logs/jobs
// Lists recent job runs (most recent first) — summary only.
router.get('/jobs', (req, res) => {
  res.status(200).json({ jobs: jobLogger.listJobs() });
});

// GET /logs/jobs/:jobId
// Returns the full step-by-step log (with actual responses) for one job.
// Intended for analysis when a job's final response looks vague/incomplete.
router.get('/jobs/:jobId', (req, res) => {
  const log = jobLogger.getJobLog(req.params.jobId);
  if (!log) {
    return res.status(404).json({ error: 'No log found for this job id' });
  }
  res.status(200).json(log);
});

module.exports = router;
