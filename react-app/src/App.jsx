import React, { useEffect, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080/api/accounts';

export default function App() {
  const [accounts, setAccounts] = useState([]);
  const [status, setStatus] = useState('Checking backend...');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const [createForm, setCreateForm] = useState({ ownerName: '', email: '', initialDeposit: '' });
  const [createErrors, setCreateErrors] = useState({});

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ ownerName: '', email: '' });
  const [editErrors, setEditErrors] = useState({});

  const [activeScreen, setActiveScreen] = useState('create'); // 'create' | 'accounts'
  const [selectedAccount, setSelectedAccount] = useState(null);

  useEffect(() => {
    checkBackend();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function checkBackend() {
    try {
      const res = await fetch(API_BASE, { method: 'GET' });
      if (res) {
        setStatus('Backend reachable');
        setIsError(false);
        setMessage('');
        fetchAccounts();
      }
    } catch (err) {
      setStatus('Cannot reach backend');
      setIsError(true);
      setMessage('Cannot reach backend at ' + API_BASE + '. Make sure the Spring Boot app is running and CORS is enabled.');
    }
  }

  async function fetchAccounts() {
    try {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const data = await res.json();
      setAccounts(Array.isArray(data) ? data : []);
    } catch (err) {
      setMessage(err.message || 'Failed to load accounts');
      setIsError(true);
    }
  }

  function clearMessages() {
    setMessage('');
    setIsError(false);
  }

  function viewAccount(a) {
    setSelectedAccount(a);
  }

  function clearView() {
    setSelectedAccount(null);
  }

  function validateCreate() {
    const errs = {};
    if (!createForm.ownerName.trim()) errs.ownerName = 'Owner name is required';
    const depositRaw = createForm.initialDeposit.trim();
    if (!depositRaw) errs.initialDeposit = 'Initial deposit is required';
    const deposit = parseFloat(depositRaw);
    if (Number.isNaN(deposit) || deposit < 0) errs.initialDeposit = 'Enter a valid amount ≥ 0';
    if (createForm.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(createForm.email)) errs.email = 'Enter a valid email';
    setCreateErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleCreate(e) {
    e.preventDefault();
    clearMessages();
    if (!validateCreate()) return;
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerName: createForm.ownerName.trim(),
          email: createForm.email.trim() || null,
          initialDeposit: parseFloat(createForm.initialDeposit)
        })
      });
      if (res.status === 201) {
        const created = await res.json();
        setMessage('Account created: ' + created.id);
        setIsError(false);
        setCreateForm({ ownerName: '', email: '', initialDeposit: '' });
        fetchAccounts();
        setActiveScreen('accounts');
      } else if (res.status === 400) {
        const payload = await res.json().catch(() => null);
        setMessage((payload && payload.message) || 'Validation failed');
        setIsError(true);
      } else {
        const payload = await res.json().catch(() => null);
        setMessage((payload && payload.message) || `${res.status} ${res.statusText}`);
        setIsError(true);
      }
    } catch (err) {
      setMessage(err.message || 'Network error');
      setIsError(true);
    }
  }

  function startEdit(a) {
    setEditingId(a.id);
    setEditForm({ ownerName: a.ownerName || '', email: a.email || '' });
    setEditErrors({});
    setActiveScreen('create'); // reuse form screen for editing
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({ ownerName: '', email: '' });
    setEditErrors({});
  }

  function validateEdit() {
    const errs = {};
    if (!editForm.ownerName.trim()) errs.ownerName = 'Owner name is required';
    if (editForm.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(editForm.email)) errs.email = 'Enter a valid email';
    setEditErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function saveEdit(e) {
    e.preventDefault();
    clearMessages();
    if (!validateEdit()) return;
    try {
      const res = await fetch(`${API_BASE}/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownerName: editForm.ownerName.trim(), email: editForm.email.trim() || null })
      });
      if (res.ok) {
        const updated = await res.json();
        setMessage('Account updated: ' + updated.id);
        setIsError(false);
        cancelEdit();
        fetchAccounts();
        setActiveScreen('accounts');
      } else if (res.status === 400) {
        const payload = await res.json().catch(() => null);
        setMessage((payload && payload.message) || 'Validation failed');
        setIsError(true);
      } else {
        const payload = await res.json().catch(() => null);
        setMessage((payload && payload.message) || `${res.status} ${res.statusText}`);
        setIsError(true);
      }
    } catch (err) {
      setMessage(err.message || 'Network error');
      setIsError(true);
    }
  }

  async function deleteAccount(id) {
    if (!confirm('Delete account ' + id + '?')) return;
    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
      if (res.status === 204) {
        setMessage('Account deleted: ' + id);
        setIsError(false);
        fetchAccounts();
      } else {
        const payload = await res.json().catch(() => null);
        setMessage((payload && payload.message) || `${res.status} ${res.statusText}`);
        setIsError(true);
      }
    } catch (err) {
      setMessage(err.message || 'Network error');
      setIsError(true);
    }
  }

  const totalBalance = accounts.reduce((sum, a) => sum + (a.balance || 0), 0);

  return (
    <div className="app-root">
      <header className="site-header centered">
        <div className="brand">
          <div className="logo" aria-hidden="true">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <rect x="2" y="3" width="20" height="18" rx="3" fill="var(--secure-color)"/>
              <path d="M12 7l4 4-4 4-4-4 4-4z" fill="#fff" />
            </svg>
          </div>
          <div className="brand-text">
            <h1>RK Union Bank</h1>
            <p className="tagline">Secure • Reliable • Local</p>
          </div>
        </div>
      </header>

      <main>
        <div className="center-wrap single-col">
          <div className="top-tabs" role="tablist" aria-label="Primary sections">
            <button
              className={`nav-pill ${activeScreen === 'create' ? 'active' : ''}`}
              onClick={() => { setActiveScreen('create'); cancelEdit(); }}
              role="tab"
              aria-selected={activeScreen === 'create'}
            >
              {editingId ? 'Edit Account' : 'Create Account'}
            </button>
            <button
              className={`nav-pill ${activeScreen === 'accounts' ? 'active' : ''}`}
              onClick={() => setActiveScreen('accounts')}
              role="tab"
              aria-selected={activeScreen === 'accounts'}
            >
              Your Accounts
            </button>
          </div>

          <section className="hero">
            <h2>{activeScreen === 'create' ? (editingId ? 'Edit account details' : 'Open a new account') : 'Your accounts overview'}</h2>
            <p className="sub">Banking made simple — your funds are safe with us.</p>
            <div className="api-status" role="status" aria-live="polite">
              <span>{status}</span>
            </div>
            {message && <div id="message" className={isError ? 'error' : 'success'}>{message}</div>}
          </section>

          {activeScreen === 'create' && (
            <section className="card">
              <h3>{editingId ? 'Edit Account' : 'Create an Account'}</h3>
              <form onSubmit={editingId ? saveEdit : handleCreate} noValidate>
                <label>Owner name
                  <input type="text" name="ownerName"
                    value={editingId ? editForm.ownerName : createForm.ownerName}
                    onChange={e => editingId
                      ? setEditForm({ ...editForm, ownerName: e.target.value })
                      : setCreateForm({ ...createForm, ownerName: e.target.value })}
                    required />
                  <div className="field-error">{editingId ? editErrors.ownerName : createErrors.ownerName}</div>
                </label>
                <label>Email
                  <input type="email" name="email"
                    value={editingId ? editForm.email : createForm.email}
                    onChange={e => editingId
                      ? setEditForm({ ...editForm, email: e.target.value })
                      : setCreateForm({ ...createForm, email: e.target.value })} />
                  <div className="field-error">{editingId ? editErrors.email : createErrors.email}</div>
                </label>
                {!editingId && (
                  <label>Initial deposit
                    <input type="number" name="initialDeposit" step="0.01"
                      value={createForm.initialDeposit}
                      onChange={e => setCreateForm({ ...createForm, initialDeposit: e.target.value })}
                      required />
                    <div className="field-error">{createErrors.initialDeposit}</div>
                  </label>
                )}
                <div className="form-actions">
                  <button type="submit" id={editingId ? 'save-btn' : 'create-btn'}>
                    {editingId ? 'Save changes' : 'Create Account'}
                  </button>
                  {editingId && <button type="button" onClick={cancelEdit}>Cancel</button>}
                </div>
              </form>
            </section>
          )}

          {activeScreen === 'accounts' && (
            <section className="card">
              <h3>Your Accounts</h3>
              <div className="summary-row">
                <div className="summary-chip">
                  <span className="summary-label">Total accounts</span>
                  <span className="summary-value">{accounts.length}</span>
                </div>
                <div className="summary-chip">
                  <span className="summary-label">Total balance</span>
                  <span className="summary-value">US${totalBalance.toFixed(2)}</span>
                </div>
              </div>
              <div className="table-wrap">
                <table id="accounts-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Account #</th>
                      <th>Owner</th>
                      <th>Email</th>
                      <th>Balance</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.length === 0 && <tr><td colSpan="7">No accounts found.</td></tr>}
                    {accounts.map(a => (
                      <tr key={a.id}>
                        <td>{a.id}</td>
                        <td>{a.accountNumber || ''}</td>
                        <td>{a.ownerName}</td>
                        <td>{a.email || ''}</td>
                        <td>{String(a.balance)}</td>
                        <td>{a.createdAt ? new Date(a.createdAt).toLocaleString() : ''}</td>
                        <td className="actions">
                          <button onClick={() => viewAccount(a)} className="view">View</button>
                          <button onClick={() => startEdit(a)} className="edit">Edit</button>
                          <button onClick={() => deleteAccount(a.id)} className="delete">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {selectedAccount && (
                <div className="detail-box">
                  <div className="detail-head">
                    <h4>Account details</h4>
                    <button className="link-btn" type="button" onClick={clearView}>Close</button>
                  </div>
                  <div className="detail-grid">
                    <div><span className="label">ID</span><span>{selectedAccount.id}</span></div>
                    <div><span className="label">Account #</span><span>{selectedAccount.accountNumber || '—'}</span></div>
                    <div><span className="label">Owner</span><span>{selectedAccount.ownerName}</span></div>
                    <div><span className="label">Email</span><span>{selectedAccount.email || '—'}</span></div>
                    <div><span className="label">Balance</span><span>{selectedAccount.balance}</span></div>
                    <div><span className="label">Created</span><span>{selectedAccount.createdAt ? new Date(selectedAccount.createdAt).toLocaleString() : '—'}</span></div>
                  </div>
                </div>
              )}
            </section>
          )}

          <footer className="footer-note">
            <small>If you see CORS errors, try running the app via a local dev server or confirm the backend CORS policy.</small>
          </footer>
        </div>
      </main>
    </div>
  );
}