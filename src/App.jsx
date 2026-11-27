import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Search,
  Filter,
  Bookmark,
  Layers,
  AlertTriangle,
  Pin,
  Plus,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { api, getStoredToken, setStoredToken } from './api';
import Header from './components/Header';
import Footer from './components/Footer';
import NoticeCard from './components/NoticeCard';
import NoticeDetailModal from './components/NoticeDetailModal';
import NoticeFormModal from './components/NoticeFormModal';
import LoginModal from './components/LoginModal';
import DepartmentModal from './components/DepartmentModal';

const CATEGORIES = ['All', 'Academic', 'Exam', 'Placement', 'Events', 'Circular', 'Holiday'];
const PRIORITIES = ['All', 'Urgent', 'Important', 'Normal'];
const YEARS = ['All', '1st Year', '2nd Year', '3rd Year', '4th Year'];

export default function App() {
  const [user, setUser] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [totalNotices, setTotalNotices] = useState(0);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Filters
  const [selectedDept, setSelectedDept] = useState('All');
  const [category, setCategory] = useState('All');
  const [priority, setPriority] = useState('All');
  const [targetYear, setTargetYear] = useState('All');
  const [search, setSearch] = useState('');
  const [onlyBookmarked, setOnlyBookmarked] = useState(false);

  // Modals
  const [loginOpen, setLoginOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [activeNotice, setActiveNotice] = useState(null);
  const [deptModalOpen, setDeptModalOpen] = useState(false);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3200);
  }, []);

  const loadDepartments = useCallback(async () => {
    const data = await api.getDepartments();
    setDepartments(data.departments || []);
    setTotalNotices(data.totalNotices || 0);
  }, []);

  const loadNotices = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getNotices({
        department: selectedDept,
        category,
        priority,
        targetYear,
        search,
        bookmarked: onlyBookmarked ? 'true' : 'false',
      });
      setNotices(data.notices || []);
    } catch (err) {
      showToast(err.message || 'Failed to load notices.', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedDept, category, priority, targetYear, search, onlyBookmarked, showToast]);

  // Restore session on mount
  useEffect(() => {
    const init = async () => {
      if (getStoredToken()) {
        try {
          const { user: currentUser } = await api.me();
          setUser(currentUser);
        } catch {
          setStoredToken(null);
        }
      }
      await loadDepartments().catch(() => {});
    };
    init();
  }, [loadDepartments]);

  useEffect(() => {
    loadNotices();
  }, [loadNotices, user]);

  const deptMap = useMemo(() => {
    const map = {};
    for (const d of departments) {
      map[d.code] = d;
    }
    return map;
  }, [departments]);

  const activeDeptInfo =
    selectedDept === 'All'
      ? {
          code: 'All',
          name: 'All Departments Notice Feed',
          shortDesc: 'Browse official academic, examination, placement, and event circulars across all departments at ABESEC Ghaziabad.',
          color: '#1e3a8a',
        }
      : deptMap[selectedDept] || {
          code: selectedDept,
          name: selectedDept,
          shortDesc: '',
          color: '#2563eb',
        };

  const urgentCount = notices.filter((n) => n.priority === 'Urgent').length;
  const pinnedCount = notices.filter((n) => n.pinned).length;

  const handleLogin = async (username, password) => {
    const { token, user: loggedInUser } = await api.login(username, password);
    setStoredToken(token);
    setUser(loggedInUser);
    showToast(`Signed in as ${loggedInUser.name} (${loggedInUser.role})`, 'success');
  };

  const handleLogout = () => {
    setStoredToken(null);
    setUser(null);
    setOnlyBookmarked(false);
    showToast('Signed out successfully.');
  };

  const handleOpenNotice = async (notice) => {
    setActiveNotice(notice);
    try {
      const { views } = await api.recordView(notice.id);
      setNotices((prev) =>
        prev.map((n) => (n.id === notice.id ? { ...n, views } : n))
      );
      setActiveNotice((prev) => (prev?.id === notice.id ? { ...prev, views } : prev));
    } catch {
      // ignore view count errors
    }
  };

  const handleSaveNotice = async (formData, id) => {
    if (id) {
      await api.updateNotice(id, formData);
      showToast('Notice updated successfully.', 'success');
    } else {
      await api.createNotice(formData);
      showToast('Notice published to board.', 'success');
    }
    await Promise.all([loadNotices(), loadDepartments()]);
  };

  const handleDeleteNotice = async (id) => {
    if (!window.confirm('Delete this notice permanently?')) return;
    try {
      await api.deleteNotice(id);
      if (activeNotice?.id === id) setActiveNotice(null);
      showToast('Notice removed.', 'info');
      await Promise.all([loadNotices(), loadDepartments()]);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleTogglePin = async (id) => {
    try {
      const { pinned } = await api.togglePin(id);
      showToast(pinned ? 'Notice pinned to top.' : 'Notice unpinned.');
      await loadNotices();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleToggleBookmark = async (id) => {
    try {
      const { isBookmarked } = await api.toggleBookmark(id);
      setNotices((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isBookmarked } : n))
      );
      setActiveNotice((prev) =>
        prev?.id === id ? { ...prev, isBookmarked } : prev
      );
      showToast(isBookmarked ? 'Saved to bookmarks.' : 'Removed from bookmarks.');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleToggleAck = async (id) => {
    try {
      const { isAcknowledged, acknowledgedCount } = await api.toggleAcknowledge(id);
      setNotices((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, isAcknowledged, acknowledgedCount } : n
        )
      );
      setActiveNotice((prev) =>
        prev?.id === id ? { ...prev, isAcknowledged, acknowledgedCount } : prev
      );
      showToast(isAcknowledged ? 'Notice marked as read.' : 'Acknowledgement removed.');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleCreateDepartment = async (payload) => {
    await api.createDepartment(payload);
    showToast(`Department ${payload.code.toUpperCase()} added.`, 'success');
    await loadDepartments();
  };

  const resetFilters = () => {
    setSelectedDept('All');
    setCategory('All');
    setPriority('All');
    setTargetYear('All');
    setSearch('');
    setOnlyBookmarked(false);
  };

  const hasActiveFilters =
    selectedDept !== 'All' ||
    category !== 'All' ||
    priority !== 'All' ||
    targetYear !== 'All' ||
    search.trim() !== '' ||
    onlyBookmarked;

  return (
    <div className="app-shell">
      <Header
        user={user}
        totalNotices={totalNotices}
        onOpenLogin={() => setLoginOpen(true)}
        onLogout={handleLogout}
        onOpenCreateNotice={() => {
          setEditingNotice(null);
          setFormOpen(true);
        }}
      />

      <main className="main-content container">
        <div className="board-layout">
          {/* Left Department Rail */}
          <aside className="dept-sidebar" aria-label="Departments">
            <div className="sidebar-header">
              <div className="sidebar-title-row">
                <Layers size={16} />
                <h2>Departments</h2>
              </div>
              {user?.role === 'admin' && (
                <button
                  type="button"
                  className="btn-inline-add"
                  onClick={() => setDeptModalOpen(true)}
                  title="Add new department"
                >
                  <Plus size={14} /> Add
                </button>
              )}
            </div>

            <nav className="dept-list">
              <button
                type="button"
                className={`dept-item ${selectedDept === 'All' ? 'active' : ''}`}
                onClick={() => setSelectedDept('All')}
              >
                <span className="dept-dot" style={{ backgroundColor: '#1e3a8a' }} />
                <span className="dept-label">All Departments</span>
                <span className="dept-count">{totalNotices}</span>
              </button>

              {departments.map((dept) => (
                <button
                  key={dept.code}
                  type="button"
                  className={`dept-item ${selectedDept === dept.code ? 'active' : ''}`}
                  onClick={() => setSelectedDept(dept.code)}
                >
                  <span
                    className="dept-dot"
                    style={{ backgroundColor: dept.color }}
                  />
                  <span className="dept-label">
                    <strong>{dept.code}</strong>
                    <small>{dept.name}</small>
                  </span>
                  <span className="dept-count">{dept.noticeCount || 0}</span>
                </button>
              ))}
            </nav>

            {user?.role === 'student' && (
              <div className="student-quick-box">
                <p className="quick-box-title">
                  <Sparkles size={14} /> My Department
                </p>
                <p className="quick-box-desc">
                  Jump directly to <strong>{user.department}</strong> notices or saved items.
                </p>
                <div className="quick-box-actions">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline"
                    onClick={() => setSelectedDept(user.department)}
                  >
                    {user.department} Feed
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${onlyBookmarked ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setOnlyBookmarked((v) => !v)}
                  >
                    Saved
                  </button>
                </div>
              </div>
            )}
          </aside>

          {/* Main Notice Feed */}
          <section className="feed-column">
            <div
              className="dept-banner"
              style={{ '--banner-accent': activeDeptInfo.color }}
            >
              <div className="banner-glow" aria-hidden="true" />
              <div className="dept-banner-copy">
                <div className="banner-kicker">
                  <span
                    className="kicker-dot"
                    style={{ backgroundColor: activeDeptInfo.color }}
                  />
                  <span>
                    {selectedDept === 'All'
                      ? 'ABESEC Ghaziabad · Central Notice Feed'
                      : `${activeDeptInfo.code} Department Board`}
                  </span>
                </div>
                <h2 className="banner-title">{activeDeptInfo.name}</h2>
                {activeDeptInfo.shortDesc && (
                  <p className="banner-desc">{activeDeptInfo.shortDesc}</p>
                )}
              </div>

              <div className="banner-stats">
                <div className="stat-pill">
                  <span className="stat-num">{notices.length}</span>
                  <span className="stat-lbl">Notices</span>
                </div>
                <div className="stat-pill stat-pin">
                  <Pin size={14} />
                  <span className="stat-num">{pinnedCount}</span>
                  <span className="stat-lbl">Pinned</span>
                </div>
                <div className="stat-pill stat-urgent">
                  <AlertTriangle size={14} />
                  <span className="stat-num">{urgentCount}</span>
                  <span className="stat-lbl">Urgent</span>
                </div>
              </div>
            </div>

            {/* Filter & Search Toolbar */}
            <div className="filter-toolbar">
              <div className="search-box">
                <Search size={16} className="search-icon" />
                <input
                  type="search"
                  placeholder="Search notices by title, keyword, or faculty..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="filter-selects">
                <div className="select-wrap">
                  <Filter size={14} />
                  <select
                    aria-label="Filter by category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c === 'All' ? 'All Categories' : c}
                      </option>
                    ))}
                  </select>
                </div>

                <select
                  aria-label="Filter by priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p === 'All' ? 'All Priorities' : p}
                    </option>
                  ))}
                </select>

                <select
                  aria-label="Filter by target year"
                  value={targetYear}
                  onChange={(e) => setTargetYear(e.target.value)}
                >
                  {YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y === 'All' ? 'All Years' : y}
                    </option>
                  ))}
                </select>

                {user && (
                  <button
                    type="button"
                    className={`btn btn-sm ${onlyBookmarked ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setOnlyBookmarked((v) => !v)}
                  >
                    <Bookmark size={14} />
                    <span>Saved</span>
                  </button>
                )}

                {hasActiveFilters && (
                  <button
                    type="button"
                    className="btn btn-sm btn-ghost"
                    onClick={resetFilters}
                    title="Reset all filters"
                  >
                    <RotateCcw size={14} />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>

            {/* Notices Grid */}
            {loading ? (
              <div className="notices-grid">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="notice-skeleton" />
                ))}
              </div>
            ) : notices.length === 0 ? (
              <div className="empty-state">
                <h3>No notices match your current filters</h3>
                <p>
                  Try switching the department or clearing your search and category
                  filters.
                </p>
                {hasActiveFilters && (
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={resetFilters}
                  >
                    Show All Notices
                  </button>
                )}
              </div>
            ) : (
              <div className="notices-grid">
                {notices.map((notice) => (
                  <NoticeCard
                    key={notice.id}
                    notice={notice}
                    deptColor={deptMap[notice.department]?.color || '#2563eb'}
                    user={user}
                    onOpen={handleOpenNotice}
                    onEdit={(item) => {
                      setEditingNotice(item);
                      setFormOpen(true);
                    }}
                    onDelete={handleDeleteNotice}
                    onTogglePin={handleTogglePin}
                    onToggleBookmark={handleToggleBookmark}
                    onToggleAck={handleToggleAck}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />

      {/* Modals */}
      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onLogin={handleLogin}
      />

      <NoticeFormModal
        isOpen={formOpen}
        initialNotice={editingNotice}
        departments={departments}
        user={user}
        onClose={() => {
          setFormOpen(false);
          setEditingNotice(null);
        }}
        onSave={handleSaveNotice}
      />

      <NoticeDetailModal
        notice={activeNotice}
        deptName={deptMap[activeNotice?.department]?.name || activeNotice?.department}
        deptColor={deptMap[activeNotice?.department]?.color || '#2563eb'}
        user={user}
        onClose={() => setActiveNotice(null)}
        onToggleAck={handleToggleAck}
        onToggleBookmark={handleToggleBookmark}
      />

      <DepartmentModal
        isOpen={deptModalOpen}
        onClose={() => setDeptModalOpen(false)}
        onCreate={handleCreateDepartment}
      />

      {toast && (
        <div className={`toast toast-${toast.type}`} role="status">
          {toast.message}
        </div>
      )}
    </div>
  );
}
