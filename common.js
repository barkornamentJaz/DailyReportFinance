// ============================================================
// common.js — Shared utilities for Daily Report System
// ============================================================

/* ── API helpers ── */
async function apiGet(params) {
  const url = new URL(CONFIG.SCRIPT_URL);
  Object.entries(params).forEach(([k,v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), { redirect: 'follow' });
  if (!res.ok) throw new Error('Network error: ' + res.status);
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Server error');
  return json.data;
}

async function apiPost(body) {
  const res = await fetch(CONFIG.SCRIPT_URL, {
    method: 'POST',
    redirect: 'follow',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error('Network error: ' + res.status);
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Server error');
  return json.data;
}

/* ── Formatters ── */
function fmtLKR(n) {
  return 'Rs\u00A0' + parseFloat(n||0).toLocaleString('en-LK', {minimumFractionDigits:2, maximumFractionDigits:2});
}
function fmtUSD(n) {
  return '$\u00A0' + parseFloat(n||0).toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2});
}
function fmtMoney(n, cur) { return cur === 'USD' ? fmtUSD(n) : fmtLKR(n); }
function fmtDate(d) {
  if (!d) return '—';
  const dt = new Date(d);
  if (isNaN(dt)) return String(d);
  return dt.toLocaleDateString('en-GB', {day:'2-digit',month:'short',year:'numeric'});
}
function fmtDateInput(d) {
  if (!d) return '';
  const dt = new Date(d);
  if (isNaN(dt)) return '';
  return dt.toISOString().split('T')[0];
}
function todayISO() { return new Date().toISOString().split('T')[0]; }
function isOverdue(dueDate) {
  if (!dueDate) return false;
  const due = new Date(dueDate); due.setHours(0,0,0,0);
  const now = new Date(); now.setHours(0,0,0,0);
  return due < now;
}

/* ── Status badge ── */
function statusBadge(status) {
  const map = { Paid:'badge-success', Partial:'badge-warning', Pending:'badge-info', Overdue:'badge-danger' };
  return `<span class="badge ${map[status]||'badge-secondary'}">${status||'—'}</span>`;
}
function regionBadge(region) {
  const map = { Local:'region-local', Seychelles:'region-seychelles', Maldives:'region-maldives' };
  return `<span class="badge ${map[region]||'badge-secondary'}">${region||'—'}</span>`;
}

/* ── Loading ── */
function showLoading(v) {
  const el = document.getElementById('loading');
  if (el) el.style.display = v ? 'flex' : 'none';
}

/* ── Toast ── */
function showToast(msg, type='success') {
  const old = document.getElementById('__toast');
  if (old) old.remove();
  const t = document.createElement('div');
  t.id = '__toast';
  t.className = `toast toast-${type}`;
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 320); }, 3200);
}

/* ── Modal ── */
function openModal(id) {
  const el = document.getElementById(id);
  el.style.display = 'flex'; el.classList.add('open');
}
function closeModal(id) {
  const el = document.getElementById(id);
  el.style.display = 'none'; el.classList.remove('open');
}
// Close on overlay click
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.style.display = 'none'; e.target.classList.remove('open');
  }
});

/* ── Confirm ── */
async function confirmDel(msg='Delete this record? This cannot be undone.') {
  return window.confirm(msg);
}

/* ── Print ── */
function doPrint(sectionTitle) {
  const orig = document.title;
  document.title = `${sectionTitle} — ${CONFIG.COMPANY_NAME} — ${fmtDate(new Date())}`;
  window.print();
  document.title = orig;
}

/* ── Date label for header ── */
function setPageDate() {
  const el = document.getElementById('pageDate');
  const dateStr = new Date().toLocaleDateString('en-GB', {
    weekday:'long', year:'numeric', month:'long', day:'numeric'
  });
  if (el) el.textContent = dateStr;
  const ph = document.getElementById('printDateHdr');
  if (ph) ph.innerHTML = 'Report Date:<br><strong>' + dateStr + '</strong>';
  const cn = document.querySelectorAll('.company-name');
  cn.forEach(c => { c.textContent = CONFIG.COMPANY_NAME; });
}

/* ── Active nav link ── */
function setActiveNav() {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (href === page || (page === '' && href === 'index.html')) a.classList.add('active');
    else a.classList.remove('active');
  });
}

document.addEventListener('DOMContentLoaded', () => { setPageDate(); setActiveNav(); });
