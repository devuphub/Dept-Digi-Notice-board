import React from 'react';
import {
  Bookmark,
  CheckCircle2,
  Eye,
  FileText,
  Pin,
  Pencil,
  Trash2,
  Calendar,
  User,
} from 'lucide-react';

function formatRelativeDate(isoString) {
  const date = new Date(isoString);
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function NoticeCard({
  notice,
  deptColor,
  user,
  onOpen,
  onEdit,
  onDelete,
  onTogglePin,
  onToggleBookmark,
  onToggleAck,
}) {
  const canManage =
    user &&
    (user.role === 'admin' ||
      (user.role === 'faculty' &&
        (user.department === notice.department || notice.authorId === user.id)));

  const priorityClass = `priority-${notice.priority.toLowerCase()}`;

  return (
    <article
      className={`notice-card ${notice.pinned ? 'is-pinned' : ''}`}
      onClick={() => onOpen(notice)}
    >
      <div className="notice-card-top">
        <div className="notice-badges">
          {notice.pinned && (
            <span className="badge badge-pin">
              <Pin size={12} />
              Pinned
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
            {notice.department}
          </span>
          <span className={`badge ${priorityClass}`}>{notice.priority}</span>
          <span className="badge badge-category">{notice.category}</span>
          {notice.targetYear && notice.targetYear !== 'All Years' && (
            <span className="badge badge-year">{notice.targetYear}</span>
          )}
        </div>

        <div
          className="notice-card-actions"
          onClick={(e) => e.stopPropagation()}
        >
          {user && (
            <button
              type="button"
              className={`icon-btn ${notice.isBookmarked ? 'active-bookmark' : ''}`}
              onClick={() => onToggleBookmark(notice.id)}
              title={notice.isBookmarked ? 'Remove bookmark' : 'Save notice'}
              aria-label="Bookmark notice"
            >
              <Bookmark size={16} fill={notice.isBookmarked ? 'currentColor' : 'none'} />
            </button>
          )}
          {canManage && (
            <>
              <button
                type="button"
                className={`icon-btn ${notice.pinned ? 'active-pin' : ''}`}
                onClick={() => onTogglePin(notice.id)}
                title={notice.pinned ? 'Unpin notice' : 'Pin notice'}
                aria-label="Pin notice"
              >
                <Pin size={15} />
              </button>
              <button
                type="button"
                className="icon-btn"
                onClick={() => onEdit(notice)}
                title="Edit notice"
                aria-label="Edit notice"
              >
                <Pencil size={15} />
              </button>
              <button
                type="button"
                className="icon-btn danger"
                onClick={() => onDelete(notice.id)}
                title="Delete notice"
                aria-label="Delete notice"
              >
                <Trash2 size={15} />
              </button>
            </>
          )}
        </div>
      </div>

      <h3 className="notice-title">{notice.title}</h3>
      <p className="notice-excerpt">{notice.content}</p>

      <div className="notice-card-meta">
        <div className="meta-left">
          <span className="meta-item">
            <User size={13} />
            {notice.authorName}
          </span>
          <span className="meta-item">
            <Calendar size={13} />
            {formatRelativeDate(notice.createdAt)}
          </span>
          {notice.attachmentName && (
            <span className="meta-item attachment-pill">
              <FileText size={13} />
              {notice.attachmentName}
            </span>
          )}
        </div>

        <div className="meta-right" onClick={(e) => e.stopPropagation()}>
          <span className="meta-stat" title="Views">
            <Eye size={13} />
            {notice.views || 0}
          </span>
          {user ? (
            <button
              type="button"
              className={`ack-btn ${notice.isAcknowledged ? 'is-acked' : ''}`}
              onClick={() => onToggleAck(notice.id)}
              title="Mark as read / acknowledged"
            >
              <CheckCircle2 size={14} />
              <span>
                {notice.isAcknowledged ? 'Read' : 'Acknowledge'} ({notice.acknowledgedCount || 0})
              </span>
            </button>
          ) : (
            <span className="meta-stat" title="Acknowledgements">
              <CheckCircle2 size={13} />
              {notice.acknowledgedCount || 0}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
