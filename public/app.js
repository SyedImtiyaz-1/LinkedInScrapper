/* =============================================
   LinkedIn Scrapper — Frontend Logic
   ============================================= */

let currentMode = 'demo';
let allResults = [];
let filteredResults = [];
let sortKey = '';
let sortDir = 1;
let pollInterval = null;

// ---- Mode ----

function setMode(mode) {
  currentMode = mode;

  document.getElementById('btn-demo').classList.toggle('active', mode === 'demo');
  document.getElementById('btn-live').classList.toggle('active', mode === 'live');

  document.getElementById('demo-notice').classList.toggle('hidden', mode !== 'demo');
  document.getElementById('live-notice').classList.toggle('hidden', mode !== 'live');

  document.querySelectorAll('.live-only').forEach(el => {
    el.classList.toggle('hidden', mode !== 'live');
  });

  document.getElementById('submit-text').textContent = mode === 'demo' ? 'Run Demo Search' : 'Start Scraping';
}

// ---- Form Submit ----

document.getElementById('scrape-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const roles = Array.from(document.querySelectorAll('input[name="roles"]:checked')).map(el => el.value);
  if (roles.length === 0) {
    showToast('Please select at least one role.');
    return;
  }

  const location = document.getElementById('location').value.trim();

  if (currentMode === 'demo') {
    await runDemo(roles, location);
  } else {
    await runLiveScrape(roles, location);
  }
});

// ---- Demo Mode ----

async function runDemo(roles, location) {
  setSubmitLoading(true, 'Loading...');

  try {
    const res = await fetch('/api/demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roles, location })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Demo failed');

    allResults = data.data;
    filteredResults = [...allResults];
    renderResults();
    showToast(`Demo loaded — ${allResults.length} sample leads`);
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  } finally {
    setSubmitLoading(false);
  }
}

// ---- Live Scrape ----

async function runLiveScrape(roles, location) {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const maxResults = document.getElementById('maxResults').value;

  if (!email || !password) {
    showToast('Enter your LinkedIn email and password.');
    return;
  }

  setSubmitLoading(true, 'Starting...');
  showProgress(0, 'Launching browser...');

  try {
    const res = await fetch('/api/scrape', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, roles, location, maxResults })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Scrape failed');

    pollJobStatus(data.jobId, roles.length);
  } catch (err) {
    hideProgress();
    setSubmitLoading(false);
    showToast(`Error: ${err.message}`, 'error');
  }
}

function pollJobStatus(jobId, roleCount) {
  let tick = 0;
  const messages = [
    'Logging into LinkedIn...',
    'Searching for profiles...',
    'Collecting profile data...',
    'Extracting contact info...',
    'Finalizing results...'
  ];

  pollInterval = setInterval(async () => {
    try {
      const res = await fetch(`/api/job/${jobId}`);
      const job = await res.json();

      const pct = Math.min(job.progress || Math.min(tick * 8, 90), 100);
      const msg = messages[Math.min(Math.floor(tick / 3), messages.length - 1)];
      showProgress(pct, msg);
      tick++;

      if (job.status === 'completed') {
        clearInterval(pollInterval);
        hideProgress();
        setSubmitLoading(false);
        allResults = job.data;
        filteredResults = [...allResults];
        renderResults();
        showToast(`Scraping complete — ${allResults.length} leads found`);
      } else if (job.status === 'failed') {
        clearInterval(pollInterval);
        hideProgress();
        setSubmitLoading(false);
        showToast(`Scraping failed: ${job.error}`, 'error');
      }
    } catch (e) {
      // Network blip, continue polling
    }
  }, 3000);
}

// ---- Results Rendering ----

function renderResults() {
  const section = document.getElementById('results-section');
  const tbody = document.getElementById('results-tbody');
  const countEl = document.getElementById('results-count');

  if (filteredResults.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="no-results">
          <div class="no-results-icon">🔍</div>
          <p>No results found. Try adjusting your filters.</p>
        </td>
      </tr>`;
    countEl.textContent = '0 leads found';
    section.classList.remove('hidden');
    renderStats();
    return;
  }

  countEl.textContent = `${filteredResults.length} lead${filteredResults.length !== 1 ? 's' : ''} found`;

  tbody.innerHTML = filteredResults.map((p, i) => `
    <tr>
      <td class="cell-name">${esc(p.name || '—')}</td>
      <td class="cell-role">${esc(p.title || '—')}</td>
      <td class="cell-company">${esc(p.company || '—')}</td>
      <td class="cell-email">
        ${p.email
          ? `<a href="mailto:${esc(p.email)}">${esc(p.email)}</a>`
          : `<span class="tag tag-empty">N/A</span>`}
      </td>
      <td class="cell-phone">${esc(p.phone || '—')}</td>
      <td class="cell-location">${esc(p.location || '—')}</td>
      <td class="cell-link">
        ${p.profileUrl
          ? `<a href="${esc(p.profileUrl)}" target="_blank" rel="noopener">↗ View</a>`
          : '—'}
      </td>
    </tr>
  `).join('');

  section.classList.remove('hidden');
  renderStats();
}

function renderStats() {
  const statsRow = document.getElementById('stats-row');

  const withEmail = allResults.filter(r => r.email).length;
  const withPhone = allResults.filter(r => r.phone).length;

  const roleCounts = {};
  allResults.forEach(r => {
    const label = roleLabel(r.searchRole);
    roleCounts[label] = (roleCounts[label] || 0) + 1;
  });

  const roleStatsHtml = Object.entries(roleCounts)
    .map(([role, count]) => `
      <div class="stat-item">
        <span class="stat-label">${role}</span>
        <span class="stat-value">${count}</span>
      </div>
    `).join('');

  statsRow.innerHTML = `
    <div class="stat-item">
      <span class="stat-label">Total</span>
      <span class="stat-value">${allResults.length}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">With Email</span>
      <span class="stat-value">${withEmail}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">With Phone</span>
      <span class="stat-value">${withPhone}</span>
    </div>
    ${roleStatsHtml}
  `;
}

function roleLabel(roleKey) {
  const map = {
    'project-manager': 'PM',
    'tech-manager': 'Tech Mgr',
    'ceo': 'CEO',
    'cto': 'CTO',
    'agency-freelancer': 'Agency/FL'
  };
  return map[roleKey] || roleKey;
}

// ---- Filter ----

function filterResults() {
  const q = document.getElementById('search-filter').value.toLowerCase();
  if (!q) {
    filteredResults = [...allResults];
  } else {
    filteredResults = allResults.filter(r =>
      (r.name || '').toLowerCase().includes(q) ||
      (r.title || '').toLowerCase().includes(q) ||
      (r.company || '').toLowerCase().includes(q) ||
      (r.email || '').toLowerCase().includes(q) ||
      (r.location || '').toLowerCase().includes(q)
    );
  }
  renderResults();
}

// ---- Sort ----

function sortTable(key) {
  if (sortKey === key) {
    sortDir *= -1;
  } else {
    sortKey = key;
    sortDir = 1;
  }

  filteredResults.sort((a, b) => {
    const av = (a[key] || '').toLowerCase();
    const bv = (b[key] || '').toLowerCase();
    return av < bv ? -sortDir : av > bv ? sortDir : 0;
  });

  renderResults();
}

// ---- Clear ----

function clearResults() {
  allResults = [];
  filteredResults = [];
  document.getElementById('results-section').classList.add('hidden');
  document.getElementById('search-filter').value = '';
  showToast('Results cleared');
}

// ---- Export ----

async function exportData(format) {
  if (allResults.length === 0) {
    showToast('No data to export.');
    return;
  }

  try {
    const res = await fetch(`/api/export/${format}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: allResults })
    });

    if (!res.ok) throw new Error('Export failed');

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `linkedin_leads.${format}`;
    a.click();
    URL.revokeObjectURL(url);

    showToast(`Exported ${allResults.length} leads as ${format.toUpperCase()}`);
  } catch (err) {
    showToast(`Export error: ${err.message}`, 'error');
  }
}

// ---- UI Helpers ----

function setSubmitLoading(loading, text = 'Start Scraping') {
  const btn = document.getElementById('submit-btn');
  const txt = document.getElementById('submit-text');

  if (loading) {
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner"></span> <span>${text}</span>`;
  } else {
    btn.disabled = false;
    btn.innerHTML = `<span class="btn-icon">🔍</span> <span id="submit-text">${currentMode === 'demo' ? 'Run Demo Search' : 'Start Scraping'}</span>`;
  }
}

function showProgress(pct, msg) {
  const card = document.getElementById('progress-card');
  card.classList.remove('hidden');
  document.getElementById('progress-text').textContent = msg || 'Processing...';
  document.getElementById('progress-pct').textContent = `${pct}%`;
  document.getElementById('progress-fill').style.width = `${pct}%`;
}

function hideProgress() {
  document.getElementById('progress-card').classList.add('hidden');
}

function showToast(msg, type = 'info') {
  const toast = document.getElementById('toast');
  document.getElementById('toast-msg').textContent = msg;
  toast.classList.remove('hidden');
  toast.style.background = type === 'error' ? '#dc2626' : 'var(--black)';

  setTimeout(() => toast.classList.add('hidden'), 3500);
}

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
