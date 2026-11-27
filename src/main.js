/**
 * Burnrate (meeting-cost-timer) - UI wiring.
 * Pure logic lives in cost.js / format.js / url.js / timer.js / storage.js.
 */
import './style.css';
import { CURRENCIES } from './config/milestones.js';
import {
  normalizeSetup,
  headcount,
  costPerHour,
  costAt,
  milestonesFor,
  currentMilestone,
  costHue
} from './cost.js';
import { formatMoney, formatClock, buildSummary } from './format.js';
import { encodeSetup, decodeSetup } from './url.js';
import { Stopwatch } from './timer.js';
import * as store from './storage.js';
import { buildIssueUrl } from './feedback.js';

/* ---------- DOM refs ---------- */
const $ = (id) => document.getElementById(id);
const el = {
  stage: $('stage'),
  stageTitle: $('stage-title'),
  counter: $('counter'),
  elapsed: $('elapsed'),
  people: $('people'),
  rate: $('rate'),
  milestone: $('milestone'),
  start: $('btn-start'),
  reset: $('btn-reset'),
  save: $('btn-save'),
  present: $('btn-present'),
  copySummary: $('btn-copy-summary'),
  copyLink: $('btn-copy-link'),
  form: $('setup-form'),
  title: $('title'),
  attendees: $('attendees'),
  salary: $('salary'),
  currency: $('currency'),
  multiplier: $('multiplier'),
  hours: $('hours'),
  simpleFields: $('simple-fields'),
  advancedFields: $('advanced-fields'),
  groupsBody: $('groups-body'),
  addGroup: $('btn-add-group'),
  historyBody: $('history-body'),
  historyTable: $('history-table'),
  historyEmpty: $('history-empty'),
  historyTotal: $('history-total'),
  exportBtn: $('btn-export'),
  importBtn: $('btn-import'),
  importFile: $('import-file'),
  resetAll: $('btn-reset-all'),
  dialog: $('confirm-dialog'),
  toast: $('toast')
};

/* ---------- State ---------- */
const urlSetup = decodeSetup(window.location.search);
let setup = urlSetup ?? normalizeSetup(store.loadSetup() ?? {});
let history = store.loadHistory();
const session = store.loadSession();
const watch = new Stopwatch(session?.watch ?? {});
let milestones = milestonesFor(setup.currency);
let lastMilestone = null;
let lastRendered = { counter: '', elapsed: '', hue: -1 };
let rafId = 0;
el.title.value = session?.title ?? '';

/* ---------- Helpers ---------- */
let toastTimer = 0;
function toast(message) {
  el.toast.textContent = message;
  el.toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.toast.classList.remove('show'), 2600);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for browsers / contexts without the async clipboard API.
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch {
      ok = false;
    }
    ta.remove();
    return ok;
  }
}

function persistSession() {
  if (watch.elapsed() === 0 && !watch.running) store.clearSession();
  else store.saveSession({ watch: watch.toJSON(), title: el.title.value });
}

/** Keep the address bar in sync with the setup so it can be shared directly. */
function syncUrl() {
  const url = `${window.location.pathname}?${encodeSetup(setup)}${window.location.hash}`;
  try {
    window.history.replaceState(null, '', url);
  } catch {
    /* ignore (e.g. sandboxed iframes) */
  }
}

function shareUrl() {
  return `${window.location.origin}${window.location.pathname}?${encodeSetup(setup)}`;
}

/* ---------- Setup form ---------- */
function fillCurrencyOptions() {
  el.currency.innerHTML = '';
  for (const c of CURRENCIES) {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    el.currency.appendChild(opt);
  }
}

function groupRow(group, index) {
  const tr = document.createElement('tr');
  tr.dataset.index = String(index);
  const n = index + 1;
  tr.innerHTML = `
    <td><input type="text" data-field="role" maxlength="60" aria-label="Role for group ${n}" /></td>
    <td><input type="number" data-field="count" min="0" step="1" inputmode="numeric" aria-label="Count for group ${n}" /></td>
    <td><input type="number" data-field="salary" min="0" step="1000" inputmode="numeric" aria-label="Annual salary for group ${n}" /></td>
    <td><button type="button" class="btn btn-ghost btn-small" data-action="remove" aria-label="Remove group ${n}">Remove</button></td>`;
  tr.querySelector('[data-field="role"]').value = group.role;
  tr.querySelector('[data-field="count"]').value = String(group.count);
  tr.querySelector('[data-field="salary"]').value = String(group.salary);
  return tr;
}

function renderGroups() {
  el.groupsBody.replaceChildren(...setup.groups.map(groupRow));
}

/** Push the current setup into the form controls. */
function renderForm() {
  el.form.mode.value = setup.advanced ? 'advanced' : 'simple';
  el.simpleFields.hidden = setup.advanced;
  el.advancedFields.hidden = !setup.advanced;
  el.attendees.value = String(setup.attendees);
  el.salary.value = String(setup.salary);
  el.currency.value = setup.currency;
  el.multiplier.value = String(setup.multiplier);
  el.hours.value = String(setup.hoursPerYear);
  renderGroups();
}

/** Read the form controls into a new setup. */
function readForm() {
  const groups = [...el.groupsBody.querySelectorAll('tr')].map((tr) => ({
    role: tr.querySelector('[data-field="role"]').value,
    count: tr.querySelector('[data-field="count"]').value,
    salary: tr.querySelector('[data-field="salary"]').value
  }));
  return normalizeSetup({
    advanced: el.form.mode.value === 'advanced',
    attendees: el.attendees.value,
    salary: el.salary.value,
    currency: el.currency.value,
    multiplier: el.multiplier.value,
    hoursPerYear: el.hours.value,
    groups
  });
}

function applySetup(next, { rerenderForm = false } = {}) {
  setup = next;
  milestones = milestonesFor(setup.currency);
  lastMilestone = currentMilestone(costAt(watch.elapsed(), setup), milestones);
  showMilestone(lastMilestone, false);
  store.saveSetup(setup);
  syncUrl();
  if (rerenderForm) renderForm();
  lastRendered = { counter: '', elapsed: '', hue: -1 };
  renderTicker();
}

el.form.addEventListener('input', (e) => {
  if (e.target === el.title) {
    renderStageTitle();
    persistSession();
    return;
  }
  const advanced = el.form.mode.value === 'advanced';
  el.simpleFields.hidden = advanced;
  el.advancedFields.hidden = !advanced;
  applySetup(readForm());
});
el.form.addEventListener('submit', (e) => e.preventDefault());

el.addGroup.addEventListener('click', () => {
  const next = readForm();
  next.groups.push({ role: '', count: 1, salary: next.salary });
  applySetup(next, { rerenderForm: true });
  el.groupsBody.querySelector('tr:last-child input')?.focus();
});

el.groupsBody.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action="remove"]');
  if (!btn) return;
  const index = Number(btn.closest('tr').dataset.index);
  const next = readForm();
  next.groups.splice(index, 1);
  applySetup(next, { rerenderForm: true });
  el.addGroup.focus();
});

/* ---------- Ticker rendering ---------- */
function renderStageTitle() {
  const t = el.title.value.trim();
  el.stageTitle.textContent = t;
  el.stageTitle.hidden = !t;
}

function showMilestone(m, animate) {
  el.milestone.textContent = m ? m.message : '';
  if (animate) {
    el.milestone.classList.remove('pop');
    void el.milestone.offsetWidth; // restart CSS animation
    el.milestone.classList.add('pop');
  }
}

function renderTicker() {
  const ms = watch.elapsed();
  const cost = costAt(ms, setup);
  const perHour = costPerHour(setup);

  const counterText = formatMoney(cost, setup.currency);
  if (counterText !== lastRendered.counter) {
    el.counter.textContent = counterText;
    lastRendered.counter = counterText;
  }
  const clock = formatClock(ms);
  if (clock !== lastRendered.elapsed) {
    el.elapsed.textContent = clock;
    lastRendered.elapsed = clock;
    // Update the accessible label at most once a second instead of every frame.
    el.counter.setAttribute('aria-label', `Meeting cost ${counterText}, elapsed ${clock}`);
  }
  const hue = costHue(cost, perHour);
  if (hue !== lastRendered.hue) {
    el.stage.style.setProperty('--cost-hue', String(hue));
    lastRendered.hue = hue;
  }
  el.people.textContent = String(headcount(setup));
  el.rate.textContent = formatMoney(perHour, setup.currency, 0);

  const m = currentMilestone(cost, milestones);
  if (m !== lastMilestone) {
    lastMilestone = m;
    showMilestone(m, true);
  }
}

function loop() {
  renderTicker();
  rafId = watch.running ? requestAnimationFrame(loop) : 0;
}

function renderControls() {
  el.start.textContent = watch.running ? 'Pause' : watch.elapsed() > 0 ? 'Resume' : 'Start';
  el.start.classList.toggle('btn-primary', !watch.running);
  el.stage.classList.toggle('running', watch.running);
  const hasTime = watch.elapsed() > 0;
  el.reset.disabled = !hasTime;
  el.save.disabled = !hasTime;
}

/* ---------- Timer controls ---------- */
el.start.addEventListener('click', () => {
  if (watch.running) {
    watch.pause();
  } else {
    watch.start();
    if (!rafId) rafId = requestAnimationFrame(loop);
  }
  persistSession();
  renderControls();
  renderTicker();
});

el.reset.addEventListener('click', () => {
  watch.reset();
  lastMilestone = null;
  showMilestone(null, false);
  persistSession();
  renderControls();
  renderTicker();
  toast('Timer reset.');
});

el.save.addEventListener('click', () => {
  watch.pause();
  const ms = watch.elapsed();
  if (ms <= 0) return;
  const entry = store.sanitizeEntry({
    date: new Date(Date.now() - ms).toISOString(),
    title: el.title.value.trim(),
    durationMs: ms,
    attendees: headcount(setup),
    cost: costAt(ms, setup),
    currency: setup.currency
  });
  history.unshift(entry);
  store.saveHistory(history);
  renderHistory();
  const summary = currentSummary();
  watch.reset();
  lastMilestone = null;
  showMilestone(null, false);
  persistSession();
  renderControls();
  renderTicker();
  toast(`Saved. ${summary}`);
});

function currentSummary() {
  const ms = watch.elapsed();
  return buildSummary({
    elapsedMs: ms,
    people: headcount(setup),
    cost: costAt(ms, setup),
    currency: setup.currency,
    title: el.title.value.trim()
  });
}

el.copySummary.addEventListener('click', async () => {
  const text = currentSummary();
  toast((await copyText(text)) ? `Copied: ${text}` : text);
});

el.copyLink.addEventListener('click', async () => {
  toast((await copyText(shareUrl())) ? 'Setup link copied.' : shareUrl());
});

/* ---------- Presentation mode ---------- */
function isPresenting() {
  return document.fullscreenElement === el.stage || el.stage.classList.contains('presenting');
}

function updatePresentButton() {
  const on = isPresenting();
  el.present.setAttribute('aria-pressed', String(on));
  el.present.textContent = on ? 'Exit presentation' : 'Presentation mode';
  document.body.classList.toggle('is-presenting', on);
}

async function togglePresentation() {
  if (isPresenting()) {
    if (document.fullscreenElement) await document.exitFullscreen().catch(() => {});
    el.stage.classList.remove('presenting');
  } else if (el.stage.requestFullscreen) {
    try {
      await el.stage.requestFullscreen();
    } catch {
      el.stage.classList.add('presenting'); // CSS fallback (e.g. iOS Safari)
    }
  } else {
    el.stage.classList.add('presenting');
  }
  updatePresentButton();
}

el.present.addEventListener('click', togglePresentation);
document.addEventListener('fullscreenchange', updatePresentButton);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && el.stage.classList.contains('presenting')) {
    el.stage.classList.remove('presenting');
    updatePresentButton();
  }
});

/* ---------- History ---------- */
const dateFmt = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });

function renderHistory() {
  el.historyBody.replaceChildren(
    ...history.map((h) => {
      const tr = document.createElement('tr');
      const cells = [
        dateFmt.format(new Date(h.date)),
        h.title || '-',
        formatClock(h.durationMs),
        String(h.attendees),
        formatMoney(h.cost, h.currency)
      ];
      for (const text of cells) {
        const td = document.createElement('td');
        td.textContent = text;
        tr.appendChild(td);
      }
      const td = document.createElement('td');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-ghost btn-small';
      btn.textContent = 'Delete';
      btn.dataset.id = h.id;
      btn.setAttribute('aria-label', `Delete meeting from ${cells[0]}`);
      td.appendChild(btn);
      tr.appendChild(td);
      return tr;
    })
  );
  const empty = history.length === 0;
  el.historyEmpty.hidden = !empty;
  el.historyTable.hidden = empty;

  // Total to date, per currency (we never convert recorded costs).
  const totals = {};
  for (const h of history) totals[h.currency] = (totals[h.currency] ?? 0) + h.cost;
  const parts = Object.entries(totals).map(([c, v]) => formatMoney(v, c, 0));
  el.historyTotal.textContent = empty
    ? ''
    : `Total cost to date: ${parts.join(' + ')} across ${history.length} meeting${history.length === 1 ? '' : 's'}.`;
}

el.historyBody.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-id]');
  if (!btn) return;
  history = history.filter((h) => h.id !== btn.dataset.id);
  store.saveHistory(history);
  renderHistory();
  toast('Meeting deleted.');
});

/* ---------- Export / import / reset ---------- */
el.exportBtn.addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(store.buildExport(setup, history), null, 2)], {
    type: 'application/json'
  });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `burnrate-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  toast('Export downloaded.');
});

el.importBtn.addEventListener('click', () => el.importFile.click());
el.importFile.addEventListener('change', async () => {
  const file = el.importFile.files?.[0];
  el.importFile.value = '';
  if (!file) return;
  try {
    const data = store.parseImport(await file.text());
    // Merge history by id so importing the same file twice doesn't duplicate.
    const ids = new Set(history.map((h) => h.id));
    history = [...history, ...data.history.filter((h) => !ids.has(h.id))].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
    store.saveHistory(history);
    if (data.setup) applySetup(normalizeSetup(data.setup), { rerenderForm: true });
    renderHistory();
    toast(`Imported ${data.history.length} meeting${data.history.length === 1 ? '' : 's'}.`);
  } catch (err) {
    toast(`Import failed: ${err.message}`);
  }
});

el.resetAll.addEventListener('click', () => {
  if (typeof el.dialog.showModal === 'function') {
    el.dialog.returnValue = '';
    el.dialog.showModal();
  } else if (window.confirm('Reset all data? This cannot be undone.')) {
    resetEverything();
  }
});

el.dialog.addEventListener('close', () => {
  if (el.dialog.returnValue === 'confirm') resetEverything();
  el.resetAll.focus();
});

function resetEverything() {
  store.clearAll();
  watch.reset();
  history = [];
  el.title.value = '';
  renderStageTitle();
  applySetup(normalizeSetup({}), { rerenderForm: true });
  store.clearAll(); // applySetup re-saved defaults; leave storage truly empty
  lastMilestone = null;
  showMilestone(null, false);
  renderHistory();
  renderControls();
  toast('All data reset.');
}

/* ---------- Boot ---------- */
fillCurrencyOptions();
renderForm();
renderStageTitle();
applySetup(setup);
renderHistory();
renderControls();
if (watch.running) rafId = requestAnimationFrame(loop);

// Re-render immediately when returning to a backgrounded tab.
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) renderTicker();
});

/* ---------- Version + feedback ---------- */
const APP_VERSION = typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : '';
if (APP_VERSION) $('app-version').textContent = `v${APP_VERSION}`;
// Only the app version and browser user agent go into the URL - never meeting data.
const feedbackInfo = { version: APP_VERSION, userAgent: navigator.userAgent };
$('fb-bug').href = buildIssueUrl('bug', feedbackInfo);
$('fb-feature').href = buildIssueUrl('feature', feedbackInfo);
document.addEventListener('keydown', (e) => {
  const fb = $('feedback');
  if (e.key === 'Escape' && fb.open) {
    fb.open = false;
    fb.querySelector('summary').focus();
  }
});
