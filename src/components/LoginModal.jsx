import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  UserCheck,
  GraduationCap,
  KeyRound,
  Eye,
  EyeOff,
  ArrowRight,
} from 'lucide-react';
import { INSTITUTE_INFO } from '../config/institute';

const DEMO_ACCOUNTS = [
  {
    role: 'Admin',
    username: 'admin',
    password: 'Admin@123',
    desc: 'Full control over all departments & notices',
    badgeClass: 'role-admin',
    icon: ShieldCheck,
  },
  {
    role: 'Faculty (CSE)',
    username: 'faculty_cse',
    password: 'Faculty@123',
    desc: 'Publish, edit & pin CSE & General notices',
    badgeClass: 'role-faculty',
    icon: UserCheck,
  },
  {
    role: 'Student (CSE)',
    username: 'student',
    password: 'Student@123',
    desc: 'Save bookmarks & mark notices as read',
    badgeClass: 'role-student',
    icon: GraduationCap,
  },
];

export default function LoginModal({ isOpen, onClose, onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
        className="modal-card modal-md login-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-header login-modal-header">
          <div className="login-header-content">
            <div className="login-icon-badge" aria-hidden="true">
              <KeyRound size={18} />
            </div>
            <div>
              <h2 className="modal-title">Sign In to {INSTITUTE_INFO.portalName}</h2>
              <p className="modal-subtitle">
                Choose your role or enter your {INSTITUTE_INFO.collegeName} credentials
              </p>
            </div>
          </div>
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label="Close sign in dialog"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert-error">{error}</div>}

            <div className="login-fields">
              <div className="form-group">
                <label htmlFor="login-username">Username</label>
                <input
                  id="login-username"
                  type="text"
                  placeholder="e.g. admin, faculty_cse, or student"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="login-password">Password</label>
                <div className="password-input-wrap">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={loading}
              >
                <span>{loading ? 'Signing in...' : 'Sign In'}</span>
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="demo-accounts-box">
              <p className="demo-heading">Quick Role Sign-In</p>
              <div className="demo-list">
                {DEMO_ACCOUNTS.map((acc) => {
                  const Icon = acc.icon;
                  return (
                    <button
                      key={acc.username}
                      type="button"
                      className="demo-row"
                      onClick={() => {
                        setUsername(acc.username);
                        setPassword(acc.password);
                        submitCredentials(acc.username, acc.password);
                      }}
                      disabled={loading}
                    >
                      <span className={`demo-row-icon ${acc.badgeClass}`}>
                        <Icon size={16} />
                      </span>
                      <div className="demo-row-info">
                        <div className="demo-row-top">
                          <strong>{acc.role}</strong>
                          <span className="demo-creds-pill">
                            {acc.username} / {acc.password}
                          </span>
                        </div>
                        <span className="demo-row-desc">{acc.desc}</span>
                      </div>
                      <span className="demo-row-action">
                        Login <ArrowRight size={13} />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
