import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function DepartmentModal({ isOpen, onClose, onCreate }) {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [color, setColor] = useState('#2563eb');
  const [shortDesc, setShortDesc] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await onCreate({ code, name, color, shortDesc });
      setCode('');
      setName('');
      setShortDesc('');
      onClose();
    } catch (err) {
      setError(err.message || 'Could not create department.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card modal-sm"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-header">
          <h2 className="modal-title">Add Department</h2>
          <button type="button" className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert-error">{error}</div>}
            <div className="form-group">
              <label htmlFor="dept-code">Department Code *</label>
              <input
                id="dept-code"
                type="text"
                placeholder="e.g., AI-ML"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="dept-name">Department Full Name *</label>
              <input
                id="dept-name"
                type="text"
                placeholder="e.g., CSE (Artificial Intelligence & ML)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="dept-desc">Short Description</label>
              <input
                id="dept-desc"
                type="text"
                placeholder="Brief department board description"
                value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="dept-color">Accent Color</label>
              <input
                id="dept-color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="color-input"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Creating...' : 'Create Department'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
