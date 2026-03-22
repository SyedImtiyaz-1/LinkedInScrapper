require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const { scrapeLinkedIn } = require('./scraper/linkedin');
const { generateDemoData } = require('./scraper/demo');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory job storage
const jobs = new Map();
let jobCounter = 0;

// Scrape endpoint (live LinkedIn)
app.post('/api/scrape', async (req, res) => {
  const { email, password, roles, location, maxResults } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'LinkedIn email and password are required.' });
  }
  if (!roles || roles.length === 0) {
    return res.status(400).json({ error: 'Select at least one role to scrape.' });
  }

  const jobId = `job_${++jobCounter}_${Date.now()}`;
  jobs.set(jobId, { status: 'running', progress: 0, data: [], error: null, startedAt: new Date().toISOString() });

  res.json({ jobId, message: 'Scraping started' });

  // Run scraper in background
  scrapeLinkedIn({
    email,
    password,
    roles,
    location: location || '',
    maxResults: parseInt(maxResults) || 25,
    headless: process.env.HEADLESS !== 'false'
  }).then(result => {
    const job = jobs.get(jobId);
    if (result.success) {
      job.status = 'completed';
      job.data = result.data;
      job.progress = 100;
    } else {
      job.status = 'failed';
      job.error = result.error;
    }
    job.completedAt = new Date().toISOString();
  }).catch(err => {
    const job = jobs.get(jobId);
    job.status = 'failed';
    job.error = err.message;
    job.completedAt = new Date().toISOString();
  });
});

// Demo scrape endpoint (no credentials needed)
app.post('/api/demo', (req, res) => {
  const { roles, location } = req.body;

  if (!roles || roles.length === 0) {
    return res.status(400).json({ error: 'Select at least one role.' });
  }

  const data = generateDemoData(roles, location || '');
  res.json({ success: true, data, count: data.length, mode: 'demo' });
});

// Job status endpoint
app.get('/api/job/:jobId', (req, res) => {
  const job = jobs.get(req.params.jobId);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  res.json(job);
});

// Export as CSV
app.post('/api/export/csv', (req, res) => {
  const { data } = req.body;
  if (!data || data.length === 0) {
    return res.status(400).json({ error: 'No data to export' });
  }

  const headers = ['Name', 'Role/Title', 'Company', 'Email', 'Phone', 'Location', 'Search Role', 'Profile URL', 'Scraped At'];
  const rows = data.map(d => [
    d.name || '',
    d.title || '',
    d.company || '',
    d.email || '',
    d.phone || '',
    d.location || '',
    d.searchRole || '',
    d.profileUrl || '',
    d.scrapedAt || ''
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="linkedin_leads.csv"');
  res.send(csvContent);
});

// Export as JSON
app.post('/api/export/json', (req, res) => {
  const { data } = req.body;
  if (!data || data.length === 0) {
    return res.status(400).json({ error: 'No data to export' });
  }

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="linkedin_leads.json"');
  res.send(JSON.stringify(data, null, 2));
});

// Serve frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n  LinkedIn Scrapper running at http://localhost:${PORT}`);
    console.log(`  Copy .env.example to .env and add your LinkedIn credentials\n`);
  });
}
