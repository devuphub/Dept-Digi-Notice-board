import React from 'react';
import {
  Bookmark,
  CheckCircle2,
  FileText,
  Pin,
  Pencil,
  Trash2,
  ChevronRight,
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

  const isUrgent = notice.priority === 'Urgent';
  const isImportant = notice.priority === 'Important';

  return (
    <article
      className={`notice-card ${notice.pinned ? 'is-pinned' : ''} ${
        isUrgent ? 'is-urgent' : ''
      }`}
      style={{ '--dept-color': deptColor }}
      onClick={() => onOpen(notice)}
    >
      <div className="notice-accent-bar" />

      <div className="notice-card-body">
        <div className="notice-card-top">
          <div className="notice-meta-line">
            <span className="dept-tag" style={{ color: deptColor }}>
              <span
                className="dept-tag-dot"
                style={{ backgroundColor: deptColor }}
              />
              {notice.department}
            </span>
            <span className="meta-dot">·</span>
            <span className="meta-text-label">{notice.category}</span>
            {notice.targetYear && notice.targetYear !== 'All Years' && (
              <>
                <span className="meta-dot">·</span>
                <span className="meta-text-label">{notice.targetYear}</span>
              </>
            )}
            {notice.pinned && (
              <span className="badge badge-pin">
                <Pin size={11} />
                Pinned
              </span>
            )}
            {isUrgent && (
              <span className="badge priority-urgent">
                <span className="urgent-dot" />
                Urgent
              </span>
            )}
            {isImportant && (
              <span className="badge priority-important">Important</span>
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
                <Bookmark
                  size={15}
                  fill={notice.isBookmarked ? 'currentColor' : 'none'}
                />
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
                  <Pin size={14} />
                </button>
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => onEdit(notice)}
                  title="Edit notice"
                  aria-label="Edit notice"
                >
                  <Pencil size={14} />
                </button>
                <button
                  type="button"
                  className="icon-btn danger"
                  onClick={() => onDelete(notice.id)}
                  title="Delete notice"
                  aria-label="Delete notice"
                >
                  <Trash2 size={14} />
                </button>
              </>
            )}
          </div>
        </div>

        <h3 className="notice-title">{notice.title}</h3>
        <p className="notice-excerpt">{notice.content}</p>

        <div className="notice-card-footer">
          <div className="footer-meta-left">
            <span>{notice.authorName}</span>
            <span className="meta-dot">·</span>
            <span>{formatRelativeDate(notice.createdAt)}</span>
            {notice.attachmentName && (
              <>
                <span className="meta-dot">·</span>
                <span className="attachment-inline">
                  <FileText size={13} />
                  {notice.attachmentName}
                </span>
              </>
            )}
          </div>

          <div className="footer-meta-right" onClick={(e) => e.stopPropagation()}>
            {user && (
              <button
                type="button"
                className={`ack-btn ${notice.isAcknowledged ? 'is-acked' : ''}`}
                onClick={() => onToggleAck(notice.id)}
                title="Mark as read / acknowledged"
              >
                <CheckCircle2 size={13} />
                <span>{notice.isAcknowledged ? 'Read' : 'Mark Read'}</span>
              </button>
            )}
            <span className="read-more-hint" onClick={() => onOpen(notice)}>
              View <ChevronRight size={14} />
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
