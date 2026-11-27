import React from 'react';
import {
  Building2,
  LogIn,
  LogOut,
  Plus,
  ShieldCheck,
  UserCheck,
  GraduationCap,
} from 'lucide-react';
import { INSTITUTE_INFO } from '../config/institute';

export default function Header({
  user,
  totalNotices,
  onOpenLogin,
  onLogout,
  onOpenCreateNotice,
}) {
  const canPublish = user && (user.role === 'admin' || user.role === 'faculty');

  const roleIcon =
    user?.role === 'admin' ? (
      <ShieldCheck size={14} />
    ) : user?.role === 'faculty' ? (
      <UserCheck size={14} />
    ) : (
      <GraduationCap size={14} />
    );

  const roleLabel =
    user?.role === 'admin'
      ? 'Admin'
      : user?.role === 'faculty'
      ? `Faculty · ${user.department}`
      : user?.role === 'student'
      ? `Student · ${user.department}`
      : '';

  return (
    <header className="site-header">
      <div className="container header-inner">
        <div className="brand-block">
          <div className="brand-emblem" aria-hidden="true">
            <Building2 size={22} />
          </div>
          <div className="brand-copy">
            <div className="brand-eyebrow">
              <span className="college-name">{INSTITUTE_INFO.collegeName}</span>
              <span className="live-pill">
                <span className="live-dot" />
                {totalNotices} Live Notices
              </span>
            </div>
            <h1 className="site-title">{INSTITUTE_INFO.appTitle}</h1>
          </div>
        </div>

        <div className="header-actions">
          {canPublish && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={onOpenCreateNotice}
            >
              <Plus size={16} />
              <span>Publish Notice</span>
            </button>
          )}

          {user ? (
            <div className="user-chip-group">
              <div className="user-chip">
                <span className={`role-badge role-${user.role}`}>
                  {roleIcon}
                  <span>{roleLabel}</span>
                </span>
                <span className="user-name">{user.name}</span>
              </div>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={onLogout}
                title="Sign out"
              >
                <LogOut size={16} />
                <span className="hide-sm">Sign Out</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="btn btn-outline"
              onClick={onOpenLogin}
            >
              <LogIn size={16} />
              <span>Role Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
