import React, { useState } from 'react';
import { X, ShieldCheck, UserCheck, GraduationCap, KeyRound } from 'lucide-react';

const DEMO_ACCOUNTS = [
  {
    role: 'Admin',
    username: 'admin',
    password: 'Admin@123',
    desc: 'Manage all departments & notices',
    icon: ShieldCheck,
  },
  {
    role: 'Faculty (CSE)',
    username: 'faculty_cse',
    password: 'Faculty@123',
    desc: 'Publish & manage CSE notices',
    icon: UserCheck,
  },
  {
    role: 'Student (CSE)',
    username: 'student',
    password: 'Student@123',
    desc: 'Read, save & acknowledge notices',
    icon: GraduationCap,
  },
];

export default function LoginModal({ isOpen, onClose, onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const submitCredentials = async (u, p) => {
    setError('');
    setLoading(true);
    try {
      await onLogin(u, p);
      onClose();
    } catch (err) {
      setError(err.message || 'Sign in failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitCredentials(username, password);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card modal-md"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-header">
          <div className="modal-title-group">
            <KeyRound size={18} />
            <h2 className="modal-title">Sign In to Notice Board</h2>
          </div>
          <button type="button" className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert-error">{error}</div>}

            <div className="form-group">
              <label htmlFor="login-username">Username</label>
              <input
                id="login-username"
                type="text"
                placeholder="Enter username (e.g. admin or student)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="demo-accounts-box">
              <p className="demo-heading">Quick Role Login (Demo Credentials)</p>
              <div className="demo-grid">
                {DEMO_ACCOUNTS.map((acc) => {
                  const Icon = acc.icon;
                  return (
                    <button
                      key={acc.username}
                      type="button"
                      className="demo-card"
                      onClick={() => {
                        setUsername(acc.username);
                        setPassword(acc.password);
                        submitCredentials(acc.username, acc.password);
                      }}
                      disabled={loading}
                    >
                      <div className="demo-card-head">
                        <Icon size={15} />
                        <strong>{acc.role}</strong>
                      </div>
                      <span className="demo-creds">
                        {acc.username} / {acc.password}
                      </span>
                      <span className="demo-desc">{acc.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
