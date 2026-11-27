import React, { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';

const CATEGORIES = ['Academic', 'Exam', 'Placement', 'Events', 'Circular', 'Holiday'];
const PRIORITIES = ['Urgent', 'Important', 'Normal'];
const YEARS = ['All Years', '1st Year', '2nd Year', '3rd Year', '4th Year'];

export default function NoticeFormModal({
  isOpen,
  initialNotice,
  departments,
  user,
  onClose,
  onSave,
}) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [department, setDepartment] = useState('CSE');
  const [category, setCategory] = useState('Academic');
  const [priority, setPriority] = useState('Normal');
  const [targetYear, setTargetYear] = useState('All Years');
  const [pinned, setPinned] = useState(false);
  const [expiresAt, setExpiresAt] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const allowedDepartments =
    user?.role === 'faculty'
      ? departments.filter(
          (d) => d.code === user.department || d.code === 'General'
        )
      : departments;

  useEffect(() => {
    if (!isOpen) return;
    if (initialNotice) {
      setTitle(initialNotice.title || '');
      setContent(initialNotice.content || '');
      setDepartment(initialNotice.department || 'General');
      setCategory(initialNotice.category || 'Academic');
      setPriority(initialNotice.priority || 'Normal');
      setTargetYear(initialNotice.targetYear || 'All Years');
      setPinned(Boolean(initialNotice.pinned));
      setExpiresAt(initialNotice.expiresAt || '');
    } else {
      setTitle('');
      setContent('');
      setDepartment(
        user?.role === 'faculty'
          ? user.department
          : departments[1]?.code || 'General'
      );
      setCategory('Academic');
      setPriority('Normal');
      setTargetYear('All Years');
      setPinned(false);
      setExpiresAt('');
    }
    setFile(null);
    setError('');
  }, [isOpen, initialNotice, user, departments]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!title.trim() || !content.trim()) {
      setError('Please enter both a notice title and description.');
      return;
    }

    const fd = new FormData();
    fd.append('title', title.trim());
    fd.append('content', content.trim());
    fd.append('department', department);
    fd.append('category', category);
    fd.append('priority', priority);
    fd.append('targetYear', targetYear);
    fd.append('pinned', String(pinned));
    if (expiresAt) fd.append('expiresAt', expiresAt);
    if (file) fd.append('attachment', file);

    setSaving(true);
    try {
      await onSave(fd, initialNotice?.id);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save notice.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card modal-lg"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-header">
          <h2 className="modal-title">
            {initialNotice ? 'Edit Notice' : 'Publish New Department Notice'}
          </h2>
          <button type="button" className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body form-grid">
            {error && <div className="alert-error">{error}</div>}

            <div className="form-group full-span">
              <label htmlFor="notice-title">Notice Title *</label>
              <input
                id="notice-title"
                type="text"
                placeholder="e.g., End-Semester Practical Schedule — CSE"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="notice-dept">Department *</label>
              <select
                id="notice-dept"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                {allowedDepartments.map((d) => (
                  <option key={d.code} value={d.code}>
                    {d.code} — {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="notice-category">Category</label>
              <select
                id="notice-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="notice-priority">Priority</label>
              <select
                id="notice-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="notice-year">Target Year</label>
              <select
                id="notice-year"
                value={targetYear}
                onChange={(e) => setTargetYear(e.target.value)}
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group full-span">
              <label htmlFor="notice-content">Notice Content *</label>
              <textarea
                id="notice-content"
                rows={5}
                placeholder="Write the complete official circular details, dates, venue, and instructions..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="notice-expiry">Valid Until (Optional)</label>
              <input
                id="notice-expiry"
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="notice-file">Attachment (PDF / Image, max 5MB)</label>
              <label className="file-upload-box" htmlFor="notice-file">
                <Upload size={15} />
                <span>
                  {file
                    ? file.name
                    : initialNotice?.attachmentName || 'Choose PDF or image'}
                </span>
                <input
                  id="notice-file"
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.webp,.txt"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </label>
            </div>

            <div className="form-group full-span">
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={pinned}
                  onChange={(e) => setPinned(e.target.checked)}
                />
                <span>Pin this notice to the top of the notice board</span>
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving
                ? 'Saving...'
                : initialNotice
                ? 'Update Notice'
                : 'Publish Notice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
