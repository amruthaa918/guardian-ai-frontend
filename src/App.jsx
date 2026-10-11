import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import axios from 'axios';
import { AlertCircle, Shield, Users, MapPin, LayoutDashboard, LogOut, Navigation, CheckCircle, XCircle, Clock } from 'lucide-react';

axios.defaults.baseURL = `${import.meta.env.VITE_API_BASE_URL}/api`;

const setAuthToken = token => {
  if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  else delete axios.defaults.headers.common['Authorization'];
};

export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user?.token) setAuthToken(user.token);
  }, [user]);

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setAuthToken(null);
    navigate('/login');
  };

  if (!user && location.pathname !== '/register' && location.pathname !== '/login') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className={user ? 'app-container' : ''}>
      {user && (
        <aside className="sidebar">
          <h2><Shield /> Guardian AI</h2>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}><LayoutDashboard size={20} /> Dashboard</Link>
            <Link to="/sos" className={`nav-link ${location.pathname === '/sos' ? 'active' : ''}`}><AlertCircle size={20} /> SOS Alerts</Link>
            <Link to="/contacts" className={`nav-link ${location.pathname === '/contacts' ? 'active' : ''}`}><Users size={20} /> Trusted Contacts</Link>
            <Link to="/journey" className={`nav-link ${location.pathname === '/journey' ? 'active' : ''}`}><MapPin size={20} /> Journey Mode</Link>
            <Link to="/location" className={`nav-link ${location.pathname === '/location' ? 'active' : ''}`}><Navigation size={20} /> Location</Link>
            <button onClick={logout} className="nav-link" style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', marginTop: 'auto' }}><LogOut size={20} /> Logout</button>
          </nav>
        </aside>
      )}

      <main className={user ? 'main-content' : ''}>
        <Routes>
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Dashboard user={user} />} />
          <Route path="/sos" element={<SOS />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/journey" element={<Journey />} />
          <Route path="/location" element={<LocationPage />} />
        </Routes>
      </main>
    </div>
  );
}

/* ───────── AUTH ───────── */

function Login({ setUser }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await axios.post('/auth/login', form);
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Welcome Back</h2>
        {error && <div className="alert-message alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-input" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" className="form-input" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px', justifyContent: 'center' }}>Login</button>
        </form>
        <p style={{ marginTop: '20px', textAlign: 'center' }}>Don&apos;t have an account? <Link to="/register" style={{ color: 'var(--accent)' }}>Register</Link></p>
      </div>
    </div>
  );
}

function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [msg, setMsg] = useState('');
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setMsg('');
    try {
      await axios.post('/auth/register', form);
      setIsError(false);
      setMsg('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setIsError(true);
      setMsg(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Create Account</h2>
        {msg && <div className={`alert-message ${isError ? 'alert-error' : 'alert-success'}`}>{msg}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label className="form-label">Name</label><input type="text" className="form-input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Email</label><input type="email" className="form-input" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Phone</label><input type="text" className="form-input" required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Password</label><input type="password" className="form-input" required minLength="6" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px', justifyContent: 'center' }}>Register</button>
        </form>
        <p style={{ marginTop: '20px', textAlign: 'center' }}>Already have an account? <Link to="/login" style={{ color: 'var(--accent)' }}>Login</Link></p>
      </div>
    </div>
  );
}

/* ───────── DASHBOARD ───────── */

function Dashboard({ user }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/dashboard')
      .then(res => setData(res.data))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1 style={{ color: 'var(--primary)', marginBottom: '8px' }}>Hello, {data?.userName || user?.name || 'User'}</h1>
          <p style={{ color: 'var(--text-muted)' }}>Stay safe with Guardian AI</p>
        </div>
        <div style={{ padding: '8px 16px', borderRadius: '20px', background: data?.safetyStatus === 'SAFE' ? '#d1fae5' : '#fef3c7', color: data?.safetyStatus === 'SAFE' ? '#047857' : '#92400e', fontWeight: 600 }}>
          {data?.safetyStatus || 'UNKNOWN'}
        </div>
      </div>

      <div className="grid">
        <div className="card">
          <h3 className="card-title">Safety Status</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: data?.safetyStatus === 'SAFE' ? 'var(--accent)' : 'var(--sos)' }}>
            {data?.safetyStatus || '—'}
          </p>
        </div>
        <div className="card">
          <h3 className="card-title">Trusted Contacts</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent)' }}>{data?.trustedContactsCount ?? 0}</p>
        </div>
        <div className="card">
          <h3 className="card-title">Pending Check-ins</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{data?.pendingCheckIns ?? 0}</p>
        </div>
      </div>

      <div className="grid" style={{ marginTop: '10px' }}>
        {data?.activeJourney && (
          <div className="card" style={{ borderLeft: '4px solid var(--accent)' }}>
            <h3 className="card-title">Active Journey</h3>
            <p><strong>{data.activeJourney.startLocation}</strong> → <strong>{data.activeJourney.destination}</strong></p>
            <small style={{ color: 'var(--text-muted)' }}>Expected: {data.activeJourney.expectedArrival ? new Date(data.activeJourney.expectedArrival).toLocaleString() : 'N/A'}</small>
          </div>
        )}
        {data?.latestEmergency && (
          <div className="card" style={{ borderLeft: '4px solid var(--sos)' }}>
            <h3 className="card-title">Latest Emergency</h3>
            <p><strong>{data.latestEmergency.alertType}</strong> — {data.latestEmergency.status}</p>
            <small style={{ color: 'var(--text-muted)' }}>{data.latestEmergency.createdAt ? new Date(data.latestEmergency.createdAt).toLocaleString() : ''}</small>
          </div>
        )}
      </div>
    </div>
  );
}

/* ───────── SOS ───────── */

function SOS() {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [deliveryStatuses, setDeliveryStatuses] = useState([]);
  const [history, setHistory] = useState([]);

  const fetchHistory = useCallback(() => {
    axios.get('/emergency/history').then(res => setHistory(res.data)).catch(() => { });
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const triggerSOS = () => {
    if (!confirm) {
      setConfirm(true);
      setDeliveryStatuses([]);
      return;
    }
    setLoading(true);
    setStatus('Acquiring device GPS coordinates...');
    setDeliveryStatuses([]);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setStatus(`Acquired GPS coordinates (${lat.toFixed(4)}, ${lng.toFixed(4)}). Dispatching emergency alert...`);
          sendAlert(lat, lng);
        },
        error => {
          console.warn('Geolocation acquisition error:', error);
          setStatus('GPS location unavailable or permission denied. Dispatching emergency alert without coordinates...');
          sendAlert(null, null);
        },
        { timeout: 10000, enableHighAccuracy: true, maximumAge: 0 }
      );
    } else {
      setStatus('Geolocation not supported by browser. Dispatching emergency alert...');
      sendAlert(null, null);
    }
  };

  const sendAlert = async (lat, lng) => {
    try {
      const { data } = await axios.post('/emergency/sos', {
        alertType: 'SOS',
        latitude: lat,
        longitude: lng
      });

      let rawMsg = data.message || `SOS Alert created (ID: ${data.alertId}). Status: ${data.status}`;

      // Strip any SMS-related text from the backend summary
      rawMsg = rawMsg.replace(/SMS:\s*provider not configured\.?\s*/gi, '');
      rawMsg = rawMsg.replace(/SMS:\s*\d+\s*accepted,\s*\d+\s*failed\.?\s*/gi, '');

      // Rewrite "Email: X accepted, Y failed." into a friendly message
      const emailMatch = rawMsg.match(/Email:\s*(\d+)\s*accepted,\s*(\d+)\s*failed/i);
      let cleanMsg;
      if (emailMatch) {
        const accepted = emailMatch[1];
        const failed = emailMatch[2];
        cleanMsg = `SOS alert created. Emergency email notifications queued: ${accepted} accepted, ${failed} failed.`;
      } else {
        cleanMsg = rawMsg.replace(/\s{2,}/g, ' ').trim();
      }

      setStatus(cleanMsg);
      setDeliveryStatuses(data.contactDeliveryStatuses || []);
      setConfirm(false);
      fetchHistory();
    } catch (e) {
      const msg = e.response?.data?.message || 'Failed to send SOS alert.';
      setStatus(`Error: ${msg}`);
      setDeliveryStatuses([]);
    } finally {
      setLoading(false);
    }
  };

  const resolveAlert = async id => {
    try {
      await axios.put(`/emergency/${id}/resolve`);
      fetchHistory();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to resolve alert.');
    }
  };

  return (
    <div>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ color: 'var(--primary)' }}>Emergency SOS</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '10px' }}>
          {confirm ? '⚠️ Press SOS again to confirm and send the emergency alert.' : 'Press the SOS button to alert your trusted contacts.'}
        </p>
        <button onClick={triggerSOS} disabled={loading} className="sos-btn" style={confirm ? { background: '#991b1b' } : {}}>
          {loading ? '...' : confirm ? 'CONFIRM SOS' : 'SOS'}
        </button>
        {confirm && (
          <button
            onClick={() => {
              setConfirm(false);
              setStatus('');
              setDeliveryStatuses([]);
            }}
            className="btn btn-outline"
            style={{ display: 'block', margin: '0 auto' }}
          >
            Cancel
          </button>
        )}
        {status && (
          <div className={`alert-message ${status.startsWith('Error') ? 'alert-error' : 'alert-success'}`} style={{ maxWidth: '550px', margin: '16px auto' }}>
            {status}
          </div>
        )}

        {deliveryStatuses.length > 0 && (
          <div className="card" style={{ maxWidth: '640px', margin: '20px auto', textAlign: 'left' }}>
            <h3 className="card-title" style={{ fontSize: '1.05rem', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Emergency Email Notification Status</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                {deliveryStatuses.length} {deliveryStatuses.length === 1 ? 'Contact' : 'Contacts'}
              </span>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {deliveryStatuses.map(item => (
                <div
                  key={item.contactId || item.contactName}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    borderLeft: `5px solid ${(item.emailStatus === 'ACCEPTED' || item.emailStatus === 'SENT' || item.smsStatus === 'SENT')
                      ? '#10b981'
                      : (item.emailStatus === 'FAILED' || item.smsStatus === 'FAILED')
                        ? '#ef4444'
                        : '#f59e0b'
                      }`,
                    backgroundColor: '#ffffff'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <strong style={{ fontSize: '0.95rem' }}>{item.contactName}</strong>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {/* Email Status Badge */}
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: '700',
                          padding: '2px 7px',
                          borderRadius: '5px',
                          backgroundColor:
                            (item.emailStatus === 'ACCEPTED' || item.emailStatus === 'SENT')
                              ? '#d1fae5'
                              : item.emailStatus === 'FAILED'
                                ? '#fee2e2'
                                : '#fef3c7',
                          color:
                            (item.emailStatus === 'ACCEPTED' || item.emailStatus === 'SENT')
                              ? '#065f46'
                              : item.emailStatus === 'FAILED'
                                ? '#991b1b'
                                : '#92400e'
                        }}
                      >
                        {(item.emailStatus === 'ACCEPTED' || item.emailStatus === 'SENT')
                          ? 'EMAIL QUEUED'
                          : item.emailStatus === 'FAILED'
                            ? 'EMAIL FAILED'
                            : item.emailStatus === 'NOT_CONFIGURED'
                              ? 'EMAIL UNCONFIGURED'
                              : 'NO EMAIL'}
                      </span>

                      {/* Optional SMS status only if SMS was actually active and sent/failed */}
                      {item.smsStatus && item.smsStatus !== 'NOT_CONFIGURED' && item.smsStatus !== 'NO_PHONE' && (
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: '700',
                            padding: '2px 7px',
                            borderRadius: '5px',
                            backgroundColor: item.smsStatus === 'SENT' ? '#d1fae5' : '#fee2e2',
                            color: item.smsStatus === 'SENT' ? '#065f46' : '#991b1b'
                          }}
                        >
                          {item.smsStatus === 'SENT' ? 'SMS SENT' : 'SMS FAILED'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Email Delivery Details */}
                  <div style={{ fontSize: '0.84rem', color: 'var(--text)', marginTop: '4px' }}>
                    <strong>Email:</strong> {item.email ? item.email : <span style={{ color: 'var(--text-muted)' }}>No email address</span>}
                  </div>
                  <div
                    style={{
                      fontSize: '0.82rem',
                      marginTop: '4px',
                      color:
                        (item.emailStatus === 'ACCEPTED' || item.emailStatus === 'SENT')
                          ? '#047857'
                          : item.emailStatus === 'FAILED'
                            ? '#b91c1c'
                            : '#b45309'
                    }}
                  >
                    {item.emailDetails}
                  </div>

                  {/* If SMS was explicitly attempted and succeeded/failed, display details */}
                  {item.smsStatus && item.smsStatus !== 'NOT_CONFIGURED' && item.smsStatus !== 'NO_PHONE' && (
                    <div style={{ fontSize: '0.80rem', color: 'var(--text-muted)', marginTop: '6px', borderTop: '1px dashed #e2e8f0', paddingTop: '4px' }}>
                      <strong>SMS ({item.phone}):</strong> {item.smsDetails}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: '30px' }}>
        <h3 className="card-title">Alert History</h3>
        {history.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No alerts recorded.</p>}
        {history.map(a => (
          <div key={a.alertId} className="contact-item" style={{ borderLeft: `4px solid ${a.status === 'ACTIVE' ? 'var(--sos)' : 'var(--accent)'}` }}>
            <div>
              <strong>{a.alertType}</strong> — <span style={{ color: a.status === 'ACTIVE' ? 'var(--sos)' : 'var(--accent)', fontWeight: 600 }}>{a.status}</span><br />
              <small style={{ color: 'var(--text-muted)' }}>
                {a.createdAt ? new Date(a.createdAt).toLocaleString() : ''}
                {a.latitude != null ? ` • ${a.latitude.toFixed(4)}, ${a.longitude.toFixed(4)}` : ' • No location'}
              </small>
            </div>
            {a.status === 'ACTIVE' && (
              <button onClick={() => resolveAlert(a.alertId)} className="btn btn-primary" style={{ padding: '4px 12px', fontSize: '0.85rem' }}>Resolve</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────── CONTACTS ───────── */

function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [form, setForm] = useState({ name: '', phone: '', email: '', relationship: '' });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');

  const fetchContacts = () => axios.get('/contacts').then(res => setContacts(res.data)).catch(() => { });
  useEffect(() => { fetchContacts(); }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      if (editId) {
        await axios.put(`/contacts/${editId}`, form);
        setEditId(null);
      } else {
        await axios.post('/contacts', form);
      }
      setForm({ name: '', phone: '', email: '', relationship: '' });
      fetchContacts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save contact.');
    }
  };

  const startEdit = c => {
    setEditId(c.id);
    setForm({ name: c.name, phone: c.phone, email: c.email, relationship: c.relationship || '' });
  };

  const deleteContact = async id => {
    if (window.confirm('Delete this contact?')) {
      await axios.delete(`/contacts/${id}`);
      fetchContacts();
    }
  };

  return (
    <div>
      <h2 className="card-title">Trusted Contacts</h2>
      {error && <div className="alert-message alert-error">{error}</div>}
      <div className="grid">
        <div className="card">
          <h3>{editId ? 'Edit Contact' : 'Add New Contact'}</h3>
          <form onSubmit={handleSubmit} style={{ marginTop: '16px' }}>
            <input className="form-input" style={{ marginBottom: '10px' }} placeholder="Name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <input className="form-input" style={{ marginBottom: '10px' }} placeholder="Phone (e.g. +919876543210)" required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            <input className="form-input" style={{ marginBottom: '10px' }} type="email" placeholder="Email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <input className="form-input" style={{ marginBottom: '10px' }} placeholder="Relationship (e.g. Sister)" required value={form.relationship} onChange={e => setForm({ ...form, relationship: e.target.value })} />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-primary">{editId ? 'Update' : 'Add Contact'}</button>
              {editId && <button type="button" className="btn btn-outline" onClick={() => { setEditId(null); setForm({ name: '', phone: '', email: '', relationship: '' }); }}>Cancel</button>}
            </div>
          </form>
        </div>
        <div className="card">
          <h3>Your Contacts ({contacts.length})</h3>
          <div style={{ marginTop: '16px' }}>
            {contacts.map(c => (
              <div key={c.id} className="contact-item">
                <div>
                  <strong>{c.name}</strong> {c.relationship && <>({c.relationship})</>}<br />
                  <small>{c.phone} • {c.email}</small>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button onClick={() => startEdit(c)} className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '0.8rem' }}>Edit</button>
                  <button onClick={() => deleteContact(c.id)} className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '0.8rem' }}>Del</button>
                </div>
              </div>
            ))}
            {contacts.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No contacts added yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────── JOURNEY MODE ───────── */

function Journey() {
  const [journeys, setJourneys] = useState([]);
  const [form, setForm] = useState({ startLocation: '', destination: '', expectedArrival: '' });
  const [error, setError] = useState('');

  const fetchJourneys = () => axios.get('/journeys').then(res => setJourneys(res.data)).catch(() => { });
  useEffect(() => { fetchJourneys(); }, []);

  const startJourney = async e => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        startLocation: form.startLocation,
        destination: form.destination,
        expectedArrival: form.expectedArrival ? new Date(form.expectedArrival).toISOString() : null
      };
      await axios.post('/journeys', payload);
      setForm({ startLocation: '', destination: '', expectedArrival: '' });
      fetchJourneys();
    } catch (err) {
      setError(err.response?.data?.message || JSON.stringify(err.response?.data) || 'Failed to start journey.');
    }
  };

  const completeJourney = async id => {
    try {
      await axios.put(`/journeys/${id}/complete`);
      fetchJourneys();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete journey.');
    }
  };

  const cancelJourney = async id => {
    if (window.confirm('Cancel this journey?')) {
      try {
        await axios.put(`/journeys/${id}/cancel`);
        fetchJourneys();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to cancel journey.');
      }
    }
  };

  const active = journeys.filter(j => j.status === 'ACTIVE');
  const past = journeys.filter(j => j.status !== 'ACTIVE');

  return (
    <div>
      <h2 className="card-title">Journey Mode</h2>
      {error && <div className="alert-message alert-error" style={{ marginBottom: '16px' }}>{error}</div>}
      <div className="grid">
        <div className="card">
          <h3>Start a Journey</h3>
          <form onSubmit={startJourney} style={{ marginTop: '16px' }}>
            <input className="form-input" style={{ marginBottom: '10px' }} placeholder="Start Location" required value={form.startLocation} onChange={e => setForm({ ...form, startLocation: e.target.value })} />
            <input className="form-input" style={{ marginBottom: '10px' }} placeholder="Destination" required value={form.destination} onChange={e => setForm({ ...form, destination: e.target.value })} />
            <label className="form-label" style={{ marginBottom: '4px', fontSize: '0.85rem' }}>Expected Arrival (optional)</label>
            <input className="form-input" type="datetime-local" style={{ marginBottom: '10px' }} value={form.expectedArrival} onChange={e => setForm({ ...form, expectedArrival: e.target.value })} />
            <button className="btn btn-primary">Start Journey</button>
          </form>
        </div>

        <div className="card">
          <h3>Active Journeys ({active.length})</h3>
          <div style={{ marginTop: '16px' }}>
            {active.map(j => (
              <div key={j.id} className="contact-item" style={{ borderLeft: '4px solid var(--accent)' }}>
                <div>
                  <strong>{j.startLocation} → {j.destination}</strong><br />
                  <small style={{ color: 'var(--text-muted)' }}>
                    Started: {j.createdAt ? new Date(j.createdAt).toLocaleString() : '—'}
                    {j.expectedArrival ? ` • ETA: ${new Date(j.expectedArrival).toLocaleString()}` : ''}
                  </small>
                </div>
                <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                  <button onClick={() => completeJourney(j.id)} className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '0.8rem' }} title="Complete"><CheckCircle size={14} /></button>
                  <button onClick={() => cancelJourney(j.id)} className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '0.8rem' }} title="Cancel"><XCircle size={14} /></button>
                </div>
              </div>
            ))}
            {active.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No active journeys.</p>}
          </div>

          {past.length > 0 && (
            <>
              <h3 style={{ marginTop: '20px' }}>Past Journeys</h3>
              <div style={{ marginTop: '10px' }}>
                {past.slice(0, 10).map(j => (
                  <div key={j.id} className="contact-item" style={{ borderLeft: `4px solid ${j.status === 'COMPLETED' ? '#22c55e' : '#94a3b8'}` }}>
                    <div>
                      <strong>{j.startLocation} → {j.destination}</strong><br />
                      <small style={{ color: 'var(--text-muted)' }}>{j.status} • {j.createdAt ? new Date(j.createdAt).toLocaleString() : ''}</small>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ───────── LOCATION ───────── */

function LocationPage() {
  const [loc, setLoc] = useState(null);
  const [saved, setSaved] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [latest, setLatest] = useState(null);

  useEffect(() => {
    axios.get('/location/latest').then(res => setLatest(res.data)).catch(() => { });
  }, []);

  const getLocation = () => {
    setError('');
    setLoading(true);
    setSaved(null);
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        const coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude, accuracy: pos.coords.accuracy };
        setLoc(coords);
        setLoading(false);
      },
      err => {
        if (err.code === 1) setError('Location permission denied. Please allow location access in your browser settings.');
        else if (err.code === 2) setError('Location unavailable. Your device could not determine its position.');
        else if (err.code === 3) setError('Location request timed out. Please try again.');
        else setError('Unknown location error.');
        setLoading(false);
      },
      { timeout: 10000, enableHighAccuracy: true, maximumAge: 0 }
    );
  };

  const saveLocation = async () => {
    if (!loc) return;
    setSaved(null);
    setError('');
    try {
      const { data } = await axios.post('/location', { latitude: loc.latitude, longitude: loc.longitude });
      setSaved(data);
      setLatest(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save location to server.');
    }
  };

  return (
    <div>
      <h2 className="card-title">GPS Location</h2>
      <div className="grid">
        <div className="card">
          <h3>Your Location</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px', marginBottom: '16px' }}>Click the button below to request your browser&apos;s GPS coordinates.</p>
          <button onClick={getLocation} disabled={loading} className="btn btn-primary">
            <Navigation size={16} /> {loading ? 'Getting location...' : 'Enable Location'}
          </button>
          {error && <div className="alert-message alert-error" style={{ marginTop: '16px' }}>{error}</div>}
          {loc && (
            <div style={{ marginTop: '16px', padding: '16px', background: '#f1f5f9', borderRadius: '8px' }}>
              <p><strong>Latitude:</strong> {loc.latitude.toFixed(6)}</p>
              <p><strong>Longitude:</strong> {loc.longitude.toFixed(6)}</p>
              <p><strong>Accuracy:</strong> {loc.accuracy.toFixed(1)} meters</p>
              <button onClick={saveLocation} className="btn btn-primary" style={{ marginTop: '12px' }}>
                Save to Server
              </button>
            </div>
          )}
          {saved && (
            <div className="alert-message alert-success" style={{ marginTop: '12px' }}>
              Location saved successfully! (ID: {saved.id})
            </div>
          )}
        </div>

        <div className="card">
          <h3>Last Saved Location</h3>
          {latest ? (
            <div style={{ marginTop: '12px' }}>
              <p><strong>Lat:</strong> {latest.latitude?.toFixed(6)}</p>
              <p><strong>Lng:</strong> {latest.longitude?.toFixed(6)}</p>
              <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}><Clock size={14} style={{ verticalAlign: 'middle' }} /> {latest.timestamp ? new Date(latest.timestamp).toLocaleString() : 'N/A'}</p>
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', marginTop: '12px' }}>No saved location yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
