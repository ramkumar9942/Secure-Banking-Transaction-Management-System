const API_BASE = 'http://localhost:8080/api/accounts';

const $ = selector => document.querySelector(selector);
const $all = selector => document.querySelectorAll(selector);

const msgEl = $('#message');
const tableBody = document.querySelector('#accounts-table tbody');
const createForm = $('#create-form');
const editSection = $('#edit-section');
const editForm = $('#edit-form');
const cancelEditBtn = $('#cancel-edit');
const accountCountEl = document.getElementById('account-count');
const totalBalanceEl = document.getElementById('total-balance');

// add entrance class so CSS animations run after load
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => document.body.classList.add('loaded'), 120);
  // subtle float on logo
  const logo = document.querySelector('.logo');
  if (logo) logo.classList.add('float');

  // nav pills: scroll / focus sections for a dashboard feel
  document.querySelectorAll('.nav-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const targetId = btn.dataset.section;
      const section = document.getElementById(targetId);
      section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      section?.focus?.();
    });
  });

  // wire API status elements and retry button now DOM is ready
  apiStatusEl = document.getElementById('api-status');
  apiStatusText = document.getElementById('api-status-text');
  const retryBtnNow = document.getElementById('retry-api');
  retryBtnNow?.addEventListener('click', async () => {
    const ok = await checkBackend();
    if (ok) {
      fetchAccounts();
      showMessage('Backend reachable — refreshed accounts.');
    }
  });

  // check backend availability and CORS hints
  checkBackend().then(ok => {
    if (ok) fetchAccounts();
  });
});

/**
 * API status helpers
 */
let apiStatusEl = null;
let apiStatusText = null;

function setApiStatus(text, ok = true) {
  // query elements if not yet wired (defensive)
  apiStatusEl = apiStatusEl || document.getElementById('api-status');
  apiStatusText = apiStatusText || document.getElementById('api-status-text');
  if (!apiStatusEl || !apiStatusText) return;
  apiStatusText.textContent = text;
  apiStatusEl.classList.remove('hidden');
  if (ok) {
    apiStatusEl.style.borderColor = 'rgba(11,132,87,0.08)';
    apiStatusEl.style.background = 'rgba(11,132,87,0.04)';
  } else {
    apiStatusEl.style.borderColor = 'rgba(185,28,28,0.12)';
    apiStatusEl.style.background = 'rgba(185,28,28,0.04)';
  }
}

/**
 * Try a lightweight request to the API to detect whether the backend is reachable
 * or if requests from the browser may be blocked by CORS.
 * Returns true when backend responded; false otherwise. Shows user-friendly
 * messages in the UI explaining what might be wrong.
 */
async function checkBackend() {
  try {
    const res = await fetch(API_BASE, { method: 'GET' });
    // if the server responds with 2xx/4xx/5xx we consider it reachable
    if (res) {
      setApiStatus('Backend reachable', true);
      // clear any global error message
      msgEl.textContent = '';
      return true;
    }
  } catch (err) {
    const isOnline = navigator.onLine;
    if (!isOnline) {
      setApiStatus('No network connection', false);
      showMessage('You appear offline. Check your network connection.', true);
    } else {
      setApiStatus('Cannot reach backend (server down or CORS blocked)', false);
      showMessage('Cannot reach backend at ' + API_BASE + '. Make sure the Spring Boot app is running (\'Backend/bankingapp\') and that the server allows requests from this origin (CORS).', true);
    }
    return false;
  }
}

async function fetchAccounts() {
  try {
    if (accountCountEl) accountCountEl.textContent = '…';
    if (totalBalanceEl) totalBalanceEl.textContent = '…';
    const res = await fetch(API_BASE);
    checkStatus(res);
    const accounts = await res.json();
    renderAccounts(accounts);
    updateSummary(accounts);
    setApiStatus('Backend reachable', true);
  } catch (err) {
    setApiStatus('Failed to load accounts', false);
    showMessage(err.message, true);
  }
}

function updateSummary(accounts = []) {
  if (!Array.isArray(accounts)) return;
  const count = accounts.length;
  const total = accounts.reduce((sum, a) => {
    const val = Number(a.balance ?? 0);
    return sum + (Number.isFinite(val) ? val : 0);
  }, 0);
  if (accountCountEl) accountCountEl.textContent = String(count);
  if (totalBalanceEl) {
    totalBalanceEl.textContent = total.toLocaleString(undefined, {
      style: 'currency',
      currency: 'USD'
    });
  }
}

function renderAccounts(accounts) {
  tableBody.innerHTML = '';
  if (!accounts.length) {
    tableBody.innerHTML = '<tr><td colspan="7">No accounts found.</td></tr>';
    return;
  }
  accounts.forEach(a => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(a.id)}</td>
      <td>${escapeHtml(a.accountNumber || '')}</td>
      <td>${escapeHtml(a.ownerName)}</td>
      <td>${escapeHtml(a.email || '')}</td>
      <td>${escapeHtml(a.balance)}</td>
      <td>${escapeHtml(formatDate(a.createdAt))}</td>
      <td class="actions">
        <button data-id="${a.id}" class="view">View</button>
        <button data-id="${a.id}" class="edit">Edit</button>
        <button data-id="${a.id}" class="delete">Delete</button>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

function formatDate(iso) {
  if (!iso) return '';
  try { return new Date(iso).toLocaleString(); } catch(e) { return iso; }
}

function escapeHtml(s) {
  if (s === null || s === undefined) return '';
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function showMessage(text, isError = false) {
  msgEl.textContent = text;
  msgEl.className = isError ? 'error' : 'success';
  // briefly pulse the logo on success
  if (!isError) {
    const logo = document.querySelector('.logo');
    if (logo) {
      logo.classList.add('pulse');
      setTimeout(() => logo.classList.remove('pulse'), 900);
    }
  }
  setTimeout(() => { msgEl.textContent = ''; msgEl.className = ''; }, 4000);
}

function checkStatus(res) {
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res;
}

function clearFieldErrors(form) {
  form.querySelectorAll('.field-error').forEach(el => el.textContent = '');
}

function setFieldError(form, fieldName, message) {
  const el = form.querySelector(`.field-error[data-for="${fieldName}"]`);
  if (el) el.textContent = message;
}

createForm.addEventListener('submit', async e => {
  e.preventDefault();
  const form = e.target;
  clearFieldErrors(form);

  const ownerName = form.ownerName.value.trim();
  const email = form.email.value.trim();
  const initialDepositRaw = form.initialDeposit.value.trim();

  let hasError = false;
  if (!ownerName) { setFieldError(form, 'ownerName', 'Owner name is required'); hasError = true; }
  if (!initialDepositRaw) { setFieldError(form, 'initialDeposit', 'Initial deposit is required'); hasError = true; }
  const initialDeposit = initialDepositRaw ? parseFloat(initialDepositRaw) : NaN;
  if (Number.isNaN(initialDeposit) || initialDeposit < 0) { setFieldError(form, 'initialDeposit', 'Enter a valid amount ≥ 0'); hasError = true; }
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { setFieldError(form, 'email', 'Enter a valid email'); hasError = true; }
  if (hasError) return;

  const data = { ownerName, email: email || null, initialDeposit };

  const btn = $('#create-btn');
  btn.disabled = true; btn.textContent = 'Creating...';
  try {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (res.status === 201) {
      const created = await res.json();
      showMessage('Account created: ' + created.id);
      form.reset();
      fetchAccounts();
    } else if (res.status === 400) {
      // try to parse validation errors from backend
      try {
        const payload = await res.json();
        if (payload && payload.errors) {
          // assume { errors: { field: message } }
          Object.entries(payload.errors).forEach(([f, msg]) => setFieldError(form, f, msg));
          showMessage('Validation failed', true);
        } else if (payload && payload.message) {
          showMessage(payload.message, true);
        } else {
          showMessage('Validation failed (400)', true);
        }
      } catch (err) {
        showMessage('Validation failed (400)', true);
      }
    } else {
      // other errors
      try { const payload = await res.json(); showMessage(payload.message || res.statusText, true); }
      catch (e) { showMessage(res.status + ' ' + res.statusText, true); }
    }
  } catch (err) {
    showMessage(err.message || 'Network error', true);
    setApiStatus('Network error or CORS issue', false);
  } finally {
    btn.disabled = false; btn.textContent = 'Create Account';
  }
});

// Delegate actions from table
tableBody.addEventListener('click', async (e) => {
  const id = e.target.closest('button')?.dataset?.id;
  if (!id) return;
  if (e.target.classList.contains('view')) {
    await viewAccount(id);
  } else if (e.target.classList.contains('edit')) {
    await startEdit(id);
  } else if (e.target.classList.contains('delete')) {
    if (!confirm('Delete account ' + id + '?')) return;
    await deleteAccount(id);
  }
});

async function viewAccount(id) {
  try {
    const res = await fetch(`${API_BASE}/${id}`);
    checkStatus(res);
    const a = await res.json();
    alert(`Account ${a.id} (\nOwner: ${a.ownerName}\nEmail: ${a.email || ''}\nBalance: ${a.balance}\nCreated: ${formatDate(a.createdAt)}\n)`);
  } catch (err) {
    showMessage(err.message, true);
  }
}

async function startEdit(id) {
  try {
    const res = await fetch(`${API_BASE}/${id}`);
    checkStatus(res);
    const a = await res.json();
    editForm.id.value = a.id;
    editForm.ownerName.value = a.ownerName;
    editForm.email.value = a.email ?? '';
    editSection.classList.remove('hidden');
    editForm.ownerName.focus();
  } catch (err) {
    showMessage(err.message, true);
  }
}

editForm.addEventListener('submit', async e => {
  e.preventDefault();
  const form = editForm;
  clearFieldErrors(form);
  const id = form.id.value;
  const ownerName = form.ownerName.value.trim();
  const email = form.email.value.trim();
  let hasError = false;
  if (!ownerName) { setFieldError(form, 'ownerName', 'Owner name is required'); hasError = true; }
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { setFieldError(form, 'email', 'Enter a valid email'); hasError = true; }
  if (hasError) return;

  const data = { ownerName, email: email || null };
  const btn = $('#save-btn');
  btn.disabled = true; btn.textContent = 'Saving...';
  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (res.ok) {
      const updated = await res.json();
      showMessage('Account updated: ' + updated.id);
      editSection.classList.add('hidden');
      form.reset();
      fetchAccounts();
    } else if (res.status === 400) {
      try {
        const payload = await res.json();
        if (payload && payload.errors) {
          Object.entries(payload.errors).forEach(([f, msg]) => setFieldError(form, f, msg));
          showMessage('Validation failed', true);
        } else showMessage(payload.message || 'Validation failed', true);
      } catch (err) { showMessage('Validation failed', true); }
    } else {
      try { const payload = await res.json(); showMessage(payload.message || res.statusText, true); }
      catch (e) { showMessage(res.status + ' ' + res.statusText, true); }
    }
  } catch (err) {
    showMessage(err.message || 'Network error', true);
    setApiStatus('Network error or CORS issue', false);
  } finally {
    btn.disabled = false; btn.textContent = 'Save';
  }
});

cancelEditBtn.addEventListener('click', () => {
  editSection.classList.add('hidden');
  editForm.reset();
});

async function deleteAccount(id) {
  try {
    const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    if (res.status === 204) {
      showMessage('Account deleted: ' + id);
      fetchAccounts();
    } else if (res.status === 404) {
      showMessage('Account not found: ' + id, true);
      fetchAccounts();
    } else {
      try { const payload = await res.json(); showMessage(payload.message || res.statusText, true); }
      catch (e) { showMessage(res.status + ' ' + res.statusText, true); }
    }
  } catch (err) {
    showMessage(err.message || 'Network error', true);
    setApiStatus('Network error or CORS issue', false);
  }
}

// bootstrap
// use checkBackend to verify API then load accounts
checkBackend();