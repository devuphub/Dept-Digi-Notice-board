import React from 'react';
import {
  X,
  Pin,
  Calendar,
  User,
  Eye,
  CheckCircle2,
  Bookmark,
  Download,
  Clock,
} from 'lucide-react';

export default function NoticeDetailModal({
  notice,
  deptName,
  deptColor,
  user,
  onClose,
  onToggleAck,
  onToggleBookmark,
}) {
  if (!notice) return null;

  const formattedDate = new Date(notice.createdAt).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card modal-lg"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-header">
          <div className="notice-badges">
            {notice.pinned && (
              <span className="badge badge-pin">
                <Pin size={12} /> Pinned
              </span>
            )}
            <span
              className="badge badge-dept"
              style={{
                backgroundColor: `${deptColor}14`,
                color: deptColor,
                borderColor: `${deptColor}33`,
              }}
            >
              {notice.department} · {deptName}
            </span>
            <span className={`badge priority-${notice.priority.toLowerCase()}`}>
              {notice.priority}
            </span>
            <span className="badge badge-category">{notice.category}</span>
          </div>
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <h2 className="detail-title">{notice.title}</h2>

          <div className="detail-meta-bar">
            <span className="meta-item">
              <User size={14} /> Published by <strong>{notice.authorName}</strong> ({notice.authorRole})
            </span>
            <span className="meta-item">
              <Calendar size={14} /> {formattedDate}
            </span>
            {notice.targetYear && (
              <span className="meta-item">
                Target: <strong>{notice.targetYear}</strong>
              </span>
            )}
            {notice.expiresAt && (
              <span className="meta-item">
                <Clock size={14} /> Valid till {notice.expiresAt}
              </span>
            )}
          </div>

          <div className="detail-content">{notice.content}</div>

          {notice.attachmentUrl && (
            <div className="attachment-box">
              <div>
                <p className="attachment-label">Attached Circular / Document</p>
                <p className="attachment-name">{notice.attachmentName}</p>
              </div>
              <a
                href={notice.attachmentUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline"
              >
                <Download size={15} />
                <span>Open / Download</span>
              </a>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <div className="meta-left">
            <span className="meta-stat">
              <Eye size={14} /> {notice.views || 0} views
            </span>
            <span className="meta-stat">
              <CheckCircle2 size={14} /> {notice.acknowledgedCount || 0} acknowledged
            </span>
          </div>
          <div className="modal-footer-actions">
            {user && (
              <>
                <button
                  type="button"
                  className={`btn ${notice.isBookmarked ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => onToggleBookmark(notice.id)}
                >
                  <Bookmark size={15} fill={notice.isBookmarked ? 'currentColor' : 'none'} />
                  <span>{notice.isBookmarked ? 'Saved' : 'Save Notice'}</span>
                </button>
                <button
                  type="button"
                  className={`btn ${notice.isAcknowledged ? 'btn-success' : 'btn-primary'}`}
                  onClick={() => onToggleAck(notice.id)}
                >
                  <CheckCircle2 size={15} />
                  <span>{notice.isAcknowledged ? 'Acknowledged' : 'Mark as Read'}</span>
                </button>
              </>
            )}
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
